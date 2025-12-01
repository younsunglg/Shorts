# 블로그 → 쇼츠 자동 생성기

**sb-render** 기반으로 당신의 전문 블로그를 YouTube 쇼츠로 자동 변환합니다.

## ✨ 핵심 특징

- 📖 **30초 요약 자동 추출**: Markdown 구조 파싱
- 🎤 **Google TTS**: 완전 무료 음성 생성
- 📝 **ASS 자막**: sb-render의 검증된 SubtitleEngine
- 🎬 **FFmpeg 합성**: 빠르고 안정적인 비디오 렌더링
- 💰 **완전 무료**: AI API 사용 없음 (Google TTS만 사용)

## 🚀 빠른 시작

### 1. 설치

```bash
npm install
pip install gTTS
```

### 2. 블로그 작성

`blog.md` 파일에 다음 구조로 작성:

```markdown
## 1. [제목] 여기에 제목 작성

## 2. 🕒 30초 요약
* 핵심 포인트 1
* 핵심 포인트 2
* 핵심 포인트 3
* 핵심 포인트 4
* 핵심 포인트 5

## 3. 🎙️ Analyst's Note
(상세 분석 작성...)
```

### 3. 쇼츠 생성

```bash
npm run generate
```

### 4. 결과 확인

- `output/shorts.mp4` - 최종 쇼츠 영상
- `output/script.txt` - 사용된 스크립트
- `temp/audio.mp3` - 생성된 음성
- `temp/subtitles.ass` - ASS 자막

## 📊 워크플로우

```
blog.md
   ↓ [BlogParser]
30초 요약 추출
   ↓ [VoiceGenerator]
Google TTS 음성 생성
   ↓ [SubtitleEngine]
ASS 자막 생성
   ↓ [VideoComposer]
FFmpeg 비디오 합성
   ↓
shorts.mp4 완성!
```

## 🔧 기술 스택

| 구성 요소 | 기술 |
|----------|------|
| 파싱 | Custom Markdown Parser |
| TTS | Google TTS (gTTS) |
| 자막 | sb-render SubtitleEngine (ASS) |
| 비디오 | sb-render VideoComposer (FFmpeg) |
| 언어 | TypeScript |

## 📁 프로젝트 구조

```
src/
  parsers/
    BlogParser.ts          # Markdown 파싱, 30초 요약 추출
  generators/
    VoiceGenerator.ts      # Google TTS
  renderers/
    SubtitleEngine.ts      # sb-render 기반 ASS 자막
    VideoComposer.ts       # sb-render 기반 FFmpeg 합성
  index.ts                 # 메인 워크플로우
```

## 🎨 커스터마이징

### 자막 스타일 수정

`src/index.ts`의 자막 생성 부분:

```typescript
await subtitleEngine.generateASS(timings, subtitlePath, {
  fontSize: 85,              // 폰트 크기
  primaryColor: '#FFFFFF',   // 텍스트 색상
  outlineColor: '#000000',   // 테두리 색상
  outlineWidth: 4,           // 테두리 두께
  bold: true,                // 볼드
  position: 'bottom',        // 위치 (top/middle/bottom)
});
```

### 배경 색상 변경

```typescript
await videoComposer.createBackground(audioDuration, backgroundPath, '#667eea');
```

## 💡 블로그 구조 요구사항

당신의 블로그는 다음 구조를 따라야 합니다:

1. **제목**: `## 1. [제목]` 형식
2. **30초 요약**: `## 2. 🕒 30초 요약` 섹션 필수
3. **불릿 포인트**: `*`로 시작하는 5개 내외의 핵심 포인트

이 구조는 이미 쇼츠에 최적화되어 있어, 별도의 AI 가공이 필요 없습니다!

## 📈 성능

- **처리 시간**: 약 20-40초 (오디오 길이에 따라 변동)
- **비용**: **$0** (Google TTS 무료)
- **품질**: 1080×1920 (Full HD 세로)

## 🎯 장점

1. ✅ **AI API 불필요**: 30초 요약이 이미 완벽
2. ✅ **검증된 코드**: sb-render의 안정적인 렌더링 엔진
3. ✅ **빠른 처리**: 불필요한 AI 호출 제거
4. ✅ **완전 무료**: Google TTS만 사용
5. ✅ **커스터마이징 쉬움**: 명확한 모듈 구조

## 🙏 Credits

이 프로젝트는 [@choisb87](https://github.com/choisb87)의 [sb-render](https://github.com/choisb87/sb-render) 라이브러리를 기반으로 합니다.

## 📄 라이선스

MIT License
