import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * 고급 비디오 합성 (스톡 비디오 + 시각 효과)
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
   * 스톡 비디오를 쇼츠 크기로 조정 및 루프
   */
  async prepareStockVideo(
    inputPath: string,
    outputPath: string,
    targetDuration: number
  ): Promise<string> {
    console.log('🎞️  스톡 비디오 준비 중... (크기 조정 + 루프)');

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          // 1080x1920으로 크롭/스케일
          '-vf',
          'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1',
          // 루프 (비디오가 짧으면 반복)
          '-stream_loop',
          '10',
          '-t',
          targetDuration.toString(),
          '-c:v',
          'libx264',
          '-pix_fmt',
          'yuv420p',
          '-preset',
          'fast',
        ])
        .output(outputPath)
        .on('end', () => {
          console.log(`✅ 스톡 비디오 준비 완료`);
          resolve(outputPath);
        })
        .on('error', (err) => reject(new Error(`스톡 비디오 준비 실패: ${err.message}`)))
        .run();
    });
  }

  /**
   * 최종 비디오 합성 (배경 + 오디오 + 자막 + 시각 효과)
   */
  async compose(
    backgroundPath: string,
    audioPath: string,
    subtitlePath: string,
    outputPath: string,
    duration: number,
    options: {
      darkOverlay?: boolean;      // 배경 어둡게
      gradientOverlay?: boolean;   // 그라데이션 오버레이
    } = {}
  ): Promise<string> {
    console.log('🎬 비디오 합성 중... (고급 효과 적용)');

    const { darkOverlay = true, gradientOverlay = true } = options;

    return new Promise((resolve, reject) => {
      // 자막 경로 이스케이프
      let subtitlePathEscaped = subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:');
      const assFilter = `ass='${subtitlePathEscaped}'`;

      // 복잡한 필터 체인
      const filters: string[] = [];

      // 1. 배경 어둡게 (가독성 향상)
      if (darkOverlay) {
        filters.push('eq=brightness=-0.2:contrast=1.1');
      }

      // 2. 그라데이션 오버레이 (상단/하단 어둡게)
      if (gradientOverlay) {
        filters.push(
          'drawbox=y=0:w=iw:h=300:color=black@0.4:t=fill',
          'drawbox=y=ih-300:w=iw:h=300:color=black@0.4:t=fill'
        );
      }

      // 3. 자막
      filters.push(assFilter);

      const vfFilter = filters.join(',');
      console.log(`   비디오 필터: ${filters.length}개 적용`);

      ffmpeg()
        .input(backgroundPath)
        .input(audioPath)
        .outputOptions([
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-vf', vfFilter,
          '-t', duration.toString(),
          '-preset', 'medium',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
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
