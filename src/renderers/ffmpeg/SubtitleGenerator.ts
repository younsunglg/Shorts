import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs/promises';
import path from 'path';

// FFmpeg 경로 설정
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface SubtitleSegment {
  text: string;
  start: number; // 초
  end: number; // 초
}

export class SubtitleGenerator {
  /**
   * ASS 자막 파일 생성
   */
  async generateASS(
    segments: SubtitleSegment[],
    outputPath: string,
    options: {
      fontSize?: number;
      fontName?: string;
      primaryColor?: string; // &H00FFFFFF (흰색)
      outlineColor?: string;
      position?: 'top' | 'center' | 'bottom';
      backgroundColor?: string;
      outline?: number;
      shadow?: number;
    } = {}
  ): Promise<string> {
    const {
      fontSize = 90,
      fontName = 'Arial',
      primaryColor = '&H00FFFFFF', // 흰색
      outlineColor = '&H00000000', // 검은색
      position = 'bottom',
      backgroundColor = '&H80000000', // 반투명 검정
      outline = 3,
      shadow = 2,
    } = options;

    // 위치 계산 (MarginV)
    const marginV = position === 'top' ? 50 : position === 'center' ? 0 : 50;
    const alignment = position === 'top' ? 8 : position === 'center' ? 5 : 2;

    // ASS 헤더
    const header = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryColor},&H000000FF,${outlineColor},${backgroundColor},1,0,0,0,100,100,0,0,1,${outline},${shadow},${alignment},10,10,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // 시간을 ASS 형식으로 변환 (0:00:00.00)
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const centisecs = Math.floor((seconds % 1) * 100);
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
    };

    // 이벤트 생성
    const events = segments.map(segment => {
      const startTime = formatTime(segment.start);
      const endTime = formatTime(segment.end);
      // ASS에서는 텍스트를 \N으로 줄바꿈
      const text = segment.text.replace(/\n/g, '\\N');
      return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`;
    }).join('\n');

    const assContent = header + events;

    await fs.writeFile(outputPath, assContent, 'utf-8');
    return outputPath;
  }

  /**
   * 워드 바이 워드 강조 효과 자막 (트렌디)
   */
  async generateWordByWord(
    text: string,
    totalDuration: number,
    outputPath: string,
    options: {
      fontSize?: number;
      highlightColor?: string;
    } = {}
  ): Promise<string> {
    const { fontSize = 90, highlightColor = '&H0000FFFF' } = options;

    const words = text.split(/\s+/);
    const timePerWord = totalDuration / words.length;

    const segments: SubtitleSegment[] = words.map((word, index) => ({
      text: `{\\c${highlightColor}}${word}{\\c&H00FFFFFF}`,
      start: index * timePerWord,
      end: (index + 1) * timePerWord,
    }));

    return this.generateASS(segments, outputPath, { fontSize });
  }
}
