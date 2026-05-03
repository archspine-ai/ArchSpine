/**
 * TECH DEBT (V1.0): This provider has drifted beyond a pure LLM client interface.
 * It currently absorbs prompt generation, strategy orchestration, and response parsing
 * that belong in a higher-level orchestration layer. The same pattern exists in gemini.ts.
 *
 * Planned for V1.1: Extract shared orchestration logic into a single non-provider location,
 * leaving providers as thin transport layers with a single `generate(prompt)` contract.
 * See .spine/rules/layered-architecture.yml Infra Facade Imports rule.
 */
import OpenAI from 'openai';
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

export class OpenAICompatibleClient implements LLMClient {
  private client: OpenAI;
  private model: string;
  private generationStrategy: GenerationStrategy;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1',
      maxRetries: 0,
      timeout: config.timeoutMs ?? 120_000,
    });
    this.model = config.model || 'gpt-3.5-turbo';
    this.generationStrategy = config.generationStrategy || 'together';
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
  ): Promise<LLMResponse> {
    const prompt = generateFolderPrompt(
      dirPath,
      childrenInfo,
      languages,
      '',
      '',
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
  ): Promise<LLMResponse> {
    const prompt = generateProjectPrompt(
      projectName,
      modulesInfo,
      languages,
      '',
      '',
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
    return this.executeTextPrompt(
      prompt,
      'You are an expert developer assistant that outputs only raw source code with no markdown formatting, no explanations, and no fences.',
    );
  }

  private async executeTextPrompt(
    prompt: string,
    systemPrompt: string,
  ): Promise<{ content: string; usage?: UsageInfo }> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('LLM returned no choices for generateText');
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
    const response = await this.executeTextPrompt(
      prompt,
      'You are an expert documentation writer. Output only the requested markdown blocks and nothing else.',
    );
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
    const fullResponse = response.choices[0].message.content || '';
    const usageData = response.usage;

    const { json, markdown } = parseStructuredResponse(fullResponse, languages, logContext);

    let usage;
    if (usageData) {
      usage = {
        inputTokens: usageData.prompt_tokens || 0,
        outputTokens: usageData.completion_tokens || 0,
        totalTokens: usageData.total_tokens || 0,
      };
    }

    return { json, markdown, usage };
  }
}
