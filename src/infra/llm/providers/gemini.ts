import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  LLMClient,
  LLMResponse,
  PreviousSemanticContext,
  ProviderConfig,
  UsageInfo,
} from '../base.js';
import {
  generateConfigPrompt,
  generateDocumentPrompt,
  generateFolderPrompt,
  generateMarkdownPrompt,
  generateProjectPrompt,
  generateSourcePrompt,
} from '../../prompt.js';
import { generateLitePrompt } from '../../lite-prompt.js';
import { FileKind } from '../../../types/protocol.js';

import type {
  GenerationStrategy,
  PromptPolicyTier,
  PromptTaskMode,
  ValidatePolicy,
} from '../../prompt-policy.js';
import {
  buildSupportingContext,
  mergeUsage,
  parseMarkdownBlocks,
  parseStructuredResponse,
} from './utils.js';

export class GeminiClient implements LLMClient {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private generationStrategy: GenerationStrategy;
  private timeoutMs?: number;

  constructor(config: ProviderConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-1.5-pro';
    this.generationStrategy = config.generationStrategy || 'together';
    this.timeoutMs = config.timeoutMs ?? 120_000;
  }

  async generateSummary(
    filePath: string,
    content: string,
    contextData?: string,
    ruleData?: string,
    gitIntent?: string,
    languages: string[] = ['English'],
    branch?: string,
    status?: string,
    previousSemantic?: PreviousSemanticContext,
    promptTier?: PromptPolicyTier,
    validatePolicy?: ValidatePolicy,
    fileKind: FileKind = 'source',
    taskMode: PromptTaskMode = 'summarize',
  ): Promise<LLMResponse> {
    const effectivePromptTier = promptTier || 'balanced';
    const effectiveValidatePolicy =
      validatePolicy || (taskMode === 'validate' ? 'strict' : 'default');
    let prompt: string;
    const responseMode = this.generationStrategy === 'together' ? 'json-and-markdown' : 'json-only';
    if (effectivePromptTier === 'lite' && fileKind === 'source') {
      prompt = generateLitePrompt(filePath, content, languages, responseMode);
    } else {
      switch (fileKind) {
        case 'document':
          prompt = generateDocumentPrompt(
            filePath,
            content,
            languages,
            branch,
            status,
            responseMode,
          );
          break;
        case 'config':
          prompt = generateConfigPrompt(filePath, content, languages, branch, status, responseMode);
          break;
        case 'source':
        default:
          prompt = generateSourcePrompt(
            filePath,
            content,
            contextData,
            ruleData,
            gitIntent,
            languages,
            branch,
            status,
            previousSemantic,
            taskMode,
            effectivePromptTier,
            effectiveValidatePolicy,
            responseMode,
          );
          break;
      }
    }
    const summary = await this.executeAndParse(prompt, languages, filePath);
    if (this.generationStrategy === 'semantic-first') {
      const markdownResult = await this.generateMarkdown(
        filePath,
        fileKind,
        summary.json,
        languages,
        buildSupportingContext(fileKind, content, contextData),
      );
      summary.markdown = markdownResult.markdown;
      summary.usage = mergeUsage(summary.usage, markdownResult.usage);
    }
    return summary;
  }

  async generateFolderSummary(
    dirPath: string,
    childrenInfo: string,
    languages: string[] = ['English'],
    branch?: string,
    status?: string,
  ): Promise<LLMResponse> {
    const prompt = generateFolderPrompt(
      dirPath,
      childrenInfo,
      languages,
      branch,
      status,
      this.generationStrategy === 'together' ? 'json-and-markdown' : 'json-only',
    );
    const summary = await this.executeAndParse(prompt, languages, `folder:${dirPath}`);
    if (this.generationStrategy === 'semantic-first') {
      const markdownResult = await this.generateMarkdown(
        dirPath,
        'folder',
        summary.json,
        languages,
        childrenInfo,
      );
      summary.markdown = markdownResult.markdown;
      summary.usage = mergeUsage(summary.usage, markdownResult.usage);
    }
    return summary;
  }

  async generateProjectSummary(
    projectName: string,
    modulesInfo: string,
    languages: string[] = ['English'],
    branch?: string,
    status?: string,
  ): Promise<LLMResponse> {
    const prompt = generateProjectPrompt(
      projectName,
      modulesInfo,
      languages,
      branch,
      status,
      this.generationStrategy === 'together' ? 'json-and-markdown' : 'json-only',
    );
    const summary = await this.executeAndParse(prompt, languages, `project:${projectName}`);
    if (this.generationStrategy === 'semantic-first') {
      const markdownResult = await this.generateMarkdown(
        projectName,
        'project',
        summary.json,
        languages,
        modulesInfo,
      );
      summary.markdown = markdownResult.markdown;
      summary.usage = mergeUsage(summary.usage, markdownResult.usage);
    }
    return summary;
  }

  async generateText(prompt: string): Promise<{ content: string; usage?: UsageInfo }> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { timeout: this.timeoutMs },
    );
    const content = result.response.text();
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

  private async generateMarkdown(
    identifier: string,
    fileKind: FileKind | 'project',
    semanticJson: unknown,
    languages: string[],
    supportingContext?: string,
  ): Promise<{ markdown: Record<string, string>; usage?: UsageInfo }> {
    const prompt = generateMarkdownPrompt({
      identifier,
      fileKind,
      semanticJson,
      languages,
      supportingContext,
    });
    const response = await this.generateText(prompt);
    return {
      markdown: parseMarkdownBlocks(response.content, languages),
      usage: response.usage,
    };
  }

  private async executeAndParse(
    prompt: string,
    languages: string[],
    logContext: string,
  ): Promise<LLMResponse> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { timeout: this.timeoutMs },
    );
    const fullResponse = result.response.text();
    const usageMetadata = result.response.usageMetadata;

    const { json, markdown } = parseStructuredResponse(fullResponse, languages, logContext);

    let usage;
    if (usageMetadata) {
      usage = {
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
      };
    }

    return { json, markdown, usage };
  }
}
