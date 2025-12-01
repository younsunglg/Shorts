import fs from 'fs/promises';
import type { Script, SubtitleSegment } from '../types.js';

export class SubtitleGenerator {
  /**
   * 스크립트를 자막 세그먼트로 변환
   */
  createSegments(script: Script, totalDuration: number): SubtitleSegment[] {
    const segments: SubtitleSegment[] = [];
    let currentTime = 0;

    // 훅 (3초)
    const hookDuration = 3;
    segments.push({
      text: script.hook,
      start: currentTime,
      end: currentTime + hookDuration,
    });
    currentTime += hookDuration;

    // 포인트들 (균등 분배)
    const pointsDuration = totalDuration - hookDuration - 5;
    const durationPerPoint = pointsDuration / script.points.length;

    script.points.forEach((point) => {
      segments.push({
        text: point,
        start: currentTime,
        end: currentTime + durationPerPoint,
      });
      currentTime += durationPerPoint;
    });

    // 결론 (마지막 5초)
    segments.push({
      text: script.conclusion,
      start: currentTime,
      end: totalDuration,
    });

    return segments;
  }

  /**
   * ASS 자막 파일 생성
   */
  async generateASS(
    segments: SubtitleSegment[],
    outputPath: string
  ): Promise<string> {
    console.log('📝 자막 파일 생성 중...');

    const header = `[Script Info]
Title: Shorts Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,90,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,10,10,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    const formatTime = (seconds: number): string => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const cs = Math.floor((seconds % 1) * 100);
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    };

    const events = segments
      .map((seg) => {
        const start = formatTime(seg.start);
        const end = formatTime(seg.end);
        return `Dialogue: 0,${start},${end},Default,,0,0,0,,${seg.text}`;
      })
      .join('\n');

    await fs.writeFile(outputPath, header + events, 'utf-8');
    console.log(`✅ 자막 생성 완료: ${outputPath}`);
    return outputPath;
  }
}
