import { Scanner } from '../engines/scanner.js';
import { Manifest } from '../infra/manifest.js';
import { Aggregator } from '../engines/aggregator.js';
import { OutputManager } from '../infra/output.js';
import { RuleEngine } from '../engines/rules.js';
import { ContextEngine } from '../engines/context.js';
import { ASTExtractor } from '../ast/extractor.js';
import type { LLMClient } from '../infra/llm.js';
import type { GenerationFlow, PromptPolicyTier, ValidatePolicy } from '../infra/prompt-policy.js';
import type { RuntimeIO } from '../infra/runtime-io.js';
import type { ExecutionCheckpointStore } from '../infra/execution-checkpoint.js';
import type { ViewId } from '../types/view.js';
import type { TaskArtifactsState, TaskState } from './task-types.js';

export abstract class SpineTask<I = void, O = void> {
  abstract name: string;
  checkpointId?: string;
  abstract execute(ctx: TaskContext, input: I): Promise<O>;
}

/**
 * Frozen pipeline contract for Phase 0-2.
 * Do not add new infra dependencies here without first proving they cannot
 * remain inside a service/runtime boundary.
 */
export interface TaskContext {
  rootDir: string;
  scanner: Scanner;
  manifest: Manifest;
  aggregator?: Aggregator;
  outputManager: OutputManager;
  ruleEngine: RuleEngine;
  contextEngine: ContextEngine;
  extractor: ASTExtractor;
  llmClient: LLMClient | undefined;
  promptTier: PromptPolicyTier;
  validatePolicy: ValidatePolicy;
  generationFlow: GenerationFlow;
  summarizeConcurrency: number;
  summarizeRetryLimit: number;
  enabledViews: ViewId[];
  invalidEnabledViews: string[];
  targetLocales: string[];
  writeAtlasDocs: boolean;
  isFullSync: boolean;
  hookMode: boolean;
  forcedSyncFiles: Set<string>;
  runtimeIO: RuntimeIO;
  executionCheckpoint?: ExecutionCheckpointStore;
  runtimeCache: TaskArtifactsState;
  state: TaskState;
  /** When true, tasks that normally prompt for confirmation should auto-confirm. */
  skipConfirmation: boolean;
  /** When true, FixTask displays diffs but does not write changes to disk. */
  dryRun: boolean;
}

export type TaskContextFor<Keys extends keyof TaskContext> = Pick<TaskContext, Keys>;
