import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export class AudioGenerator {
  /**
   * Google TTS로 음성 생성 (무료!)
   */
  async generate(text: string, outputPath: string, lang: string = 'ko'): Promise<string> {
    console.log('🎤 Google TTS로 음성 생성 중... (무료)');

    try {
      // 임시 Python 스크립트 생성 (인코딩 문제 해결)
      const tempScriptPath = path.join(path.dirname(outputPath), 'tts_script.py');
      const outputPathEscaped = outputPath.replace(/\\/g, '/'); // Windows 경로 수정

      const pythonScript = `# -*- coding: utf-8 -*-
from gtts import gTTS
import sys

text = """${text}"""
output_path = r"${outputPathEscaped}"

tts = gTTS(text, lang='${lang}')
tts.save(output_path)
print("TTS 완료")
`;

      await fs.writeFile(tempScriptPath, pythonScript, 'utf-8');

      // Python 스크립트 실행
      await execAsync(`python "${tempScriptPath}"`);

      // 임시 스크립트 삭제
      await fs.unlink(tempScriptPath);

      console.log(`✅ 음성 생성 완료: ${outputPath}`);
      return outputPath;
    } catch (error: any) {
      throw new Error(`Google TTS 음성 생성 실패: ${error.message}`);
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
