import OpenAI from 'openai';
import type { BlogPost, ShortsScript } from '../types.js';

export class ScriptGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * 블로그 글을 분석하여 쇼츠 스크립트 생성
   */
  async generateScript(
    blogPost: BlogPost,
    duration: number = 60
  ): Promise<ShortsScript> {
    const prompt = this.createPrompt(blogPost, duration);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // 최신 모델, 비용 효율적
        messages: [
          {
            role: 'system',
            content: `당신은 주식 투자 전문가이자 쇼츠 콘텐츠 크리에이터입니다.
블로그 글을 분석하여 임팩트 있는 쇼츠 스크립트를 작성합니다.
응답은 반드시 JSON 형식으로만 제공하세요.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      const script = JSON.parse(response) as ShortsScript;
      script.duration = duration;

      return script;
    } catch (error) {
      throw new Error(`스크립트 생성 실패: ${error}`);
    }
  }

  /**
   * GPT 프롬프트 생성
   */
  private createPrompt(blogPost: BlogPost, duration: number): string {
    return `
다음 주식 블로그 글을 ${duration}초 길이의 YouTube Shorts 스크립트로 변환해주세요.

제목: ${blogPost.title}
내용:
${blogPost.content.slice(0, 3000)} ${blogPost.content.length > 3000 ? '...' : ''}

요구사항:
1. **hook (훅)**: 첫 3초 안에 시청자의 주목을 끌 수 있는 강렬한 한 문장
   - 질문형, 충격적인 사실, 또는 긴급성을 강조
   - 예: "삼성전자가 오늘 10% 급등한 진짜 이유는?"

2. **mainContent (핵심 내용)**: 3-5개의 핵심 포인트
   - 각 포인트는 간결하고 명확하게 (1-2문장)
   - 숫자, 데이터를 활용하여 신뢰도 높이기
   - 주식 초보자도 이해할 수 있게 쉽게 설명

3. **conclusion (결론)**: 마무리 멘트
   - 행동 촉구 (CTA) 포함
   - 예: "더 자세한 분석은 블로그에서 확인하세요!"

4. **hashtags**: 관련 해시태그 5-7개
   - 주식 관련 키워드 포함
   - 예: ["주식", "투자", "삼성전자", "반도체", "급등주"]

응답 형식 (JSON):
{
  "hook": "강렬한 첫 문장",
  "mainContent": [
    "첫 번째 핵심 포인트",
    "두 번째 핵심 포인트",
    "세 번째 핵심 포인트"
  ],
  "conclusion": "마무리 멘트 및 CTA",
  "hashtags": ["태그1", "태그2", "태그3"]
}

주의사항:
- 전체 스크립트를 읽는데 ${duration}초 정도 걸려야 합니다
- 자연스러운 말투로 작성 (너무 격식적이지 않게)
- 쇼츠 특성상 빠르게 핵심을 전달
`;
  }

  /**
   * 스크립트를 하나의 텍스트로 결합
   */
  combineScriptToText(script: ShortsScript): string {
    const parts = [
      script.hook,
      ...script.mainContent,
      script.conclusion
    ];
    return parts.join('\n\n');
  }

  /**
   * 스크립트의 예상 음성 길이 계산 (초)
   */
  estimateAudioDuration(text: string): number {
    // 한국어: 평균 분당 350-400자 (초당 약 6자)
    // 여유를 두고 초당 5자로 계산
    const charCount = text.length;
    return Math.ceil(charCount / 5);
  }
}
