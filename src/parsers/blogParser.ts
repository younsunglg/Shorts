import fs from 'fs/promises';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { BlogPost } from '../types.js';

export class BlogParser {
  /**
   * 파일 경로에서 블로그 글 읽기
   */
  async parseFromFile(filePath: string): Promise<BlogPost> {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = filePath.split('.').pop()?.toLowerCase();

    if (ext === 'md' || ext === 'markdown') {
      return this.parseMarkdown(content);
    } else if (ext === 'html' || ext === 'htm') {
      return this.parseHtml(content);
    } else {
      return this.parseText(content);
    }
  }

  /**
   * URL에서 블로그 글 가져오기
   */
  async parseFromUrl(url: string): Promise<BlogPost> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return this.parseHtml(response.data);
    } catch (error) {
      throw new Error(`URL에서 블로그 글을 가져오는데 실패했습니다: ${error}`);
    }
  }

  /**
   * 직접 텍스트에서 파싱
   */
  parseFromText(text: string): BlogPost {
    return this.parseText(text);
  }

  /**
   * 마크다운 파싱
   */
  private parseMarkdown(content: string): BlogPost {
    // 제목 추출 (첫 번째 # 헤더)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : '제목 없음';

    // 마크다운 문법 제거
    let cleanContent = content
      .replace(/^#+\s+/gm, '') // 헤더 제거
      .replace(/\*\*(.+?)\*\*/g, '$1') // 볼드 제거
      .replace(/\*(.+?)\*/g, '$1') // 이탤릭 제거
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 링크 제거
      .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
      .replace(/`(.+?)`/g, '$1') // 인라인 코드 제거
      .replace(/^\s*[-*+]\s+/gm, '') // 리스트 마커 제거
      .trim();

    return {
      title,
      content: cleanContent
    };
  }

  /**
   * HTML 파싱
   */
  private parseHtml(html: string): BlogPost {
    const $ = cheerio.load(html);

    // 스크립트, 스타일 제거
    $('script, style, nav, footer, aside').remove();

    // 제목 추출
    let title = $('h1').first().text() ||
                $('title').text() ||
                $('meta[property="og:title"]').attr('content') ||
                '제목 없음';

    // 본문 추출 (일반적인 블로그 구조)
    let content = $('article').text() ||
                  $('.post-content').text() ||
                  $('.entry-content').text() ||
                  $('main').text() ||
                  $('body').text();

    // 여러 공백을 하나로, 줄바꿈 정리
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return {
      title: title.trim(),
      content
    };
  }

  /**
   * 일반 텍스트 파싱
   */
  private parseText(text: string): BlogPost {
    const lines = text.split('\n').filter(line => line.trim());
    const title = lines[0] || '제목 없음';
    const content = lines.slice(1).join('\n').trim();

    return {
      title,
      content: content || text
    };
  }

  /**
   * 블로그 글의 핵심 통계 정보
   */
  getStatistics(post: BlogPost): {
    wordCount: number;
    paragraphCount: number;
    estimatedReadTime: number;
  } {
    const wordCount = post.content.split(/\s+/).length;
    const paragraphCount = post.content.split(/\n\n+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // 분당 200단어 기준

    return {
      wordCount,
      paragraphCount,
      estimatedReadTime
    };
  }
}
