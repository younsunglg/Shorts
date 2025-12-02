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

    // 제목 추출 - 여러 형식 지원
    let title = '';

    // 형식 1: ## 1. [제목] 형식
    for (const line of lines) {
      if (line.trim().startsWith('## 1.')) {
        title = line.replace(/^## 1\.\s*/, '').replace(/\[.*?\]\s*/, '').trim();
        break;
      }
    }

    // 형식 2: 첫 번째 줄이 제목 ([]로 감싸진 경우)
    if (!title && lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.startsWith('[') && firstLine.includes(']')) {
        // [오늘의 브리핑12/2] 제목 -> 제목만 추출
        const match = firstLine.match(/\]\s*(.+)$/);
        if (match) {
          title = match[1].trim();
        }
      }
    }

    // 30초 요약 추출 - 여러 형식 지원
    const summary: string[] = [];
    let inSummary = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 30초 요약 섹션 시작 (## 2. 🕒 형식 또는 🕒 30초 요약 형식)
      if (line.includes('30초 요약') || (line.includes('🕒') && !line.includes('출처'))) {
        inSummary = true;
        continue;
      }

      // 다음 섹션 시작하면 종료 (Analyst's Note, 주요 뉴스 등)
      if (inSummary && (
        line.trim().startsWith('##') ||
        line.includes('Analyst') ||
        line.includes('주요 뉴스') ||
        line.trim() === '---'
      )) {
        break;
      }

      // 불릿 포인트 추출 (* 로 시작하는 경우)
      if (inSummary && line.trim().startsWith('*')) {
        const point = line
          .replace(/^\*\s*/, '')
          .replace(/\*\*/g, '')  // 볼드 제거
          .trim();

        if (point.length > 0) {
          summary.push(point);
        }
        continue;
      }

      // 일반 문단 형식 (불릿 없이 단락으로만 구성된 경우)
      if (inSummary && line.trim().length > 20 && !line.trim().startsWith('#')) {
        summary.push(line.trim());
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
