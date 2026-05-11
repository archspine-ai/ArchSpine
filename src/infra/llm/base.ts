import { FileKind } from '../../types/protocol.js';
import type { GenerationStrategy, PromptTaskMode } from '../prompt-policy.js';

export interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- LLM response structure is inherently dynamic
  json: any;
  markdown: Record<string, string>;
  usage?: UsageInfo;
}

export interface LLMClient {
  generateSummary(
    filePath: string,
    content: string,
    contextData?: string,
    ruleData?: string,
    gitIntent?: string,
    branch?: string,
    status?: string,
    previousSemantic?: PreviousSemanticContext,
    fileKind?: FileKind,
    taskMode?: PromptTaskMode,
  ): Promise<LLMResponse>;
  generateFolderSummary(
    dirPath: string,
    childrenInfo: string,
    branch?: string,
    status?: string,
  ): Promise<LLMResponse>;
  generateProjectSummary(
    projectName: string,
    modulesInfo: string,
    branch?: string,
    status?: string,
  ): Promise<LLMResponse>;
  generateText?(prompt: string): Promise<{ content: string; usage?: UsageInfo }>;
}

export interface PreviousSemanticContext {
  role: string;
  responsibilities: string[];
}

export interface LLMProvider {
  generate(prompt: string, languages: string[], filePath: string): Promise<LLMResponse>;
}

export interface ProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
  generationStrategy?: GenerationStrategy;
  timeoutMs?: number;
}

/**
 * Thin transport interface for LLM providers.
 * Implementations call the external API and return raw content — no prompt
 * building, no response parsing. Those concerns belong in the orchestrator.
 */
export interface LLMTransport {
  generate(
    prompt: string,
    languages: string[],
    logContext: string,
  ): Promise<{ content: string; usage?: UsageInfo }>;
}
