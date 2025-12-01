import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export class AudioGenerator {
  /**
   * Google TTS로 음성 생성 (무료!)
   */
  async generate(text: string, outputPath: string, lang: string = 'ko'): Promise<string> {
    console.log('🎤 Google TTS로 음성 생성 중... (무료)');

    try {
      // Python gTTS 사용
      const command = `python -c "from gtts import gTTS; tts = gTTS('${text.replace(/'/g, "\\'")}', lang='${lang}'); tts.save('${outputPath}')"`;
      await execAsync(command);

      console.log(`✅ 음성 생성 완료: ${outputPath}`);
      return outputPath;
    } catch (error) {
      throw new Error(`Google TTS 음성 생성 실패: ${error}`);
    }
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
