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
 * pyttsx3 오프라인 TTS 음성 생성
 */
export class VoiceGenerator {
  /**
   * 텍스트를 음성으로 변환
   */
  async generate(text: string, outputPath: string, lang: string = 'ko'): Promise<string> {
    // 플랫폼 감지
    const isWindows = process.platform === 'win32';

    if (isWindows) {
      return this.generateWindows(text, outputPath);
    } else {
      return this.generateLinux(text, outputPath);
    }
  }

  /**
   * Windows SAPI TTS (내장, 설치 불필요)
   */
  private async generateWindows(text: string, outputPath: string): Promise<string> {
    console.log('🎤 음성 생성 중... (Windows SAPI)');

    // 임시 WAV 파일 경로
    const tempWavPath = outputPath.replace(/\.mp3$/, '.wav');
    const tempScriptPath = path.join(os.tmpdir(), `tts_${Date.now()}.ps1`);

    // PowerShell 스크립트로 Windows SAPI 사용
    const psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# WAV 파일로 저장
$synth.SetOutputToWaveFile("${tempWavPath.replace(/\\/g, '\\\\')}")
$synth.Rate = 0  # 속도 (-10 ~ 10, 0이 기본)
$synth.Volume = 100  # 볼륨 (0 ~ 100)

$text = @"
${text.replace(/"/g, '""')}
"@

$synth.Speak($text)
$synth.Dispose()

if (Test-Path "${tempWavPath.replace(/\\/g, '\\\\')}") {
    Write-Output "완료"
} else {
    Write-Error "파일 생성 실패"
    exit 1
}
`;

    await fs.writeFile(tempScriptPath, psScript, 'utf-8');

    return new Promise((resolve, reject) => {
      const psProcess = spawn('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-File', tempScriptPath
      ], { shell: true });

      let stderr = '';

      psProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      psProcess.on('close', async (code) => {
        // 임시 스크립트 삭제
        try {
          await fs.unlink(tempScriptPath);
        } catch (err) {
          // 무시
        }

        if (code !== 0) {
          reject(new Error(`Windows TTS 실행 실패:\n${stderr}`));
          return;
        }

        // WAV 파일 존재 확인
        const wavExists = await fs.access(tempWavPath).then(() => true).catch(() => false);
        if (!wavExists) {
          reject(new Error('WAV 파일이 생성되지 않았습니다'));
          return;
        }

        // WAV → MP3 변환 (FFmpeg)
        console.log('🔄 WAV → MP3 변환 중...');
        ffmpeg(tempWavPath)
          .toFormat('mp3')
          .audioCodec('libmp3lame')
          .audioBitrate('128k')
          .on('end', async () => {
            // WAV 파일 삭제
            try {
              await fs.unlink(tempWavPath);
            } catch (err) {
              // 무시
            }
            console.log(`✅ 음성 생성 완료: ${outputPath}`);
            resolve(outputPath);
          })
          .on('error', (err) => {
            reject(new Error(`MP3 변환 실패: ${err.message}`));
          })
          .save(outputPath);
      });

      psProcess.on('error', async (err) => {
        try {
          await fs.unlink(tempScriptPath);
        } catch (e) {
          // 무시
        }
        reject(new Error(`PowerShell 실행 실패: ${err.message}`));
      });
    });
  }

  /**
   * Linux eSpeak TTS
   */
  private async generateLinux(text: string, outputPath: string): Promise<string> {
    console.log('🎤 음성 생성 중... (eSpeak TTS)');

    // 임시 WAV 파일 경로
    const tempWavPath = outputPath.replace(/\.mp3$/, '.wav');

    // 텍스트 파일 생성 (espeak 입력용)
    const tempTextPath = path.join(os.tmpdir(), `tts_text_${Date.now()}.txt`);
    await fs.writeFile(tempTextPath, text, 'utf-8');

    return new Promise((resolve, reject) => {
      const espeakProcess = spawn('espeak', [
        '-f', tempTextPath,
        '-w', tempWavPath,
        '-s', '160',  // 적당한 속도
        '-a', '200',  // 볼륨 (0-200, 기본 100)
      ], { shell: true });

      let stderr = '';

      espeakProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      espeakProcess.on('close', async (code) => {
        // 임시 텍스트 파일 삭제
        try {
          await fs.unlink(tempTextPath);
        } catch (err) {
          // 무시
        }

        if (code !== 0) {
          reject(new Error(`eSpeak 실행 실패:\n${stderr}`));
          return;
        }

        // WAV 파일 존재 확인
        const wavExists = await fs.access(tempWavPath).then(() => true).catch(() => false);
        if (!wavExists) {
          reject(new Error('WAV 파일이 생성되지 않았습니다'));
          return;
        }

        // WAV → MP3 변환 (FFmpeg)
        console.log('🔄 WAV → MP3 변환 중...');
        ffmpeg(tempWavPath)
          .toFormat('mp3')
          .audioCodec('libmp3lame')
          .audioBitrate('128k')
          .on('end', async () => {
            // WAV 파일 삭제
            try {
              await fs.unlink(tempWavPath);
            } catch (err) {
              // 무시
            }
            console.log(`✅ 음성 생성 완료: ${outputPath}`);
            resolve(outputPath);
          })
          .on('error', (err) => {
            reject(new Error(`MP3 변환 실패: ${err.message}`));
          })
          .save(outputPath);
      });

      espeakProcess.on('error', async (err) => {
        // 임시 파일 삭제
        try {
          await fs.unlink(tempTextPath);
        } catch (e) {
          // 무시
        }
        reject(new Error(`eSpeak 실행 실패: ${err.message}`));
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
