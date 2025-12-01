# 블로그 → 쇼츠 자동화 시스템

## 🎯 핵심 전략

### 블로그 구조 활용
당신의 블로그는 이미 쇼츠에 최적화된 구조입니다:
- **30초 요약**: 5개 불릿 포인트 (각 10-15초)
- **짧고 임팩트 있음**: AI 가공 불필요

### sb-render 활용
sb-render의 모듈을 그대로 활용:
- `SubtitleEngine`: ASS 자막 생성
- `AudioMixer`: BGM + 나레이션
- `VideoComposer`: FFmpeg 합성

## 📁 최적화된 구조

```
src/
  parsers/
    BlogParser.ts          # Markdown 파싱 → 30초 요약 추출

  generators/
    VoiceGenerator.ts      # Google TTS (무료)

  renderers/
    SubtitleEngine.ts      # sb-render 기반 (ASS)
    AudioMixer.ts          # sb-render 기반
    VideoComposer.ts       # sb-render 기반

  index.ts                # 메인 워크플로우
```

## 🔄 워크플로우

1. **블로그 파싱** (BlogParser)
   - Markdown에서 "30초 요약" 섹션 추출
   - 5개 불릿 포인트 배열로 변환

2. **음성 생성** (VoiceGenerator)
   - Google TTS로 각 포인트 음성 생성
   - 포인트별 개별 파일 생성

3. **자막 생성** (SubtitleEngine)
   - sb-render의 ASS 엔진 활용
   - 각 포인트 타이밍에 맞춰 자막 배치

4. **비디오 합성** (VideoComposer)
   - 배경 생성
   - 음성 + 자막 합성
   - 최종 MP4 출력

## ⚡ 장점

1. **AI 가공 불필요**: 30초 요약이 이미 완벽
2. **검증된 코드**: sb-render의 안정적인 모듈 활용
3. **빠른 처리**: 불필요한 AI 호출 제거
4. **비용 절감**: OpenAI API 호출 최소화

## 💰 비용

- Google TTS: **완전 무료**
- OpenAI (옵션): 제목만 다듬을 경우 $0.0001
- 총 비용: **$0/영상**
