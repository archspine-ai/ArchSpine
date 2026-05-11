import OpenAI from 'openai';
import type { LLMTransport, ProviderConfig, UsageInfo } from '../base.js';

/**
 * OpenAI-compatible LLM transport provider.
 * Thin API caller — no prompt generation, no response parsing.
 */
export class OpenAICompatibleClient implements LLMTransport {
  private client: OpenAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1',
      maxRetries: 0,
      timeout: config.timeoutMs ?? 120_000,
    });
    this.model = config.model || 'gpt-3.5-turbo';
  }

  async generate(
    prompt: string,
    _languages: string[],
    logContext: string,
  ): Promise<{ content: string; usage?: UsageInfo }> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are an expert developer assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error(`LLM returned no choices for ${logContext}`);
    }

    const content = response.choices[0].message.content || '';
    const usageData = response.usage;

    let usage: UsageInfo | undefined;
    if (usageData) {
      usage = {
        inputTokens: usageData.prompt_tokens || 0,
        outputTokens: usageData.completion_tokens || 0,
        totalTokens: usageData.total_tokens || 0,
      };
    }

    return { content, usage };
  }
}
