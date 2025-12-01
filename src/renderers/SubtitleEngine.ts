import fs from 'fs/promises';

export interface SubtitleSegment {
  text: string;
  start: number;
  end: number;
}

export interface ASSStyle {
  fontName?: string;
  fontSize?: number;
  primaryColor?: string;    // 16진수 (예: #FFFFFF)
  outlineColor?: string;    // 16진수
  outlineWidth?: number;
  bold?: boolean;
  position?: 'top' | 'middle' | 'bottom';
}

/**
 * sb-render 기반 ASS 자막 생성
 */
export class SubtitleEngine {
  /**
   * HEX 색상을 ASS 색상으로 변환 (&HAABBGGRR 형식)
   */
  private hexToASSColor(hex: string, opacity: number = 1): string {
    const h = hex.replace('#', '');
    const r = h.substring(0, 2);
    const g = h.substring(2, 4);
    const b = h.substring(4, 6);
    const alpha = Math.round((1 - opacity) * 255).toString(16).padStart(2, '0');

    return `&H${alpha}${b}${g}${r}`.toUpperCase();
  }

  /**
   * 시간을 ASS 형식으로 변환 (H:MM:SS.CS)
   */
  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);

    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  }

  /**
   * ASS 자막 파일 생성
   */
  async generateASS(
    segments: SubtitleSegment[],
    outputPath: string,
    style: ASSStyle = {}
  ): Promise<string> {
    console.log('📝 ASS 자막 생성 중...');

    // 기본값 설정
    const {
      fontName = 'Arial',
      fontSize = 80,
      primaryColor = '#FFFFFF',
      outlineColor = '#000000',
      outlineWidth = 3,
      bold = true,
      position = 'bottom',
    } = style;

    // 색상 변환
    const primaryAss = this.hexToASSColor(primaryColor, 1);
    const outlineAss = this.hexToASSColor(outlineColor, 1);

    // 정렬 (7=하단 중앙, 5=중앙, 8=상단 중앙)
    const alignment = position === 'bottom' ? 2 : position === 'top' ? 8 : 5;
    const marginV = position === 'bottom' ? 80 : position === 'top' ? 80 : 0;

    // ASS 헤더
    const header = `[Script Info]
Title: Shorts Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryAss},&H000000FF,${outlineAss},&H80000000,${bold ? '1' : '0'},0,0,0,100,100,0,0,1,${outlineWidth},2,${alignment},40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // 자막 이벤트
    const events = segments
      .map((seg) => {
        const start = this.formatTime(seg.start);
        const end = this.formatTime(seg.end);
        return `Dialogue: 0,${start},${end},Default,,0,0,0,,${seg.text}`;
      })
      .join('\n');

    const assContent = header + events;
    await fs.writeFile(outputPath, assContent, 'utf-8');

    console.log(`✅ 자막 생성 완료: ${outputPath}`);
    return outputPath;
  }
}
