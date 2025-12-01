#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { BlogParser } from './parsers/BlogParser.js';
import { VoiceGenerator } from './generators/VoiceGenerator.js';
import { SubtitleEngine } from './renderers/SubtitleEngine.js';
import { VideoComposer } from './renderers/VideoComposer.js';

async function main() {
  const startTime = Date.now();
  console.log('🚀 쇼츠 생성 시작...\n');

  // 디렉토리 생성
  const outputDir = path.resolve('./output');
  const tempDir = path.resolve('./temp');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(tempDir, { recursive: true });

  // 1. 블로그 글 읽기
  console.log('📖 블로그 파싱 중...');
  const blogPath = path.resolve('./blog.md');
  const blogMarkdown = await fs.readFile(blogPath, 'utf-8');

  const parser = new BlogParser();
  const blogContent = parser.parse(blogMarkdown);

  console.log(`✅ 제목: "${blogContent.title}"`);
  console.log(`✅ 30초 요약: ${blogContent.summary.length}개 포인트\n`);

  // 2. 스크립트 생성 (30초 요약을 그대로 사용)
  const script = parser.toScript(blogContent);
  const scriptPath = path.join(outputDir, 'script.txt');
  await fs.writeFile(scriptPath, script, 'utf-8');

  console.log('📝 스크립트:');
  blogContent.summary.forEach((point, i) => {
    console.log(`   ${i + 1}. ${point}`);
  });
  console.log();

  // 3. 음성 생성
  const voiceGen = new VoiceGenerator();
  const audioPath = path.join(tempDir, 'audio.mp3');
  await voiceGen.generate(script, audioPath);

  // 4. 오디오 길이 확인
  const audioDuration = await voiceGen.getDuration(audioPath);
  console.log(`📊 오디오 길이: ${audioDuration.toFixed(1)}초\n`);

  // 5. 타이밍 계산
  const timings = parser.calculateTimings(blogContent.summary, audioDuration);

  // 6. 자막 생성
  const subtitleEngine = new SubtitleEngine();
  const subtitlePath = path.join(tempDir, 'subtitles.ass');
  await subtitleEngine.generateASS(timings, subtitlePath, {
    fontSize: 85,
    primaryColor: '#FFFFFF',
    outlineColor: '#000000',
    outlineWidth: 4,
    bold: true,
    position: 'bottom',
  });
  console.log();

  // 7. 배경 생성
  const videoComposer = new VideoComposer();
  const backgroundPath = path.join(tempDir, 'background.mp4');
  await videoComposer.createBackground(audioDuration, backgroundPath, '#667eea');
  console.log();

  // 8. 최종 비디오 합성
  const outputPath = path.join(outputDir, 'shorts.mp4');
  await videoComposer.compose(
    backgroundPath,
    audioPath,
    subtitlePath,
    outputPath,
    audioDuration
  );

  // 완료
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(60));
  console.log(`✨ 완료! (${elapsed}초 소요)`);
  console.log('='.repeat(60));
  console.log(`\n📁 생성된 파일:`);
  console.log(`   비디오: ${outputPath}`);
  console.log(`   스크립트: ${scriptPath}`);
  console.log(`   음성: ${audioPath}`);
  console.log(`   자막: ${subtitlePath}`);
}

main().catch((error) => {
  console.error('\n❌ 오류 발생:', error.message);
  console.error(error.stack);
  process.exit(1);
});
