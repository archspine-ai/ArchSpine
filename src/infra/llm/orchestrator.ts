import {
  generateConfigPrompt,
  generateDocumentPrompt,
  generateFolderPrompt,
  generateProjectPrompt,
  generateSourcePrompt,
} from '../prompt.js';
import { parseStructuredResponse } from './providers/utils.js';
import type {
  LLMClient,
  LLMResponse,
  LLMTransport,
  PreviousSemanticContext,
  UsageInfo,
} from './base.js';
import { FileKind } from '../../types/protocol.js';
import type { GenerationStrategy, PromptTaskMode } from '../prompt-policy.js';

/**
 * Orchestration layer that wraps a thin LLMTransport (pure API caller) with
 * prompt generation and response parsing. This lives as a distinct module in
 * infra/llm/ alongside providers so that individual provider classes stay as
 * thin transports and do not absorb service/task orchestration concerns.
 */
export class LLMOrchestrator implements LLMClient {
  constructor(
    private readonly transport: LLMTransport,
    private readonly generationStrategy: GenerationStrategy,
  ) {}

  async generateSummary(
    filePath: string,
    content: string,
    contextData?: string,
    ruleData?: string,
    gitIntent?: string,
    branch?: string,
    status?: string,
    previousSemantic?: PreviousSemanticContext,
    fileKind: FileKind = 'source',
    taskMode: PromptTaskMode = 'summarize',
  ): Promise<LLMResponse> {
    const effectiveValidatePolicy = taskMode === 'validate' ? 'strict' : 'default';
    const responseMode = this.generationStrategy === 'together' ? 'json-and-markdown' : 'json-only';
    let prompt: string;

    switch (fileKind) {
      case 'document':
        prompt = generateDocumentPrompt(filePath, content, branch, status, responseMode);
        break;
      case 'config':
        prompt = generateConfigPrompt(filePath, content, branch, status, responseMode);
        break;
      case 'source':
      default:
        prompt = generateSourcePrompt(
          filePath,
          content,
          contextData,
          ruleData,
          gitIntent,
          branch,
          status,
          previousSemantic,
          taskMode,
          effectiveValidatePolicy,
          responseMode,
        );
        break;
    }

    const raw = await this.transport.generate(prompt, ['English'], filePath);
    const { json, markdown } = parseStructuredResponse(raw.content, filePath);
    return { json, markdown, usage: raw.usage };
  }

  async generateFolderSummary(
    dirPath: string,
    childrenInfo: string,
    branch?: string,
    status?: string,
  ): Promise<LLMResponse> {
    const prompt = generateFolderPrompt(
      dirPath,
      childrenInfo,
      branch,
      status,
      this.generationStrategy === 'together' ? 'json-and-markdown' : 'json-only',
    );

    const raw = await this.transport.generate(prompt, ['English'], `folder:${dirPath}`);
    const { json, markdown } = parseStructuredResponse(raw.content, `folder:${dirPath}`);
    return { json, markdown, usage: raw.usage };
  }

  async generateProjectSummary(
    projectName: string,
    modulesInfo: string,
    branch?: string,
    status?: string,
  ): Promise<LLMResponse> {
    const prompt = generateProjectPrompt(
      projectName,
      modulesInfo,
      branch,
      status,
      this.generationStrategy === 'together' ? 'json-and-markdown' : 'json-only',
    );

    const raw = await this.transport.generate(prompt, ['English'], `project:${projectName}`);
    const { json, markdown } = parseStructuredResponse(raw.content, `project:${projectName}`);
    return { json, markdown, usage: raw.usage };
  }

  async generateText(prompt: string): Promise<{ content: string; usage?: UsageInfo }> {
    return this.transport.generate(prompt, ['English'], 'direct-text');
  }
}
