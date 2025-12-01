import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class AudioGenerator {
  private openai: OpenAI;
  private elevenLabsApiKey?: string;

  constructor(openaiApiKey: string, elevenLabsApiKey?: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.elevenLabsApiKey = elevenLabsApiKey;
  }

  /**
   * Microsoft Edge TTS를 사용하여 음성 생성 (무료!)
   */
  async generateWithEdgeTTS(
    text: string,
    outputPath: string,
    voice: string = 'ko-KR-SunHiNeural' // 한국어 여성 목소리
  ): Promise<string> {
    try {
      // Windows와 호환되도록 python -m 형식으로 실행
      const command = `python -m edge_tts --voice "${voice}" --text "${text.replace(/"/g, '\\"')}" --write-media "${outputPath}"`;

      await execAsync(command);

      return outputPath;
    } catch (error) {
      throw new Error(`Edge TTS 음성 생성 실패: ${error}`);
    }
  }

  /**
   * Edge TTS 사용 가능한 한국어 음성 목록
   */
  getEdgeTTSKoreanVoices(): Array<{ name: string; voice: string; gender: string }> {
    return [
      { name: '선희 (여성, 밝음)', voice: 'ko-KR-SunHiNeural', gender: 'Female' },
      { name: '인준 (남성, 안정)', voice: 'ko-KR-InJoonNeural', gender: 'Male' },
      { name: '보현 (남성, 젊음)', voice: 'ko-KR-BongJinNeural', gender: 'Male' },
      { name: '구민 (남성, 차분)', voice: 'ko-KR-GookMinNeural', gender: 'Male' },
      { name: '지민 (여성, 상냥)', voice: 'ko-KR-JiMinNeural', gender: 'Female' },
    ];
  }

  /**
   * OpenAI TTS를 사용하여 음성 생성
   */
  async generateWithOpenAI(
    text: string,
    outputPath: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'
  ): Promise<string> {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: voice,
        input: text,
        speed: 1.0,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.writeFile(outputPath, buffer);

      return outputPath;
    } catch (error) {
      throw new Error(`OpenAI TTS 음성 생성 실패: ${error}`);
    }
  }

  /**
   * ElevenLabs API를 사용하여 고품질 음성 생성
   */
  async generateWithElevenLabs(
    text: string,
    outputPath: string,
    voiceId: string = '21m00Tcm4TlvDq8ikWAM' // Rachel (영어 기본)
  ): Promise<string> {
    if (!this.elevenLabsApiKey) {
      throw new Error('ElevenLabs API 키가 설정되지 않았습니다.');
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        }
      );

      await fs.writeFile(outputPath, Buffer.from(response.data));
      return outputPath;
    } catch (error) {
      throw new Error(`ElevenLabs 음성 생성 실패: ${error}`);
    }
  }

  /**
   * 텍스트를 여러 세그먼트로 나누어 음성 생성
   * (긴 텍스트의 경우 부분별로 나누어 생성)
   */
  async generateSegments(
    textSegments: string[],
    outputDir: string,
    provider: 'openai' | 'elevenlabs' | 'edge' = 'edge',
    voice?: string
  ): Promise<string[]> {
    const audioPaths: string[] = [];

    for (let i = 0; i < textSegments.length; i++) {
      const outputPath = path.join(outputDir, `segment_${i}.mp3`);

      if (provider === 'openai') {
        await this.generateWithOpenAI(
          textSegments[i],
          outputPath,
          (voice as any) || 'nova'
        );
      } else if (provider === 'elevenlabs') {
        await this.generateWithElevenLabs(
          textSegments[i],
          outputPath,
          voice
        );
      } else if (provider === 'edge') {
        await this.generateWithEdgeTTS(
          textSegments[i],
          outputPath,
          voice || 'ko-KR-SunHiNeural'
        );
      }

      audioPaths.push(outputPath);
    }

    return audioPaths;
  }

  /**
   * 음성 파일의 길이 가져오기 (초)
   * Note: 실제 구현시 ffprobe 등의 도구 필요
   */
  async getAudioDuration(audioPath: string): Promise<number> {
    // 간단한 추정: OpenAI TTS는 대략 글자 수 기준 예측
    // 실제 프로덕션에서는 ffprobe를 사용하여 정확한 길이 측정
    try {
      const stats = await fs.stat(audioPath);
      // MP3 비트레이트 기준 대략적인 계산 (128kbps 기준)
      const durationEstimate = (stats.size * 8) / (128 * 1000);
      return durationEstimate;
    } catch (error) {
      console.warn('음성 길이 측정 실패, 기본값 사용');
      return 30; // 기본값
    }
  }

  /**
   * 자막 타이밍 정보 생성
   * (실제로는 WhisperAPI나 음성 인식을 통해 정확한 타이밍 추출)
   */
  generateSubtitleTimings(
    text: string,
    totalDuration: number
  ): Array<{ text: string; start: number; end: number }> {
    const sentences = text
      .split(/[.!?。！？]\s*/)
      .filter(s => s.trim().length > 0);

    const timingsPerSentence = totalDuration / sentences.length;

    return sentences.map((sentence, index) => ({
      text: sentence.trim(),
      start: index * timingsPerSentence,
      end: (index + 1) * timingsPerSentence
    }));
  }
}
