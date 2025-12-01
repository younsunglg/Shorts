#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { BlogParser } from './parsers/BlogParser.js';
import { VoiceGenerator } from './generators/VoiceGenerator.js';
import { StockVideoFetcher } from './generators/StockVideoFetcher.js';
import { AdvancedSubtitleGenerator } from './renderers/AdvancedSubtitleGenerator.js';
import { AudioMixer } from './renderers/AudioMixer.js';
import { VideoComposer } from './renderers/VideoComposer.js';

dotenv.config();

async function main() {
  const startTime = Date.now();
  console.log('🚀 쇼츠 생성 시작... (하이브리드 최고 품질)\n');

  // 디렉토리 생성
  const outputDir = path.resolve('./output');
  const tempDir = path.resolve('./temp');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(tempDir, { recursive: true });

  // 1. 블로그 글 파싱
  console.log('📖 블로그 파싱 중...');
  const blogPath = path.resolve('./blog.md');
  const blogMarkdown = await fs.readFile(blogPath, 'utf-8');

  const parser = new BlogParser();
  const blogContent = parser.parse(blogMarkdown);

  console.log(`✅ 제목: "${blogContent.title}"`);
  console.log(`✅ 30초 요약: ${blogContent.summary.length}개 포인트\n`);

  // 2. 스크립트 생성
  const script = parser.toScript(blogContent);
  const scriptPath = path.join(outputDir, 'script.txt');
  await fs.writeFile(scriptPath, script, 'utf-8');

  console.log('📝 스크립트:');
  blogContent.summary.forEach((point, i) => {
    console.log(`   ${i + 1}. ${point.substring(0, 60)}...`);
  });
  console.log();

  // 3. 음성 생성 (나레이션)
  const voiceGen = new VoiceGenerator();
  const narrationPath = path.join(tempDir, 'narration.mp3');
  await voiceGen.generate(script, narrationPath);

  // 4. 오디오 길이 확인
  const narrationDuration = await voiceGen.getDuration(narrationPath);
  console.log(`📊 나레이션 길이: ${narrationDuration.toFixed(1)}초\n`);

  // 5. BGM 믹싱 (옵션)
  const audioMixer = new AudioMixer();
  let finalAudioPath = narrationPath;

  const bgmPath = process.env.BGM_PATH || path.join(tempDir, 'bgm.mp3');
  const hasBGM = await fs.access(bgmPath).then(() => true).catch(() => false);

  if (hasBGM) {
    console.log('🎵 BGM 믹싱 중...');
    const mixedAudioPath = path.join(tempDir, 'audio_mixed.mp3');
    await audioMixer.mix({
      narrationPath,
      bgmPath,
      outputPath: mixedAudioPath,
      narrationVolume: 100,
      bgmVolume: 25,
      fadeIn: 2,
      fadeOut: 3,
    });
    finalAudioPath = mixedAudioPath;
    console.log();
  }

  // 6. 고급 자막 생성 (단어 단위)
  const advSubtitleGen = new AdvancedSubtitleGenerator();
  const wordTimings = advSubtitleGen.createWordTimings(blogContent, narrationDuration);
  const subtitlePath = path.join(tempDir, 'subtitles.ass');
  await advSubtitleGen.generateASS(wordTimings, subtitlePath);
  console.log();

  // 7. 배경 비디오 준비
  const videoComposer = new VideoComposer();
  let backgroundPath: string;

  // 스톡 비디오 시도 (Pexels API)
  const stockVideoFetcher = new StockVideoFetcher();
  const stockKeyword = '주식 차트'; // 또는 blogContent.title에서 추출
  const rawStockPath = path.join(tempDir, 'stock_raw.mp4');
  const preparedStockPath = path.join(tempDir, 'stock_prepared.mp4');

  const stockVideo = await stockVideoFetcher.fetch(stockKeyword, rawStockPath);

  if (stockVideo) {
    // 스톡 비디오 준비 (크기 조정 + 루프)
    await videoComposer.prepareStockVideo(rawStockPath, preparedStockPath, narrationDuration);
    backgroundPath = preparedStockPath;
  } else {
    // 폴백: 단색 배경
    console.log('📐 단색 배경 생성 중...');
    backgroundPath = path.join(tempDir, 'background.mp4');
    await videoComposer.createBackground(narrationDuration, backgroundPath);
  }
  console.log();

  // 8. 최종 비디오 합성 (시각 효과 포함)
  const outputPath = path.join(outputDir, 'shorts.mp4');
  await videoComposer.compose(
    backgroundPath,
    finalAudioPath,
    subtitlePath,
    outputPath,
    narrationDuration,
    {
      darkOverlay: true,        // 배경 어둡게
      gradientOverlay: true,    // 그라데이션 오버레이
    }
  );

  // 완료
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(60));
  console.log(`✨ 완료! (${elapsed}초 소요)`);
  console.log('='.repeat(60));
  console.log(`\n📁 생성된 파일:`);
  console.log(`   🎬 비디오: ${outputPath}`);
  console.log(`   📝 스크립트: ${scriptPath}`);
  console.log(`   🎤 음성: ${finalAudioPath}`);
  console.log(`   📜 자막: ${subtitlePath}`);
  console.log(`\n💡 Tip: CapCut으로 추가 편집하면 더 좋은 결과를 얻을 수 있습니다!`);
}

main().catch((error) => {
  console.error('\n❌ 오류 발생:', error.message);
  console.error(error.stack);
  process.exit(1);
});
