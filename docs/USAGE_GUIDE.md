# 📖 상세 사용 가이드

## 목차
1. [기본 워크플로우](#기본-워크플로우)
2. [입력 형식별 가이드](#입력-형식별-가이드)
3. [스타일 선택 가이드](#스타일-선택-가이드)
4. [최적화 팁](#최적화-팁)
5. [자주 묻는 질문](#자주-묻는-질문)

## 기본 워크플로우

### 1단계: 블로그 글 작성

매일 주식 분석 블로그를 작성합니다. 다음 형식을 권장합니다:

```markdown
# [종목명] 오늘의 시장 분석

## 핵심 요약
- 주요 포인트 1
- 주요 포인트 2
- 주요 포인트 3

## 상세 분석
[상세 내용...]

## 투자 전략
[전략 내용...]

## 결론
[마무리...]
```

### 2단계: 쇼츠 생성

```bash
npm run dev generate --file ./blog/today-analysis.md
```

### 3단계: 결과 확인

생성된 파일:
- `output/shorts.mp4` - 최종 비디오
- `output/script.json` - AI 생성 스크립트
- `temp/audio.mp3` - 음성 파일

### 4단계: 업로드

YouTube Shorts, 인스타그램 릴스, TikTok 등에 업로드합니다.

## 입력 형식별 가이드

### Markdown 파일 (.md)

가장 권장하는 형식입니다.

```bash
npm run dev generate --file ./blog/post.md
```

**장점:**
- 제목과 본문 구조화
- 리스트, 강조 등 자동 인식
- 깔끔한 텍스트 추출

**팁:**
- 제목은 `# ` (H1)로 작성
- 핵심 포인트는 리스트로 작성
- 불필요한 이미지/링크는 자동 제거됨

### HTML 파일 (.html)

웹 페이지나 HTML 형식의 블로그 글을 사용할 수 있습니다.

```bash
npm run dev generate --file ./blog/exported-post.html
```

**자동 처리:**
- `<article>`, `<main>` 태그 우선 추출
- `<script>`, `<style>` 자동 제거
- 제목은 `<h1>` 또는 `<title>` 태그에서 추출

### URL에서 직접 가져오기

```bash
npm run dev generate --url "https://yourblog.com/posts/stock-analysis"
```

**주의사항:**
- 일부 사이트는 크롤링 방지가 있을 수 있음
- 로그인이 필요한 콘텐츠는 불가능
- 대안: HTML로 저장 후 `--file` 사용

### 직접 텍스트 입력

짧은 내용이나 테스트용:

```bash
npm run dev generate --text "삼성전자가 오늘 5% 급등했습니다. 반도체 업황 회복 기대감이 반영된 것으로 보입니다."
```

## 스타일 선택 가이드

### Modern (기본)

```bash
--style modern
```

**특징:**
- 보라색 그라데이션 배경
- 흰색 텍스트
- 세련되고 프로페셔널한 느낌

**추천 용도:**
- 일반 시장 분석
- 투자 전략 공유
- 교육 콘텐츠

### Minimal

```bash
--style minimal
```

**특징:**
- 회색톤 배경
- 검은색 텍스트
- 깔끔하고 심플한 디자인

**추천 용도:**
- 데이터 중심 콘텐츠
- 차트/그래프 설명
- 사실 위주의 뉴스

### Dynamic

```bash
--style dynamic
```

**특징:**
- 핑크/옐로우 그라데이션
- 화려하고 에너지 넘치는 느낌
- 흰색 텍스트

**추천 용도:**
- 급등주/속보
- 주목할 이벤트
- 긴급 알림

## 최적화 팁

### 1. 블로그 글 작성 팁

✅ **좋은 예:**
```markdown
# 삼성전자 5% 급등, 반도체 업황 회복 신호

- 오늘 삼성전자 주가 5% 상승
- HBM 수요 증가가 주요 원인
- 목표가 상향 전망
```

❌ **피해야 할 것:**
```markdown
# 제목이 너무 길면 쇼츠 화면에 다 안 나옵니다 반도체 업황이 회복되면서...

[이미지]
[광고]
[관련 링크 100개]
너무 장황한 설명이 계속 이어지면...
```

### 2. 길이 최적화

**30초 버전** (빠른 속보용):
```bash
--duration 30
```
- 훅 + 핵심 2-3개 + 짧은 결론

**60초 버전** (기본, 추천):
```bash
--duration 60
```
- 훅 + 핵심 3-5개 + 상세 결론

**90초 버전** (심층 분석용):
```bash
--duration 90
```
- 더 자세한 설명 가능

### 3. 음성 선택

**여성 목소리:**
- `nova` (기본, 자연스러움) ⭐
- `shimmer` (밝고 경쾌함)

**남성 목소리:**
- `alloy` (중립적)
- `onyx` (깊고 권위있음)
- `echo` (친근함)

### 4. 배치 처리

여러 글을 한 번에 처리:

```bash
#!/bin/bash
# batch-generate.sh

for file in ./blog/posts/*.md; do
  filename=$(basename "$file" .md)
  npm run dev generate \
    --file "$file" \
    --output "./output/${filename}.mp4"
done
```

## 자주 묻는 질문

### Q1: 쇼츠 생성 시간은 얼마나 걸리나요?

**일반적인 경우:**
- 블로그 파싱: 5초
- AI 스크립트 생성: 10-15초
- 음성 생성: 10-20초
- 비디오 렌더링: 1-3분
- **총 약 2-4분**

### Q2: 비용은 얼마나 드나요?

**OpenAI API 비용 (쇼츠 1개 기준):**
- GPT-4 (스크립트): ~$0.01-0.03
- TTS (음성): ~$0.05-0.10
- **총 약 $0.06-0.13** (100원 이하)

### Q3: 한국어 외 다른 언어도 지원하나요?

네! OpenAI TTS는 다국어를 지원합니다. 블로그를 영어로 작성하면 영어 쇼츠가 생성됩니다.

### Q4: 자막을 커스터마이징할 수 있나요?

`src/renderers/ShortsComposition.tsx`에서 폰트, 크기, 색상 등을 수정할 수 있습니다.

```tsx
style={{
  fontSize: '64px',  // 폰트 크기
  fontWeight: 'bold',
  color: '#ffffff',  // 색상
  // ...
}}
```

### Q5: 로고나 워터마크를 추가하려면?

`ShortsComposition.tsx`에 이미지 컴포넌트를 추가하세요:

```tsx
<Img
  src={staticFile('logo.png')}
  style={{
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 100,
    height: 100,
  }}
/>
```

### Q6: YouTube에 자동 업로드하려면?

YouTube Data API를 사용하는 별도 스크립트가 필요합니다:

```bash
# 예시 (youtube-upload 패키지 사용)
npm install youtube-upload
node scripts/upload-to-youtube.js ./output/shorts.mp4
```

### Q7: 차트나 그래프를 포함하려면?

현재는 텍스트만 지원합니다. 향후 업데이트에서 이미지/차트 지원 예정입니다.

임시 해결책:
1. 차트를 이미지로 저장
2. `ShortsComposition.tsx`에서 `<Img>` 컴포넌트로 추가

### Q8: 생성된 스크립트를 수정하려면?

1. 먼저 스크립트만 생성:
```bash
npm run dev generate --file blog.md --no-audio
```

2. `output/script.json` 수정

3. 수정된 스크립트로 비디오 생성:
```bash
npm run dev render --script output/script.json
```

### Q9: 에러 발생 시 디버깅 방법은?

```bash
# 상세 로그 출력
DEBUG=* npm run dev generate --file test.md

# API 키 확인
npm run dev config

# 단계별 테스트
npm run dev generate --file test.md --no-audio  # 음성 제외
npm run dev generate --text "테스트"  # 간단한 텍스트로
```

### Q10: 프로덕션 환경에서 사용하려면?

```bash
# 빌드
npm run build

# 프로덕션 실행
node dist/index.js generate --file blog.md
```

서버에서 자동화:
```bash
# PM2로 관리
pm2 start dist/index.js --name "shorts-generator"

# 또는 systemd 서비스로 등록
```

## 고급 사용법

### n8n 워크플로우 통합

n8n에서 HTTP 요청 노드로 실행:

```json
{
  "method": "POST",
  "url": "http://your-server/api/generate-shorts",
  "body": {
    "blogUrl": "https://blog.example.com/post",
    "style": "modern"
  }
}
```

### API 서버로 변환

`src/api/server.ts` 추가:

```typescript
import express from 'express';

const app = express();
app.post('/generate', async (req, res) => {
  // 쇼츠 생성 로직
});

app.listen(3000);
```

### Webhook 트리거

블로그 발행 시 자동으로 쇼츠 생성:

```bash
# Webhook 서버 실행
node webhook-server.js

# 블로그 CMS에서 webhook 설정
# POST https://your-server/webhook/blog-published
```

---

더 궁금한 점이 있으시면 이슈를 등록해주세요!
