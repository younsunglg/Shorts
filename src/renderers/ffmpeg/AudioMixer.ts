import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';

// FFmpeg와 FFprobe 경로 설정
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// FFprobe 경로 설정 (ffmpeg과 같은 디렉토리에 있음)
const ffprobePath = ffmpegInstaller.path.replace('ffmpeg.exe', 'ffprobe.exe').replace('ffmpeg', 'ffprobe');
try {
  ffmpeg.setFfprobePath(ffprobePath);
} catch (e) {
  // ffprobe가 없으면 무시 (나중에 설치 안내)
}

export interface AudioMixOptions {
  narrationPath: string;
  narrationVolume?: number; // 0-100
  bgmPath?: string;
  bgmVolume?: number; // 0-100
  fadeIn?: number; // 초
  fadeOut?: number; // 초
  outputPath: string;
}

export class AudioMixer {
  /**
   * 나레이션 + BGM 믹싱
   */
  async mix(options: AudioMixOptions): Promise<string> {
    const {
      narrationPath,
      narrationVolume = 80,
      bgmPath,
      bgmVolume = 30,
      fadeIn = 2,
      fadeOut = 2,
      outputPath,
    } = options;

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // 나레이션 입력
      command.input(narrationPath);

      if (bgmPath) {
        // BGM 입력
        command.input(bgmPath);

        // 복잡한 필터: 나레이션 볼륨 + BGM 볼륨 + 페이드
        const narVol = narrationVolume / 100;
        const bgmVol = bgmVolume / 100;

        const filterComplex = [
          `[0:a]volume=${narVol}[narration]`,
          `[1:a]volume=${bgmVol},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=55:d=${fadeOut}[bgm]`,
          `[narration][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]`,
        ].join(';');

        command
          .complexFilter(filterComplex)
          .outputOptions(['-map', '[out]'])
          .audioCodec('libmp3lame')
          .audioBitrate('192k');
      } else {
        // BGM 없이 나레이션만
        const narVol = narrationVolume / 100;
        command
          .audioFilters(`volume=${narVol}`)
          .audioCodec('libmp3lame')
          .audioBitrate('192k');
      }

      command
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`오디오 믹싱 실패: ${err.message}`)))
        .run();
    });
  }

  /**
   * 오디오 길이 가져오기
   */
  async getDuration(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration || 0);
        }
      });
    });
  }
}
