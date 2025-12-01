#!/bin/bash

# 주식 블로그 쇼츠 생성기 - 빠른 시작 스크립트

echo "📱 주식 블로그 쇼츠 생성기"
echo "=========================="
echo ""

# API 키 확인
if [ ! -f .env ]; then
  echo "⚠️  .env 파일이 없습니다."
  echo "   .env.example을 복사하여 .env 파일을 생성하고 API 키를 설정하세요."
  echo ""
  echo "   cp .env.example .env"
  echo "   nano .env"
  echo ""
  exit 1
fi

# 의존성 확인
if [ ! -d node_modules ]; then
  echo "📦 의존성 설치 중..."
  npm install
  echo ""
fi

# 디렉토리 생성
mkdir -p output temp

echo "✨ 예시 블로그 글로 쇼츠 생성을 시작합니다..."
echo ""

# 예시 쇼츠 생성
npm run dev generate \
  --file ./examples/sample-blog-post.md \
  --output ./output/sample-shorts.mp4 \
  --style modern \
  --duration 60

echo ""
echo "✅ 완료!"
echo ""
echo "생성된 파일:"
echo "  - 비디오: ./output/sample-shorts.mp4"
echo "  - 스크립트: ./output/script.json"
echo "  - 음성: ./temp/audio.mp3"
echo ""
echo "이제 YouTube Shorts에 업로드해보세요! 🚀"
