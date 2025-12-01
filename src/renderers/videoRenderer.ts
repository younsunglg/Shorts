import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ShortsScript, VideoConfig } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VideoRenderer {
  private config: VideoConfig;

  constructor(config?: Partial<VideoConfig>) {
    this.config = {
      width: config?.width || 1080,
      height: config?.height || 1920,
      fps: config?.fps || 30,
      duration: config?.duration || 60,
      backgroundColor: config?.backgroundColor || '#000000',
      fontFamily: config?.fontFamily || 'Arial, sans-serif',
    };
  }

  /**
   * 쇼츠 비디오 렌더링
   */
  async renderShorts(
    script: ShortsScript,
    title: string,
    audioPath: string | undefined,
    outputPath: string,
    style: 'modern' | 'minimal' | 'dynamic' = 'modern'
  ): Promise<string> {
    try {
      console.log('비디오 번들링 시작...');

      // Remotion 프로젝트 번들링
      const bundleLocation = await bundle({
        entryPoint: path.join(__dirname, 'Root.tsx'),
        webpackOverride: (config) => config,
      });

      console.log('컴포지션 선택 중...');

      // 컴포지션 선택
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'ShortsVideo',
        inputProps: {
          title,
          hook: script.hook,
          mainContent: script.mainContent,
          conclusion: script.conclusion,
          hashtags: script.hashtags,
          audioPath,
          style,
        },
      });

      console.log('비디오 렌더링 시작...');

      // 비디오 렌더링
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: {
          title,
          hook: script.hook,
          mainContent: script.mainContent,
          conclusion: script.conclusion,
          hashtags: script.hashtags,
          audioPath,
          style,
        },
      });

      console.log(`비디오 렌더링 완료: ${outputPath}`);
      return outputPath;
    } catch (error) {
      throw new Error(`비디오 렌더링 실패: ${error}`);
    }
  }

  /**
   * 비디오 설정 업데이트
   */
  updateConfig(config: Partial<VideoConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 현재 설정 가져오기
   */
  getConfig(): VideoConfig {
    return { ...this.config };
  }
}
