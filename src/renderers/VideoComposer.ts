import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * sb-render 기반 비디오 합성
 */
export class VideoComposer {
  /**
   * 배경 비디오 생성 (단색 또는 그라데이션)
   */
  async createBackground(
    duration: number,
    outputPath: string,
    color: string = '#667eea'
  ): Promise<string> {
    console.log('🎨 배경 생성 중...');

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(`color=c=${color}:s=1080x1920:d=${duration}`)
        .inputFormat('lavfi')
        .outputOptions([
          '-c:v libx264',
          '-t ' + duration,
          '-pix_fmt yuv420p',
          '-preset fast',
        ])
        .output(outputPath)
        .on('end', () => {
          console.log(`✅ 배경 생성 완료`);
          resolve(outputPath);
        })
        .on('error', (err) => reject(new Error(`배경 생성 실패: ${err.message}`)))
        .run();
    });
  }

  /**
   * 최종 비디오 합성 (배경 + 오디오 + 자막)
   * sb-render VideoComposer 로직 활용
   */
  async compose(
    backgroundPath: string,
    audioPath: string,
    subtitlePath: string,
    outputPath: string,
    duration: number
  ): Promise<string> {
    console.log('🎬 비디오 합성 중...');

    return new Promise((resolve, reject) => {
      // Windows에서 FFmpeg ass 필터의 경로 문제 해결
      // 모든 백슬래시를 슬래시로, 콜론 이스케이프, 추가로 싱글 쿼트로 감싸기
      let subtitlePathEscaped = subtitlePath.replace(/\\/g, '/');

      // 드라이브 문자의 콜론은 그대로 두고, 나머지 특수문자 이스케이프
      subtitlePathEscaped = subtitlePathEscaped.replace(/:/g, '\\:');

      // 경로 전체를 작은따옴표로 감싸기
      const vfFilter = `ass='${subtitlePathEscaped}'`;

      console.log(`   자막 필터: ${vfFilter}`);

      ffmpeg()
        .input(backgroundPath)
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-b:a 192k',
          `-vf ${vfFilter}`,
          '-t ' + duration.toString(),
          '-preset medium',
          '-crf 23',
          '-pix_fmt yuv420p',
        ])
        .output(outputPath)
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`   진행률: ${Math.floor(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log(`✅ 비디오 합성 완료: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => reject(new Error(`비디오 합성 실패: ${err.message}`)))
        .run();
    });
  }
}
