import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

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
    console.log(`   출력 경로: ${outputPath}`);

    return new Promise((resolve, reject) => {
      const outputPathEscaped = outputPath.replace(/\\/g, '/');
      console.log(`   변환된 경로: ${outputPathEscaped}`);

      const pythonScript = `# -*- coding: utf-8 -*-
import sys
import os
try:
    from gtts import gTTS

    text = """${text}"""
    output_path = r"${outputPathEscaped}"

    print(f"DEBUG: 출력 경로 = {output_path}", file=sys.stderr)

    # 디렉토리 생성
    dir_path = os.path.dirname(output_path)
    print(f"DEBUG: 디렉토리 = {dir_path}", file=sys.stderr)
    os.makedirs(dir_path, exist_ok=True)

    tts = gTTS(text, lang='${lang}')
    tts.save(output_path)

    # 파일 생성 확인
    if os.path.exists(output_path):
        print(f"DEBUG: 파일 생성 성공 = {output_path}", file=sys.stderr)
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

      const pythonProcess = spawn('python', ['-c', pythonScript], { shell: true });
      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        console.log(`   Python 종료 코드: ${code}`);
        console.log(`   stdout: ${stdout}`);
        console.log(`   stderr: ${stderr}`);

        if (code !== 0 || stderr.includes('ERROR')) {
          reject(new Error(`Google TTS 실패:\n${stderr}`));
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
