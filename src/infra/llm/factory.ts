import { LLMTransport, ProviderConfig } from './base.js';
import { OpenAICompatibleClient } from './providers/openai.js';
import { GeminiClient } from './providers/gemini.js';

export class LLMFactory {
  static createTransport(provider: string, config: ProviderConfig): LLMTransport {
    switch (provider.toLowerCase()) {
      case 'openai':
      case 'deepseek':
      case 'openrouter':
      case 'groq':
        return new OpenAICompatibleClient(config);
      case 'gemini':
        return new GeminiClient(config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
