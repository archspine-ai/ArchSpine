import { LLMClient, ProviderConfig } from './base.js';
import { OpenAICompatibleClient } from './providers/openai.js';
import { GeminiClient } from './providers/gemini.js';
import { MockClient } from './providers/mock.js';

export class LLMFactory {
  static createClient(provider: string, config: ProviderConfig): LLMClient {
    switch (provider.toLowerCase()) {
      case 'openai':
      case 'deepseek':
      case 'openrouter':
      case 'groq':
        return new OpenAICompatibleClient(config);
      case 'gemini':
        return new GeminiClient(config);
      case 'mock':
        return new MockClient(config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
