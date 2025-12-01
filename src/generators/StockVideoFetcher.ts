import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export interface StockVideo {
  url: string;
  duration: number;
  width: number;
  height: number;
}

/**
 * Pexels API를 사용한 무료 스톡 비디오 다운로드
 */
export class StockVideoFetcher {
  private apiKey: string;
  private baseUrl = 'https://api.pexels.com/videos';

  constructor(apiKey?: string) {
    // Pexels API 키 (무료: 200 requests/hour)
    this.apiKey = apiKey || process.env.PEXELS_API_KEY || '';
  }

  /**
   * 키워드로 스톡 비디오 검색
   */
  async search(keyword: string, orientation: 'portrait' | 'landscape' = 'portrait'): Promise<StockVideo[]> {
    if (!this.apiKey) {
      throw new Error('PEXELS_API_KEY가 설정되지 않았습니다. .env에 추가하세요: https://www.pexels.com/api/');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: {
          Authorization: this.apiKey,
        },
        params: {
          query: keyword,
          orientation,
          size: 'medium',
          per_page: 10,
        },
      });

      return response.data.videos.map((video: any) => {
        const file = video.video_files.find((f: any) => f.width === 1080 && f.height === 1920) || video.video_files[0];
        return {
          url: file.link,
          duration: video.duration,
          width: file.width,
          height: file.height,
        };
      });
    } catch (error: any) {
      console.warn(`⚠️  Pexels API 오류 (폴백: 단색 배경): ${error.message}`);
      return [];
    }
  }

  /**
   * 비디오 다운로드
   */
  async download(videoUrl: string, outputPath: string): Promise<string> {
    console.log('📥 스톡 비디오 다운로드 중...');

    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
    });

    await fs.writeFile(outputPath, response.data);
    console.log(`✅ 다운로드 완료: ${outputPath}`);
    return outputPath;
  }

  /**
   * 키워드로 비디오 가져오기 (검색 + 다운로드)
   */
  async fetch(keyword: string, outputPath: string): Promise<string | null> {
    try {
      const videos = await this.search(keyword, 'portrait');

      if (videos.length === 0) {
        console.log('⚠️  스톡 비디오를 찾을 수 없습니다. 단색 배경 사용');
        return null;
      }

      // 첫 번째 비디오 다운로드
      const video = videos[0];
      await this.download(video.url, outputPath);
      return outputPath;
    } catch (error: any) {
      console.warn(`⚠️  스톡 비디오 가져오기 실패: ${error.message}`);
      return null;
    }
  }
}
