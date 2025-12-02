import type { BlogContent } from '../parsers/BlogParser.js';

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

/**
 * 고급 자막 생성 - 단어 단위 분할
 */
export class AdvancedSubtitleGenerator {
  /**
   * 문장을 단어/구 단위로 분할
   */
  splitIntoWords(text: string): string[] {
    if (!text) return [];

    // 한국어는 조사를 포함한 어절 단위로 분할
    // 영어는 단어 단위
    const words: string[] = [];
    const parts = text.split(/\s+/);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.length === 0) continue;

      // 긴 어절은 2-3 단어씩 묶기 (가독성)
      if (i + 1 < parts.length && part.length < 10) {
        words.push(`${part} ${parts[i + 1]}`);
        i++;
      } else {
        words.push(part);
      }
    }

    return words;
  }

  /**
   * BlogContent를 단어 타이밍으로 변환
   */
  createWordTimings(content: BlogContent, totalDuration: number): WordTiming[] {
    const allWords: WordTiming[] = [];
    let currentTime = 0;

    // 모든 요약 포인트를 시간에 균등 배분
    const { summary } = content;
    if (!summary || summary.length === 0) {
      return allWords;
    }

    const timePerPoint = totalDuration / summary.length;

    // 각 요약 포인트를 단어로 분할하고 타이밍 할당
    summary.forEach((point) => {
      const words = this.splitIntoWords(point);
      if (words.length === 0) return;

      const timePerWord = timePerPoint / words.length;

      words.forEach((word) => {
        allWords.push({
          word,
          start: currentTime,
          end: currentTime + timePerWord,
        });
        currentTime += timePerWord;
      });
    });

    return allWords;
  }

  /**
   * ASS 자막 생성 (단어 단위 + 애니메이션)
   */
  async generateASS(
    wordTimings: WordTiming[],
    outputPath: string
  ): Promise<string> {
    const fs = await import('fs/promises');

    console.log('📝 고급 자막 생성 중... (단어 단위 애니메이션)');

    // 시간 포맷 변환
    const formatTime = (seconds: number): string => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const cs = Math.floor((seconds % 1) * 100);
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    };

    // ASS 헤더
    const header = `[Script Info]
Title: Advanced Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,95,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,5,3,2,40,40,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // 단어별 이벤트 (페이드인 애니메이션)
    const events = wordTimings
      .map((timing) => {
        const start = formatTime(timing.start);
        const end = formatTime(timing.end);
        // 페이드인 효과 추가
        const fadeEffect = `{\\fad(100,100)}`;
        return `Dialogue: 0,${start},${end},Default,,0,0,0,,${fadeEffect}${timing.word}`;
      })
      .join('\n');

    const assContent = header + events;
    await fs.writeFile(outputPath, assContent, 'utf-8');

    console.log(`✅ 고급 자막 생성 완료: ${outputPath}`);
    return outputPath;
  }
}
