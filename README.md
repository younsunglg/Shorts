# Shorts Generator

블로그 글을 YouTube 쇼츠로 자동 변환하는 간단한 도구

## 📦 설치

```bash
npm install
```

## ⚙️ 설정

1. `.env` 파일 생성:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

2. Google TTS 설치 (무료):

```bash
pip install gTTS
```

## 📝 사용법

1. `blog-content.txt` 파일에 블로그 글 작성

2. 쇼츠 생성:

```bash
npm run generate
```

3. `output/shorts.mp4` 확인

## 🎬 생성되는 파일

- `output/shorts.mp4` - 최종 비디오
- `output/script.json` - AI 생성 스크립트
- `temp/audio.mp3` - 음성 파일
- `temp/subtitles.ass` - 자막 파일

## 🔧 기술 스택

- **AI**: OpenAI GPT-4o-mini (스크립트 생성)
- **TTS**: Google TTS (음성 생성) - **완전 무료!**
- **Video**: FFmpeg (비디오 합성)
- **Subtitles**: ASS 포맷

## 📄 구조

```
src/
  services/
    ScriptGenerator.ts   # AI 스크립트 생성
    AudioGenerator.ts    # TTS 음성 생성
    SubtitleGenerator.ts # ASS 자막 생성
    VideoComposer.ts     # FFmpeg 비디오 합성
  index.ts              # 메인 실행 파일
  types.ts              # 타입 정의
```

간단하고 깔끔합니다! 🎉
