# 📱 주식 블로그 쇼츠 생성기 (Stock Blog Shorts Generator)

주식 블로그 글을 AI 기반으로 자동 분석하여 YouTube Shorts/인스타그램 릴스용 비디오를 생성하는 도구입니다.

## ✨ 주요 기능

- 🤖 **AI 기반 스크립트 생성**: GPT-4를 활용한 핵심 내용 추출 및 쇼츠 스크립트 자동 생성
- 🎙️ **음성 합성**: OpenAI TTS 또는 ElevenLabs를 이용한 고품질 음성 생성
- 🎬 **프로페셔널 비디오**: Remotion 기반의 세련된 비디오 렌더링
- 📝 **다양한 입력 형식**: Markdown, HTML, 일반 텍스트, URL 지원
- 🎨 **커스터마이징 가능**: 3가지 스타일 (Modern, Minimal, Dynamic) 선택 가능
- ⚡ **간편한 CLI**: 명령어 한 줄로 쇼츠 생성

## 🚀 빠른 시작

### 1. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd Shorts

# 의존성 설치
npm install
```

### 2. 환경 설정

`.env` 파일을 생성하고 API 키를 설정하세요:

```bash
# .env.example을 복사
cp .env.example .env

# .env 파일 편집
nano .env
```

`.env` 파일 내용:
```env
# 필수: OpenAI API 키
OPENAI_API_KEY=your_openai_api_key_here

# 선택: ElevenLabs API 키 (고품질 음성을 원할 경우)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**API 키 발급 방법:**
- OpenAI: https://platform.openai.com/api-keys
- ElevenLabs (선택): https://elevenlabs.io/

### 3. 사용법

#### 기본 사용 (파일에서)

```bash
npm run dev generate -- --file ./blog-post.md --output ./output/shorts.mp4
```

#### URL에서 블로그 글 가져오기

```bash
npm run dev generate -- --url "https://yourblog.com/post" --output ./output/shorts.mp4
```

#### 직접 텍스트 입력

```bash
npm run dev generate -- --text "삼성전자가 오늘 5% 상승했습니다..." --output ./output/shorts.mp4
```

#### 고급 옵션

```bash
npm run dev generate \
  --file ./blog-post.md \
  --output ./output/my-shorts.mp4 \
  --style dynamic \
  --duration 45 \
  --voice nova
```

## 📋 명령어 옵션

### `generate` 명령어

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-f, --file <path>` | 블로그 글 파일 경로 (.md, .html, .txt) | - |
| `-u, --url <url>` | 블로그 글 URL | - |
| `-t, --text <text>` | 직접 텍스트 입력 | - |
| `-o, --output <path>` | 출력 비디오 경로 | `./output/shorts.mp4` |
| `-s, --style <style>` | 비디오 스타일 (modern, minimal, dynamic) | `modern` |
| `-d, --duration <seconds>` | 비디오 길이 (초) | `60` |
| `--no-audio` | 음성 생성 제외 | false |
| `--voice <voice>` | OpenAI 음성 선택 | `nova` |

### 사용 가능한 음성

- `alloy`: 중립적인 남성 목소리
- `echo`: 남성 목소리
- `fable`: 영국식 남성 목소리
- `onyx`: 깊은 남성 목소리
- `nova`: 여성 목소리 (기본값)
- `shimmer`: 밝은 여성 목소리

### 스타일 옵션

- **modern**: 보라색 그라데이션 배경의 현대적인 스타일
- **minimal**: 깨끗하고 미니멀한 회색톤 스타일
- **dynamic**: 화려한 핑크/옐로우 그라데이션 스타일

## 📁 프로젝트 구조

```
Shorts/
├── src/
│   ├── parsers/          # 블로그 글 파싱
│   │   └── blogParser.ts
│   ├── generators/       # AI 스크립트 & 음성 생성
│   │   ├── scriptGenerator.ts
│   │   └── audioGenerator.ts
│   ├── renderers/        # 비디오 렌더링
│   │   ├── ShortsComposition.tsx
│   │   ├── videoRenderer.ts
│   │   └── Root.tsx
│   ├── utils/           # 유틸리티
│   │   └── logger.ts
│   ├── types.ts         # TypeScript 타입 정의
│   └── index.ts         # 메인 CLI
├── output/              # 생성된 비디오
├── temp/                # 임시 파일 (음성 등)
├── .env                 # 환경 변수 (생성 필요)
├── .env.example         # 환경 변수 예시
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 사용 예시

