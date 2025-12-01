/**
 * 블로그 Markdown 파싱 - 30초 요약 추출
 */

export interface BlogContent {
  title: string;
  summary: string[];  // 30초 요약의 5개 불릿 포인트
}

export class BlogParser {
  /**
   * Markdown 블로그에서 30초 요약 추출
   */
  parse(markdown: string): BlogContent {
    const lines = markdown.split('\n');

    // 제목 추출 (첫 번째 ##)
    let title = '';
    for (const line of lines) {
      if (line.trim().startsWith('## 1.')) {
        title = line.replace(/^## 1\.\s*/, '').replace(/\[.*?\]\s*/, '').trim();
        break;
      }
    }

    // 30초 요약 추출
    const summary: string[] = [];
    let inSummary = false;

    for (const line of lines) {
      // 30초 요약 섹션 시작
      if (line.includes('30초 요약') || line.includes('🕒')) {
        inSummary = true;
        continue;
      }

      // 다음 섹션 시작하면 종료
      if (inSummary && line.trim().startsWith('##')) {
        break;
      }

      // 불릿 포인트 추출
      if (inSummary && line.trim().startsWith('*')) {
        const point = line
          .replace(/^\*\s*/, '')
          .replace(/\*\*/g, '')  // 볼드 제거
          .trim();

        if (point.length > 0) {
          summary.push(point);
        }
      }
    }

    return { title, summary };
  }

  /**
   * 요약을 하나의 텍스트로 변환
   */
  toScript(content: BlogContent): string {
    return content.summary.join('. ') + '.';
  }

  /**
   * 타이밍 계산 (각 포인트당 균등 배분)
   */
  calculateTimings(summary: string[], totalDuration: number): Array<{ text: string; start: number; end: number }> {
    const durationPerPoint = totalDuration / summary.length;

    return summary.map((text, index) => ({
      text,
      start: index * durationPerPoint,
      end: (index + 1) * durationPerPoint,
    }));
  }
}
