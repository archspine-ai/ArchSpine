import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMTransport, ProviderConfig, UsageInfo } from '../base.js';

/**
 * Gemini LLM transport provider.
 * Thin API caller — no prompt generation, no response parsing.
 */
export class GeminiClient implements LLMTransport {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private timeoutMs?: number;

  constructor(config: ProviderConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-1.5-pro';
    this.timeoutMs = config.timeoutMs ?? 120_000;
  }

  async generate(
    prompt: string,
    _languages: string[],
    logContext: string,
  ): Promise<{ content: string; usage?: UsageInfo }> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { timeout: this.timeoutMs },
    );

    // The generateContent response does not throw on empty content in Gemini SDK.
    const content = result.response.text();
    if (!content) {
      throw new Error(`LLM returned empty response for ${logContext}`);
    }

    const usageMetadata = result.response.usageMetadata;
    let usage: UsageInfo | undefined;
    if (usageMetadata) {
      usage = {
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
      };
    }

    return { content, usage };
  }
}
