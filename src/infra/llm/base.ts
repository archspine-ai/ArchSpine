import { FileKind } from '../../types/protocol.js';
import type {
  GenerationStrategy,
  PromptPolicyTier,
  PromptTaskMode,
  ValidatePolicy,
} from '../prompt-policy.js';

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
    languages?: string[],
    branch?: string,
    status?: string,
    previousSemantic?: PreviousSemanticContext,
    promptTier?: PromptPolicyTier,
    validatePolicy?: ValidatePolicy,
    fileKind?: FileKind,
    taskMode?: PromptTaskMode,
  ): Promise<LLMResponse>;
  generateFolderSummary(
    dirPath: string,
    childrenInfo: string,
    languages?: string[],
    branch?: string,
    status?: string,
  ): Promise<LLMResponse>;
  generateProjectSummary(
    projectName: string,
    modulesInfo: string,
    languages?: string[],
    branch?: string,
    status?: string,
  ): Promise<LLMResponse>;
  generateText?(prompt: string): Promise<{ content: string; usage?: UsageInfo }>;
}

export interface PreviousSemanticContext {
  role: string;
  responsibilities: string[];
}

export interface ProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
  generationStrategy?: GenerationStrategy;
  timeoutMs?: number;
}
