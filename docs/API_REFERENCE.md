# API 레퍼런스

프로그래밍 방식으로 쇼츠 생성기를 사용하는 방법입니다.

## 설치

```typescript
import { BlogParser } from './parsers/blogParser';
import { ScriptGenerator } from './generators/scriptGenerator';
import { AudioGenerator } from './generators/audioGenerator';
import { VideoRenderer } from './renderers/videoRenderer';
```

## BlogParser

블로그 글을 파싱하는 클래스입니다.

### 메서드

#### `parseFromFile(filePath: string): Promise<BlogPost>`

파일에서 블로그 글을 읽습니다.

```typescript
const parser = new BlogParser();
const blogPost = await parser.parseFromFile('./blog/post.md');

console.log(blogPost.title);
console.log(blogPost.content);
```

**지원 형식:**
- `.md`, `.markdown` - Markdown
- `.html`, `.htm` - HTML
- 기타 - 일반 텍스트

#### `parseFromUrl(url: string): Promise<BlogPost>`

URL에서 블로그 글을 가져옵니다.

```typescript
const parser = new BlogParser();
const blogPost = await parser.parseFromUrl('https://example.com/post');
```

#### `parseFromText(text: string): BlogPost`

텍스트를 직접 파싱합니다.

```typescript
const parser = new BlogParser();
const blogPost = parser.parseFromText('제목\n\n본문 내용...');
```

#### `getStatistics(post: BlogPost): object`

블로그 글의 통계 정보를 반환합니다.

```typescript
const stats = parser.getStatistics(blogPost);
console.log(stats.wordCount);          // 단어 수
console.log(stats.paragraphCount);     // 문단 수
console.log(stats.estimatedReadTime);  // 예상 읽기 시간 (분)
```

### 타입: BlogPost

```typescript
interface BlogPost {
  title: string;        // 제목
  content: string;      // 본문
  summary?: string;     // 요약 (옵션)
  mainPoints?: string[]; // 핵심 포인트 (옵션)
  date?: string;        // 날짜 (옵션)
}
```

## ScriptGenerator

AI를 사용하여 쇼츠 스크립트를 생성합니다.

### 생성자

```typescript
const generator = new ScriptGenerator(openaiApiKey: string);
```

### 메서드

#### `generateScript(blogPost: BlogPost, duration?: number): Promise<ShortsScript>`

블로그 글에서 쇼츠 스크립트를 생성합니다.

```typescript
const generator = new ScriptGenerator(process.env.OPENAI_API_KEY);
const script = await generator.generateScript(blogPost, 60);

console.log(script.hook);         // 훅 (첫 3초)
console.log(script.mainContent);  // 핵심 내용 배열
console.log(script.conclusion);   // 결론
console.log(script.hashtags);     // 해시태그 배열
```

**파라미터:**
- `blogPost`: 블로그 글 객체
- `duration`: 비디오 길이 (초, 기본값: 60)

#### `combineScriptToText(script: ShortsScript): string`

스크립트를 하나의 텍스트로 결합합니다.

```typescript
const fullText = generator.combineScriptToText(script);
// 음성 생성 시 사용
```

#### `estimateAudioDuration(text: string): number`

텍스트의 예상 음성 길이를 계산합니다 (초).

```typescript
const duration = generator.estimateAudioDuration(fullText);
console.log(`예상 음성 길이: ${duration}초`);
```

### 타입: ShortsScript

```typescript
interface ShortsScript {
  hook: string;           // 훅 (첫 3초)
  mainContent: string[];  // 핵심 내용
  conclusion: string;     // 결론
  hashtags: string[];     // 해시태그
  duration: number;       // 길이 (초)
}
```

## AudioGenerator

음성을 생성합니다.

### 생성자

```typescript
const audioGen = new AudioGenerator(
  openaiApiKey: string,
  elevenLabsApiKey?: string
);
```

### 메서드

#### `generateWithOpenAI(text: string, outputPath: string, voice?: string): Promise<string>`

OpenAI TTS로 음성을 생성합니다.

```typescript
const audioGen = new AudioGenerator(openaiKey);
const audioPath = await audioGen.generateWithOpenAI(
  '안녕하세요',
  './output/audio.mp3',
  'nova'
);
```

