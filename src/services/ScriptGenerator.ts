import OpenAI from 'openai';
import type { Script } from '../types.js';

export class ScriptGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * 블로그 글에서 쇼츠 스크립트 생성
   */
  async generate(blogContent: string): Promise<Script> {
    const prompt = `다음 블로그 글을 60초 분량의 YouTube 쇼츠 스크립트로 변환해주세요.

블로그 내용:
${blogContent}

요구사항:
1. 첫 3초 안에 시청자를 사로잡을 강력한 훅 (20자 이내)
2. 핵심 포인트 3-5개 (각 30자 이내)
3. 행동을 유도하는 결론 (20자 이내)

JSON 형식으로 응답:
{
  "hook": "강력한 첫 문장",
  "points": ["포인트1", "포인트2", "포인트3"],
  "conclusion": "마무리 문장"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 주식 전문가이자 쇼츠 크리에이터입니다. 간결하고 임팩트 있는 스크립트를 작성합니다.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as Script;
  }

  /**
   * 스크립트를 전체 텍스트로 변환
   */
  toFullText(script: Script): string {
    return [
      script.hook,
      ...script.points,
      script.conclusion,
    ].join('. ') + '.';
  }
}
