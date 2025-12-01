export interface BlogPost {
  title: string;
  content: string;
  summary?: string;
  mainPoints?: string[];
  date?: string;
}

export interface ShortsScript {
  hook: string; // 첫 3초 훅 (시청자 주목)
  mainContent: string[]; // 핵심 내용 (여러 포인트)
  conclusion: string; // 마무리 멘트
  hashtags: string[];
  duration: number; // 초 단위
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  duration: number;
  backgroundColor: string;
  fontFamily: string;
}

export interface AudioSegment {
  text: string;
  audioPath?: string;
  duration: number;
  startTime: number;
}

export interface ShortsGenerationOptions {
  blogPostPath?: string;
  blogPostUrl?: string;
  blogPostText?: string;
  outputPath?: string;
  style?: 'modern' | 'minimal' | 'dynamic';
  voice?: 'male' | 'female';
  includeSubtitles?: boolean;
}
