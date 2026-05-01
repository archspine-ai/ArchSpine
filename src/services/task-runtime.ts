import { Scanner } from '../engines/scanner.js';
import { Manifest } from '../infra/manifest.js';
import { Aggregator } from '../engines/aggregator.js';
import type { LLMClient } from '../infra/llm.js';
import { ASTExtractor } from '../ast/extractor.js';
import { RuleEngine } from '../engines/rules.js';
import { OutputManager } from '../infra/output.js';
import { ContextEngine } from '../engines/context.js';
import { TaskContext } from '../core/task.js';
import { createTaskArtifactsState, createTaskState } from '../core/task-state.js';
import { LockManager } from '../utils/lock.js';
import { ScanPolicy } from '../core/scan-policy.js';
import type { GenerationFlow, PromptPolicyTier, ValidatePolicy } from '../infra/prompt-policy.js';
import {
  parseRelevanceDiagnosticsMode,
  resolvePromptPolicyTier,
  resolveValidatePolicy,
} from '../infra/prompt-policy.js';
import { RuntimeIO, defaultRuntimeIO } from '../infra/runtime-io.js';
import type { ResolvedLLMSettings } from '../infra/llm.js';
import type { ExecutionCheckpointStore } from '../infra/execution-checkpoint.js';
import type { ViewId } from '../types/view.js';

export interface ServiceOptions {
  rootDir: string;
  llmClient?: LLMClient;
  resolvedLLMSettings?: ResolvedLLMSettings;
  targetLocales?: string[];
  scanPolicy?: ScanPolicy;
  promptTier?: PromptPolicyTier;
  validatePolicy?: ValidatePolicy;
  generationFlow?: GenerationFlow;
  summarizeConcurrency?: number;
  summarizeRetryLimit?: number;
  experimentalViewLayer?: boolean;
  enabledViews?: ViewId[];
  invalidEnabledViews?: string[];
  runtimeIO?: RuntimeIO;
  executionCheckpoint?: ExecutionCheckpointStore;
}

export interface TaskContextOptions extends ServiceOptions {
  isFullSync: boolean;
  hookMode: boolean;
  includeAggregator?: boolean;
  forcedSyncFiles?: string[];
  writeAtlasDocs?: boolean;
}

export interface PreparedTaskContext {
  context: TaskContext;
  lockManager: LockManager;
}

export function createTaskContext(options: TaskContextOptions): PreparedTaskContext {
  const taskMode = options.validatePolicy === 'strict' ? 'validate' : 'summarize';
  const promptTier = resolvePromptPolicyTier(taskMode, options.promptTier);
  const validatePolicy = resolveValidatePolicy(taskMode, options.validatePolicy);
  const diagnosticsMode =
    parseRelevanceDiagnosticsMode(process.env.SPINE_DIAGNOSTICS_MODE) || 'off';
  const scanner = new Scanner(options.rootDir, options.scanPolicy);
  const manifest = Manifest.open(options.rootDir);
  const aggregator =
    options.includeAggregator === false
      ? undefined
      : new Aggregator(
          options.rootDir,
          options.llmClient!,
          options.targetLocales || ['en-US'],
          options.writeAtlasDocs ?? true,
        );
  const extractor = new ASTExtractor();
  const ruleEngine = new RuleEngine(options.rootDir);
  const outputManager = new OutputManager({ rootDir: options.rootDir });
  const contextEngine = new ContextEngine(options.rootDir);
  const lockManager = new LockManager(options.rootDir);

  return {
    context: {
      rootDir: options.rootDir,
      scanner,
      manifest,
      aggregator,
      outputManager,
      ruleEngine,
      contextEngine,
      extractor,
      llmClient: options.llmClient,
      promptTier,
      validatePolicy,
      generationFlow: options.generationFlow ?? 'together',
      summarizeConcurrency: options.summarizeConcurrency ?? 3,
      summarizeRetryLimit: options.summarizeRetryLimit ?? 2,
      enabledViews: options.enabledViews || [],
      invalidEnabledViews: options.invalidEnabledViews || [],
      targetLocales: options.targetLocales || ['en-US'],
      writeAtlasDocs: options.writeAtlasDocs ?? true,
      isFullSync: options.isFullSync,
      hookMode: options.hookMode,
      forcedSyncFiles: new Set(options.forcedSyncFiles || []),
      runtimeIO: options.runtimeIO || defaultRuntimeIO,
      executionCheckpoint: options.executionCheckpoint,
      runtimeCache: createTaskArtifactsState(),
      state: createTaskState(diagnosticsMode),
    },
    lockManager,
  };
}