### 예시 1: 일일 주식 분석 쇼츠

```bash
# 오늘의 시장 분석 블로그 글로 쇼츠 생성
npm run dev generate \
  --file ./posts/2024-01-15-market-analysis.md \
  --style modern \
  --duration 60 \
  --output ./output/daily-analysis-0115.mp4
```

### 예시 2: 급등주 속보 쇼츠 (짧게)

```bash
# 30초 짧은 버전
npm run dev generate \
  --url "https://blog.example.com/breaking-stock-news" \
  --style dynamic \
  --duration 30 \
  --output ./output/breaking-news.mp4
```

### 예시 3: 투자 팁 시리즈

```bash
# 미니멀 스타일로 깔끔하게
npm run dev generate \
  --file ./tips/investment-tip-01.md \
  --style minimal \
  --voice shimmer \
  --output ./output/tip-01.mp4
```

## 🔧 자동화 워크플로우

### 매일 자동 쇼츠 생성 (cron 예시)

```bash
#!/bin/bash
# daily-shorts.sh

# 오늘 날짜
TODAY=$(date +%Y-%m-%d)

# 블로그 디렉토리에서 오늘 작성한 글 찾기
BLOG_FILE="./blog/posts/${TODAY}-*.md"

# 쇼츠 생성
npm run dev generate \
  --file $BLOG_FILE \
  --output "./output/shorts-${TODAY}.mp4" \
  --style modern

# YouTube에 자동 업로드 (별도 스크립트 필요)
# ./upload-to-youtube.sh "./output/shorts-${TODAY}.mp4"
```

crontab 설정 (매일 오후 6시):
```bash
0 18 * * * /path/to/daily-shorts.sh
```

## 📊 생성 프로세스

1. **블로그 글 파싱** (5초)
   - Markdown, HTML, 텍스트 파일 또는 URL에서 내용 추출
   - 제목, 본문 정리

2. **AI 스크립트 생성** (10-15초)
   - GPT-4로 핵심 내용 추출
   - 쇼츠에 최적화된 스크립트 생성
   - 훅(Hook), 핵심 포인트, 결론, 해시태그 자동 생성

3. **음성 합성** (10-20초)
   - OpenAI TTS 또는 ElevenLabs로 음성 생성
   - 자연스러운 한국어 발음

4. **비디오 렌더링** (1-3분)
   - Remotion으로 프로페셔널한 비디오 생성
   - 애니메이션, 자막, 시각 효과 추가
   - 1080x1920 (9:16) 세로 비디오 출력

## 🎨 커스터마이징

### 비디오 스타일 수정

`src/renderers/ShortsComposition.tsx` 파일에서 배경색, 폰트, 애니메이션 등을 수정할 수 있습니다.

### AI 프롬프트 조정

`src/generators/scriptGenerator.ts`의 `createPrompt` 메서드에서 GPT 프롬프트를 수정하여 스크립트 스타일을 변경할 수 있습니다.

### 비디오 설정

`src/renderers/videoRenderer.ts`에서 해상도, FPS, 코덱 등을 조정할 수 있습니다.

## 🐛 문제 해결

### 음성 생성 오류
```bash
# OpenAI API 키 확인
npm run dev config

# 음성 없이 테스트
npm run dev generate --file test.md --no-audio
```

### 비디오 렌더링 실패
- Chrome/Chromium이 설치되어 있는지 확인
- 충분한 디스크 공간 확보 (최소 1GB)
- Node.js 버전 확인 (v18 이상 권장)

### 메모리 부족
```bash
# Node 메모리 제한 증가
NODE_OPTIONS="--max-old-space-size=4096" npm run dev generate --file blog.md
```

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR을 환영합니다!

## 📞 지원

문제가 발생하면 이슈를 등록해주세요.

---

**만든 이**: AI 기반 콘텐츠 자동화 팀
**버전**: 1.0.0
