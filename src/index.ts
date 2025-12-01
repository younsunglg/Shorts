#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { BlogParser } from './parsers/blogParser.js';
import { ScriptGenerator } from './generators/scriptGenerator.js';
import { AudioGenerator } from './generators/audioGenerator.js';
import { VideoRenderer } from './renderers/videoRenderer.js';
import { Logger } from './utils/logger.js';
import type { ShortsGenerationOptions } from './types.js';

// 환경 변수 로드
dotenv.config();

const program = new Command();

program
  .name('shorts-generator')
  .description('주식 블로그 글을 쇼츠로 자동 변환하는 AI 기반 도구')
  .version('1.0.0');

program
  .command('generate')
  .description('블로그 글에서 쇼츠 생성')
  .option('-f, --file <path>', '블로그 글 파일 경로 (markdown, html, txt)')
  .option('-u, --url <url>', '블로그 글 URL')
  .option('-t, --text <text>', '직접 텍스트 입력')
  .option('-o, --output <path>', '출력 파일 경로', './output/shorts.mp4')
  .option('-s, --style <style>', '비디오 스타일 (modern, minimal, dynamic)', 'modern')
  .option('-d, --duration <seconds>', '비디오 길이 (초)', '60')
  .option('--no-audio', '음성 생성 제외')
  .option('--voice <voice>', 'OpenAI 음성 (alloy, echo, fable, onyx, nova, shimmer)', 'nova')
  .action(async (options) => {
    try {
      await generateShorts(options);
    } catch (error) {
      Logger.error(`쇼츠 생성 실패: ${error}`);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('API 키 설정 확인')
  .action(() => {
    Logger.info('환경 변수 확인:');
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '설정됨 ✓' : '미설정 ✗'}`);
    console.log(`ELEVENLABS_API_KEY: ${process.env.ELEVENLABS_API_KEY ? '설정됨 ✓' : '미설정 (선택사항)'}`);
  });

program.parse();

/**
 * 쇼츠 생성 메인 함수
 */
async function generateShorts(options: any) {
  const startTime = Date.now();

  // 1. API 키 확인
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }

  Logger.info('🚀 쇼츠 생성을 시작합니다...\n');

  // 2. 블로그 글 파싱
  Logger.progress('1/5 블로그 글 파싱 중...');
  const parser = new BlogParser();
  let blogPost;

  if (options.file) {
    blogPost = await parser.parseFromFile(options.file);
  } else if (options.url) {
    blogPost = await parser.parseFromUrl(options.url);
  } else if (options.text) {
    blogPost = parser.parseFromText(options.text);
  } else {
    throw new Error('블로그 글 입력이 필요합니다. --file, --url, 또는 --text 옵션을 사용하세요.');
  }

  Logger.success(`블로그 글 파싱 완료: "${blogPost.title}"`);
  const stats = parser.getStatistics(blogPost);
  Logger.info(`  - 단어 수: ${stats.wordCount}`);
  Logger.info(`  - 예상 읽기 시간: ${stats.estimatedReadTime}분\n`);

  // 3. AI 스크립트 생성
  Logger.progress('2/5 AI로 쇼츠 스크립트 생성 중...');
  const scriptGen = new ScriptGenerator(openaiKey);
  const duration = parseInt(options.duration) || 60;
  const script = await scriptGen.generateScript(blogPost, duration);

  Logger.success('스크립트 생성 완료!');
  Logger.info(`  - 훅: "${script.hook}"`);
  Logger.info(`  - 핵심 포인트: ${script.mainContent.length}개`);
  Logger.info(`  - 해시태그: ${script.hashtags.join(', ')}\n`);

  // 스크립트를 JSON으로 저장
  const outputDir = path.dirname(options.output);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir('./temp', { recursive: true });

  const scriptPath = path.join(outputDir, 'script.json');
  await fs.writeFile(scriptPath, JSON.stringify(script, null, 2));
  Logger.info(`  스크립트 저장: ${scriptPath}\n`);

  // 4. 음성 생성
  let audioPath: string | undefined;
  if (options.audio !== false) {
    Logger.progress('3/5 음성 생성 중...');
    const audioGen = new AudioGenerator(openaiKey, process.env.ELEVENLABS_API_KEY);
    const fullText = scriptGen.combineScriptToText(script);

    audioPath = path.join('./temp', 'audio.mp3');
    await audioGen.generateWithOpenAI(fullText, audioPath, options.voice);
    Logger.success(`음성 생성 완료: ${audioPath}\n`);
  } else {
    Logger.info('3/5 음성 생성 생략 (--no-audio 옵션)\n');
  }

  // 5. 비디오 렌더링
  Logger.progress('4/5 비디오 렌더링 중... (시간이 걸릴 수 있습니다)');
  const renderer = new VideoRenderer({
    width: 1080,
    height: 1920,
    fps: 30,
    duration,
  });

  await renderer.renderShorts(
    script,
    blogPost.title,
    audioPath,
    options.output,
    options.style
  );

  Logger.success(`비디오 생성 완료: ${options.output}\n`);

  // 6. 완료
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  Logger.success(`✨ 모든 작업 완료! (${elapsed}초 소요)`);
  Logger.info(`\n생성된 파일:`);
  Logger.info(`  - 비디오: ${options.output}`);
  Logger.info(`  - 스크립트: ${scriptPath}`);
  if (audioPath) {
    Logger.info(`  - 음성: ${audioPath}`);
  }
  Logger.info(`\n해시태그: ${script.hashtags.map(t => `#${t}`).join(' ')}`);
}
