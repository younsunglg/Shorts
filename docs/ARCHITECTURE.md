# 시스템 아키텍처

## 개요

이 시스템은 주식 블로그 글을 입력받아 AI 기반 분석을 통해 YouTube Shorts 형식의 비디오를 자동 생성합니다.

## 시스템 구조

```
┌─────────────────┐
│   Blog Post     │
│  (MD/HTML/URL)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Blog Parser    │ ← 파싱 & 텍스트 추출
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Script Generator│ ← GPT-4로 스크립트 생성
│   (OpenAI)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Audio Generator │ ← TTS로 음성 생성
│ (OpenAI/11Labs) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Video Renderer  │ ← Remotion으로 렌더링
│   (Remotion)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Output Video   │
│    (MP4)        │
└─────────────────┘
```

## 모듈 설명

### 1. BlogParser

**역할**: 다양한 형식의 블로그 글을 파싱하여 구조화된 데이터로 변환

**입력**:
- Markdown 파일 (.md)
- HTML 파일 (.html)
- URL
- 일반 텍스트

**출력**:
```typescript
{
  title: string,
  content: string,
  summary?: string,
  mainPoints?: string[]
}
```

**주요 기능**:
- Markdown 문법 제거 및 텍스트 추출
- HTML 파싱 (cheerio 사용)
- 웹 크롤링 (axios)
- 통계 정보 계산 (단어 수, 읽기 시간 등)

### 2. ScriptGenerator

**역할**: AI를 활용하여 블로그 내용을 쇼츠에 최적화된 스크립트로 변환

**사용 API**: OpenAI GPT-4 Turbo

**프롬프트 구조**:
1. 시스템 프롬프트: 역할 정의 (주식 전문가 + 쇼츠 크리에이터)
2. 사용자 프롬프트: 블로그 내용 + 요구사항

**출력 구조**:
```typescript
{
  hook: string,           // 3초 훅
  mainContent: string[],  // 핵심 포인트 3-5개
  conclusion: string,     // 결론 & CTA
  hashtags: string[]      // 해시태그 5-7개
}
```

**최적화 요소**:
- 시청자 주목도 향상을 위한 훅 생성
- 60초 내 전달 가능한 핵심 요약
- SEO 최적화 해시태그

### 3. AudioGenerator

**역할**: 텍스트를 자연스러운 음성으로 변환

**지원 TTS 엔진**:
1. **OpenAI TTS** (기본)
   - 모델: tts-1-hd
   - 음성: 6가지 (nova, alloy, echo, fable, onyx, shimmer)
   - 다국어 지원
   - 가격: ~$15/1M characters

2. **ElevenLabs** (옵션)
   - 모델: eleven_multilingual_v2
   - 더 자연스러운 음성
   - 가격: 구독제

**음성 파일 형식**: MP3 (128kbps)

### 4. VideoRenderer

**역할**: React 컴포넌트 기반으로 비디오 렌더링

**사용 프레임워크**: Remotion

**렌더링 파이프라인**:
```
React Component (TSX)
  ↓
Webpack Bundle
  ↓
Headless Chrome
  ↓
Frame-by-frame Render
  ↓
FFmpeg Encoding
  ↓
MP4 Output
```

**비디오 스펙**:
- 해상도: 1080x1920 (9:16 세로)
- 프레임레이트: 30fps
- 코덱: H.264
- 비트레이트: 자동 (고품질)

**스타일 시스템**:
- Modern: 보라색 그라데이션
- Minimal: 회색톤 미니멀
- Dynamic: 핑크/옐로우 그라데이션

## 데이터 흐름

### 1. 입력 단계
```
User Input → BlogParser → BlogPost Object
```

### 2. AI 처리 단계
```
BlogPost → ScriptGenerator (GPT-4) → ShortsScript
```

### 3. 멀티미디어 생성 단계
```
ShortsScript → AudioGenerator (TTS) → Audio File
            ↘
              VideoRenderer (Remotion) → Video File
```

### 4. 출력 단계
```
Video File (MP4) + Script (JSON) + Audio (MP3)
```

## 성능 최적화

### 병렬 처리
- 스크립트 생성과 음성 생성은 순차적
- 비디오 렌더링은 별도 프로세스

### 캐싱 전략
- AI 생성 스크립트를 JSON으로 저장
- 재렌더링 시 스크립트 재사용 가능
- 음성 파일 캐싱 (temp 디렉토리)

### 리소스 관리
- 임시 파일 자동 정리
- 메모리 효율적인 스트리밍 처리
- 비디오 렌더링 시 CPU 코어 활용

## 확장성

### 수평 확장
```
┌─────────────┐
│ Load Balance│
└──────┬──────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│ W#1 │ │ W#2 │ │ W#3 │ │ W#4 │
└─────┘ └─────┘ └─────┘ └─────┘
Workers (병렬 처리)
```

### 큐 시스템 통합
```
┌──────┐    ┌───────┐    ┌────────┐
│ API  │ → │ Queue │ → │ Worker │
└──────┘    └───────┘    └────────┘
           (Bull/Redis)
```

## 보안

### API 키 관리
- `.env` 파일로 환경 변수 관리
- 절대 하드코딩 금지
- `.gitignore`에 `.env` 추가

### 입력 검증
- URL 화이트리스트
- 파일 크기 제한
- 텍스트 길이 제한

### 출력 보안
- 생성된 파일 권한 관리
- 임시 파일 자동 삭제
- 사용자별 격리된 출력 디렉토리

## 에러 처리

### 계층별 에러 핸들링

```typescript
try {
  // BlogParser
} catch (ParsingError) {
  // 파싱 실패 → 사용자에게 형식 오류 알림
}

try {
  // ScriptGenerator
} catch (OpenAIError) {
  // API 오류 → 재시도 또는 대체 모델 사용
}

try {
  // AudioGenerator
} catch (TTSError) {
  // 음성 생성 실패 → 텍스트 전용 비디오 생성
}

try {
  // VideoRenderer
} catch (RenderError) {
  // 렌더링 실패 → 설정 조정 후 재시도
}
```

## 모니터링

### 로깅 레벨
- INFO: 정상 작업 진행
- WARN: 경고 (재시도 가능)
- ERROR: 오류 (사용자 개입 필요)

### 메트릭
- 평균 생성 시간
- API 호출 횟수
- 성공/실패율
- 리소스 사용량 (CPU, 메모리)

## 기술 스택

### 코어
- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Build**: TSC (TypeScript Compiler)

### 주요 라이브러리
- **AI**: OpenAI SDK
- **Video**: Remotion
- **Parsing**: Cheerio, Axios
- **CLI**: Commander, Inquirer, Chalk

### 인프라
- **Package Manager**: npm
- **Version Control**: Git
- **Environment**: dotenv

## 향후 개선 사항

### 단기
- [ ] 자막 타이밍 정확도 개선 (Whisper API 활용)
- [ ] 차트/그래프 이미지 삽입 기능
- [ ] 배치 처리 최적화

### 중기
- [ ] 웹 UI 제공
- [ ] 템플릿 시스템
- [ ] 자동 업로드 (YouTube, Instagram)

### 장기
- [ ] 다국어 지원 확대
- [ ] 실시간 렌더링 프리뷰
- [ ] AI 음성 클로닝
- [ ] 자동 A/B 테스팅