**음성 옵션:**
- `alloy` - 중립적
- `echo` - 남성
- `fable` - 영국식 남성
- `onyx` - 깊은 남성
- `nova` - 여성 (기본값)
- `shimmer` - 밝은 여성

#### `generateWithElevenLabs(text: string, outputPath: string, voiceId?: string): Promise<string>`

ElevenLabs API로 고품질 음성을 생성합니다.

```typescript
const audioGen = new AudioGenerator(openaiKey, elevenLabsKey);
const audioPath = await audioGen.generateWithElevenLabs(
  '안녕하세요',
  './output/audio.mp3'
);
```

#### `generateSegments(textSegments: string[], outputDir: string, provider?: string, voice?: string): Promise<string[]>`

여러 세그먼트의 음성을 생성합니다.

```typescript
const segments = ['첫 번째', '두 번째', '세 번째'];
const audioPaths = await audioGen.generateSegments(
  segments,
  './temp',
  'openai',
  'nova'
);
```

## VideoRenderer

비디오를 렌더링합니다.

### 생성자

```typescript
const renderer = new VideoRenderer(config?: Partial<VideoConfig>);
```

**VideoConfig:**
```typescript
interface VideoConfig {
  width: number;          // 기본값: 1080
  height: number;         // 기본값: 1920
  fps: number;            // 기본값: 30
  duration: number;       // 기본값: 60
  backgroundColor: string;
  fontFamily: string;
}
```

### 메서드

#### `renderShorts(script: ShortsScript, title: string, audioPath?: string, outputPath: string, style?: string): Promise<string>`

쇼츠 비디오를 렌더링합니다.

```typescript
const renderer = new VideoRenderer();
await renderer.renderShorts(
  script,
  '삼성전자 분석',
  './temp/audio.mp3',
  './output/shorts.mp4',
  'modern'
);
```

**스타일 옵션:**
- `modern` - 현대적 (기본값)
- `minimal` - 미니멀
- `dynamic` - 다이나믹

## 전체 워크플로우 예시

```typescript
import dotenv from 'dotenv';
import { BlogParser } from './parsers/blogParser';
import { ScriptGenerator } from './generators/scriptGenerator';
import { AudioGenerator } from './generators/audioGenerator';
import { VideoRenderer } from './renderers/videoRenderer';

dotenv.config();

async function generateShorts() {
  // 1. 블로그 파싱
  const parser = new BlogParser();
  const blogPost = await parser.parseFromFile('./blog/post.md');

  // 2. 스크립트 생성
  const scriptGen = new ScriptGenerator(process.env.OPENAI_API_KEY!);
  const script = await scriptGen.generateScript(blogPost, 60);

  // 3. 음성 생성
  const audioGen = new AudioGenerator(process.env.OPENAI_API_KEY!);
  const fullText = scriptGen.combineScriptToText(script);
  const audioPath = await audioGen.generateWithOpenAI(
    fullText,
    './temp/audio.mp3',
    'nova'
  );

  // 4. 비디오 렌더링
  const renderer = new VideoRenderer();
  await renderer.renderShorts(
    script,
    blogPost.title,
    audioPath,
    './output/shorts.mp4',
    'modern'
  );

  console.log('✅ 쇼츠 생성 완료!');
}

generateShorts().catch(console.error);
```

## Express API 서버 예시

```typescript
import express from 'express';
import { generateShorts } from './shortsGenerator';

const app = express();
app.use(express.json());

app.post('/api/shorts/generate', async (req, res) => {
  try {
    const { blogUrl, style, duration } = req.body;

    const result = await generateShorts({
      url: blogUrl,
      style: style || 'modern',
      duration: duration || 60,
    });

    res.json({
      success: true,
      videoPath: result.videoPath,
      script: result.script,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('서버 시작: http://localhost:3000');
});
```

## 에러 처리

모든 메서드는 Promise를 반환하며, 에러 시 reject됩니다.

```typescript
try {
  const script = await scriptGen.generateScript(blogPost);
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('API 키 오류');
  } else if (error.message.includes('rate limit')) {
    console.error('요청 한도 초과');
  } else {
    console.error('알 수 없는 오류:', error);
  }
}
```

## 환경 변수

`.env` 파일:

```env
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=... # 선택사항
VIDEO_WIDTH=1080
VIDEO_HEIGHT=1920
VIDEO_FPS=30
```

코드에서 사용:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
```
