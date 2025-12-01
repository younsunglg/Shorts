import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Google TTS 음성 생성 (무료)
 */
export class VoiceGenerator {
  /**
   * 텍스트를 음성으로 변환
   */
  async generate(text: string, outputPath: string, lang: string = 'ko'): Promise<string> {
    console.log('🎤 음성 생성 중... (Google TTS)');

    // 임시 Python 스크립트 파일 생성 (PowerShell 문제 해결)
    const tempScriptPath = path.join(os.tmpdir(), `tts_${Date.now()}.py`);
    const outputPathEscaped = outputPath.replace(/\\/g, '/');

    const pythonScript = `# -*- coding: utf-8 -*-
import sys
import os
from gtts import gTTS

text = """${text}"""
output_path = r"${outputPathEscaped}"

try:
    # 디렉토리 생성
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # TTS 생성
    tts = gTTS(text, lang='${lang}')
    tts.save(output_path)

    # 파일 생성 확인
    if os.path.exists(output_path):
        print("완료")
    else:
        print("ERROR: 파일 생성 실패", file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
`;

    await fs.writeFile(tempScriptPath, pythonScript, 'utf-8');

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [tempScriptPath], { shell: true });
      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        // 임시 파일 삭제
        try {
          await fs.unlink(tempScriptPath);
        } catch (err) {
          // 무시
        }

        if (code !== 0 || stderr.includes('ERROR')) {
          reject(new Error(`Google TTS 실패:\n${stderr}`));
        } else {
          console.log(`✅ 음성 생성 완료: ${outputPath}`);
          resolve(outputPath);
        }
      });

      pythonProcess.on('error', async (err) => {
        // 임시 파일 삭제
        try {
          await fs.unlink(tempScriptPath);
        } catch (e) {
          // 무시
        }
        reject(new Error(`Python 실행 실패: ${err.message}`));
      });
    });
  }

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
}
