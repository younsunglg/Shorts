import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

export interface AudioMixOptions {
  narrationPath: string;      // 나레이션 오디오
  bgmPath?: string;            // BGM (옵션)
  outputPath: string;          // 출력 경로
  narrationVolume?: number;    // 나레이션 볼륨 (0-100, 기본 100)
  bgmVolume?: number;          // BGM 볼륨 (0-100, 기본 20)
  fadeIn?: number;             // BGM 페이드인 (초, 기본 2)
  fadeOut?: number;            // BGM 페이드아웃 (초, 기본 3)
}

/**
 * sb-render 기반 오디오 믹서
 * 나레이션 + BGM 믹싱
 */
export class AudioMixer {
  /**
   * 오디오 길이 확인
   */
  async getDuration(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration || 0);
      });
    });
  }

  /**
   * 나레이션 + BGM 믹싱
   */
  async mix(options: AudioMixOptions): Promise<string> {
    const {
      narrationPath,
      bgmPath,
      outputPath,
      narrationVolume = 100,
      bgmVolume = 20,
      fadeIn = 2,
      fadeOut = 3,
    } = options;

    // BGM이 없으면 나레이션만 복사
    if (!bgmPath) {
      console.log('🎵 BGM 없음 - 나레이션만 사용');
      return new Promise((resolve, reject) => {
        ffmpeg(narrationPath)
          .audioCodec('aac')
          .audioBitrate('192k')
          .output(outputPath)
          .on('end', () => resolve(outputPath))
          .on('error', reject)
          .run();
      });
    }

    console.log('🎵 오디오 믹싱 중... (나레이션 + BGM)');

    // 나레이션 길이 확인
    const narrationDuration = await this.getDuration(narrationPath);

    return new Promise((resolve, reject) => {
      const narVol = narrationVolume / 100;
      const bgmVol = bgmVolume / 100;

      // 복잡한 필터: 나레이션 볼륨 + BGM 볼륨 + 페이드 + 믹싱
      const filterComplex = [
        // 나레이션 볼륨 조절
        `[0:a]volume=${narVol}[narration]`,
        // BGM 볼륨 조절 + 페이드인/아웃 + 루프
        `[1:a]volume=${bgmVol},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${narrationDuration - fadeOut}:d=${fadeOut},aloop=loop=-1:size=2e+09[bgm]`,
        // 믹싱
        `[narration][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]`,
      ].join(';');

      ffmpeg()
        .input(narrationPath)
        .input(bgmPath)
        .complexFilter(filterComplex)
        .outputOptions(['-map', '[out]'])
        .audioCodec('aac')
        .audioBitrate('192k')
        .output(outputPath)
        .on('end', () => {
          console.log(`✅ 오디오 믹싱 완료: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => reject(new Error(`오디오 믹싱 실패: ${err.message}`)))
        .run();
    });
  }
}
