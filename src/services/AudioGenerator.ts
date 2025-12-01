import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

export class AudioGenerator {
  /**
   * Google TTS로 음성 생성 (무료!)
   */
  async generate(text: string, outputPath: string, lang: string = 'ko'): Promise<string> {
    console.log('🎤 Google TTS로 음성 생성 중... (무료)');

    return new Promise((resolve, reject) => {
      // Windows 경로를 슬래시로 변환
      const outputPathEscaped = outputPath.replace(/\\/g, '/');

      // Python 스크립트를 stdin으로 전달
      const pythonScript = `# -*- coding: utf-8 -*-
from gtts import gTTS

text = """${text}"""
output_path = r"${outputPathEscaped}"

tts = gTTS(text, lang='${lang}')
tts.save(output_path)
print("TTS 완료")
`;

      const pythonProcess = spawn('python', ['-c', pythonScript], {
        shell: true,
      });

      let stderr = '';

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Google TTS 실패: ${stderr}`));
        } else {
          console.log(`✅ 음성 생성 완료: ${outputPath}`);
          resolve(outputPath);
        }
      });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Python 실행 실패: ${err.message}`));
      });
    });
  }

  /**
   * 오디오 길이 가져오기 (ffprobe 사용)
   */
  async getDuration(audioPath: string): Promise<number> {
    const ffmpeg = (await import('fluent-ffmpeg')).default;
    const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
    const ffprobeInstaller = (await import('@ffprobe-installer/ffprobe')).default;

    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    ffmpeg.setFfprobePath(ffprobeInstaller.path);

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration || 0);
      });
    });
  }
}
