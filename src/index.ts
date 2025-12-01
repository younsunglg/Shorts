#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { ScriptGenerator } from './services/ScriptGenerator.js';
import { AudioGenerator } from './services/AudioGenerator.js';
import { SubtitleGenerator } from './services/SubtitleGenerator.js';
import { VideoComposer } from './services/VideoComposer.js';

dotenv.config();

async function main() {
  const startTime = Date.now();

  console.log('🚀 쇼츠 생성 시작...\n');

  // API 키 확인
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }

  // 출력 디렉토리 생성
  const outputDir = path.resolve('./output');
  const tempDir = path.resolve('./temp');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(tempDir, { recursive: true });

  // 1. 블로그 글 읽기
  console.log('📖 블로그 글 읽기...');
  const blogPath = path.resolve('./blog-content.txt');
  const blogContent = await fs.readFile(blogPath, 'utf-8');
  console.log(`✅ 블로그 글 로드 완료 (${blogContent.length}자)\n`);

  // 2. AI 스크립트 생성
  console.log('🤖 AI 스크립트 생성 중...');
  const scriptGen = new ScriptGenerator(apiKey);
  const script = await scriptGen.generate(blogContent);

  console.log('✅ 스크립트 생성 완료!');
  console.log(`   훅: "${script.hook}"`);
  console.log(`   포인트: ${script.points.length}개`);
  console.log(`   결론: "${script.conclusion}"\n`);

  // 스크립트 저장
  const scriptPath = path.join(outputDir, 'script.json');
  await fs.writeFile(scriptPath, JSON.stringify(script, null, 2));

  // 3. 음성 생성 (Google TTS - 무료!)
  const audioGen = new AudioGenerator();
  const fullText = scriptGen.toFullText(script);
  const audioPath = path.join(tempDir, 'audio.mp3');
  await audioGen.generate(fullText, audioPath);

  // 4. 오디오 길이 확인
  const audioDuration = await audioGen.getDuration(audioPath);
  console.log(`📊 오디오 길이: ${audioDuration.toFixed(1)}초\n`);

  // 5. 자막 생성
  const subtitleGen = new SubtitleGenerator();
  const segments = subtitleGen.createSegments(script, audioDuration);
  const subtitlePath = path.join(tempDir, 'subtitles.ass');
  await subtitleGen.generateASS(segments, subtitlePath);
  console.log();

  // 6. 배경 생성
  const videoComposer = new VideoComposer();
  const backgroundPath = path.join(tempDir, 'background.mp4');
  await videoComposer.createBackground(audioDuration, backgroundPath);
  console.log();

  // 7. 최종 비디오 합성
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
  console.log('\n' + '='.repeat(50));
  console.log(`✨ 완료! (${elapsed}초 소요)`);
  console.log('='.repeat(50));
  console.log(`\n📁 생성된 파일:`);
  console.log(`   비디오: ${outputPath}`);
  console.log(`   스크립트: ${scriptPath}`);
  console.log(`   음성: ${audioPath}`);
  console.log(`   자막: ${subtitlePath}`);
}

main().catch((error) => {
  console.error('\n❌ 오류 발생:', error.message);
  process.exit(1);
});
