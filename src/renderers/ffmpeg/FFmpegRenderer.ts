import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import { SubtitleGenerator, SubtitleSegment } from './SubtitleGenerator.js';
import { AudioMixer } from './AudioMixer.js';
import type { ShortsScript } from '../../types.js';

// FFmpeg 경로 설정
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// FFprobe 경로 설정
const ffprobePath = ffmpegInstaller.path.replace('ffmpeg.exe', 'ffprobe.exe').replace('ffmpeg', 'ffprobe');
try {
  ffmpeg.setFfprobePath(ffprobePath);
} catch (e) {
  console.warn('FFprobe 경로 설정 실패, 기본 경로 사용');
}

export interface FFmpegRenderOptions {
  script: ShortsScript;
  title: string;
  audioPath: string;
  outputPath: string;
  style?: 'modern' | 'cinematic' | 'neon' | 'glassmorphism';
  bgmPath?: string;
  bgmVolume?: number;
}

export class FFmpegRenderer {
  private subtitleGen: SubtitleGenerator;
  private audioMixer: AudioMixer;

  constructor() {
    this.subtitleGen = new SubtitleGenerator();
    this.audioMixer = new AudioMixer();
  }

  /**
   * 쇼츠 비디오 렌더링 (FFmpeg 방식)
   */
  async renderShorts(options: FFmpegRenderOptions): Promise<string> {
    const {
      script,
      title,
      audioPath,
      outputPath,
      style = 'modern',
      bgmPath,
      bgmVolume = 30,
    } = options;

    console.log('FFmpeg 렌더링 시작...');

    // 1. 오디오 길이 확인
    const audioDuration = await this.audioMixer.getDuration(audioPath);
    console.log(`오디오 길이: ${audioDuration}초`);

    // 2. 자막 세그먼트 생성
    const subtitleSegments = this.createSubtitleSegments(script, audioDuration);

    // 3. ASS 자막 파일 생성
    const assPath = outputPath.replace('.mp4', '.ass');
    const subtitleOptions = this.getSubtitleStyle(style);
    await this.subtitleGen.generateASS(subtitleSegments, assPath, subtitleOptions);
    console.log('자막 파일 생성 완료');

    // 4. BGM과 나레이션 믹싱 (옵션)
    let finalAudioPath = audioPath;
    if (bgmPath) {
      const mixedAudioPath = outputPath.replace('.mp4', '_mixed.mp3');
      finalAudioPath = await this.audioMixer.mix({
        narrationPath: audioPath,
        bgmPath,
        bgmVolume,
        outputPath: mixedAudioPath,
      });
      console.log('오디오 믹싱 완료');
    }

    // 5. 배경 비디오/이미지 생성
    const backgroundPath = await this.createBackground(audioDuration, style);
    console.log('배경 생성 완료');

    // 6. 최종 비디오 렌더링
    await this.composeVideo(
      backgroundPath,
      finalAudioPath,
      assPath,
      outputPath,
      audioDuration
    );

    console.log(`비디오 렌더링 완료: ${outputPath}`);
    return outputPath;
  }

  /**
   * 자막 세그먼트 생성
   */
  private createSubtitleSegments(
    script: ShortsScript,
    totalDuration: number
  ): SubtitleSegment[] {
    const segments: SubtitleSegment[] = [];
    let currentTime = 0;

    // 훅 (3초)
    const hookDuration = 3;
    segments.push({
      text: script.hook,
      start: currentTime,
      end: currentTime + hookDuration,
    });
    currentTime += hookDuration;

    // 메인 콘텐츠 (균등 분배)
    const contentDuration = (totalDuration - hookDuration - 5) / script.mainContent.length;
    script.mainContent.forEach((content) => {
      segments.push({
        text: content,
        start: currentTime,
        end: currentTime + contentDuration,
      });
      currentTime += contentDuration;
    });

    // 결론 (마지막 5초)
    segments.push({
      text: script.conclusion,
      start: currentTime,
      end: totalDuration,
    });

    return segments;
  }

  /**
   * 스타일별 자막 옵션
   */
  private getSubtitleStyle(style: string) {
    const styles = {
      modern: {
        fontSize: 90,
        primaryColor: '&H00FFFFFF',
        outlineColor: '&H00764ba2',
        outline: 3,
        shadow: 2,
      },
      cinematic: {
        fontSize: 100,
        primaryColor: '&H00FFD700', // 금색
        outlineColor: '&H00000000',
        outline: 4,
        shadow: 3,
      },
      neon: {
        fontSize: 95,
        primaryColor: '&H0000FFFF', // 시안
        outlineColor: '&H00FF00FF', // 마젠타
        outline: 2,
        shadow: 0,
      },
      glassmorphism: {
        fontSize: 90,
        primaryColor: '&H00FFFFFF',
        outlineColor: '&H00FFFFFF',
        backgroundColor: '&H40000000', // 더 투명
        outline: 2,
        shadow: 1,
      },
    };

    return styles[style] || styles.modern;
  }

  /**
   * 배경 생성 (단색 또는 그라데이션)
   */
  private async createBackground(
    duration: number,
    style: string
  ): Promise<string> {
    const backgroundPath = path.join('./temp', `background_${Date.now()}.mp4`);

    // 스타일별 색상
    const colors = {
      modern: '#667eea',
      cinematic: '#0f0c29',
      neon: '#FF00FF',
      glassmorphism: '#1a1a2e',
    };

    const color = colors[style] || colors.modern;

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(`color=c=${color}:s=1080x1920:d=${duration}`)
        .inputFormat('lavfi')
        .outputOptions([
          '-c:v libx264',
          '-t ' + duration,
          '-pix_fmt yuv420p',
        ])
        .output(backgroundPath)
        .on('end', () => resolve(backgroundPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * 비디오 합성
   */
  private async composeVideo(
    videoPath: string,
    audioPath: string,
    subtitlePath: string,
    outputPath: string,
    duration: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-b:a 192k',
          '-vf', `ass=${subtitlePath}`,
          '-t', duration.toString(),
          '-preset', 'medium',
          '-crf', '23',
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`비디오 합성 실패: ${err.message}`)))
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`진행률: ${Math.floor(progress.percent)}%`);
          }
        })
        .run();
    });
  }
}
