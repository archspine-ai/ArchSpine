import type { LLMClient } from '../infra/llm.js';
import { TaskRunner } from '../core/pipeline.js';
import { ScanAndCleanupTask } from '../tasks/scan-cleanup.js';
import { ASTExtractionTask } from '../tasks/ast-extra.js';
import { ValidationSummary, ValidationTask } from '../tasks/validate.js';
import { ScanPolicy } from '../core/scan-policy.js';
import { Config } from '../infra/config.js';
import { createTaskContext } from './task-runtime.js';
import type { GenerationFlow, PromptPolicyTier, ValidatePolicy } from '../infra/prompt-policy.js';
import { GlobalLLMConfig, GlobalLLMSecrets, resolveLLMSettings } from '../infra/llm.js';
import { Secrets } from '../infra/secrets.js';
import { resolveExecutionProfileFromSettings } from './runtime-execution-profile.js';
import { ArchSpineError, ErrorCodes, toArchSpineError } from '../core/errors.js';
import { defaultRuntimeIO, RuntimeIO } from '../infra/runtime-io.js';
import { deriveCheckResumeCandidateFiles } from '../infra/execution-checkpoint.js';
import { runWithRuntimeSession } from './runtime-session.js';

export interface CheckServiceOptions {
  rootDir: string;
  llmClient?: LLMClient;
  scanPolicy?: ScanPolicy;
  promptTier?: PromptPolicyTier;
  validatePolicy?: ValidatePolicy;
  generationFlow?: GenerationFlow;
  runtimeIO?: RuntimeIO;
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function logStageMetrics(
  runtimeIO: RuntimeIO,
  metrics:
    | Record<
        string,
        {
          runs: number;
          totalDurationMs: number;
          lastDurationMs: number;
          maxDurationMs: number;
          lastHeapUsedBytes: number;
          maxHeapUsedBytes: number;
          lastRssBytes: number;
          maxRssBytes: number;
        }
      >
    | undefined,
): void {
  const focusStages = ['ast-extraction', 'validation'];
  const safeMetrics = metrics || {};

  runtimeIO.info('[Check Telemetry] Stage summary:');
  for (const stageId of focusStages) {
    const metric = safeMetrics[stageId];
    if (!metric) {
      runtimeIO.info(`  ${stageId}: not executed`);
      continue;
    }

    runtimeIO.info(
      `  ${stageId}: runs=${metric.runs} total=${metric.totalDurationMs}ms last=${metric.lastDurationMs}ms ` +
        `heap=${formatBytes(metric.lastHeapUsedBytes)} rss=${formatBytes(metric.lastRssBytes)} ` +
        `peakHeap=${formatBytes(metric.maxHeapUsedBytes)} peakRss=${formatBytes(metric.maxRssBytes)}`,
    );
  }
}

export class CheckService {
  constructor(private readonly options: CheckServiceOptions) {}

  public async run(): Promise<ValidationSummary> {
    return runWithRuntimeSession({
      command: 'check',
      rootDir: this.options.rootDir,
      runtimeIO: this.options.runtimeIO || defaultRuntimeIO,
      onResume: ({ previousCheckpoint, runtimeIO }) => {
        const resumeCandidateFiles = deriveCheckResumeCandidateFiles(previousCheckpoint);
        runtimeIO.info(
          `[Resume] Found interrupted check run ${previousCheckpoint.runId}. ` +
            `Recoverable validation candidates: ${resumeCandidateFiles.length}.`,
        );
      },
      prepare: ({ executionCheckpoint }) => {
        if (!this.options.llmClient) {
          throw new ArchSpineError(
            ErrorCodes.LlmProviderMissing,
            '[Check] Cannot run semantic check without an LLM provider. Configure one with "spine init" or "spine llm setup".',
            { context: { command: 'check' } },
          );
        }
        return createTaskContext({
          ...this.options,
          targetLocales: ['English'],
          isFullSync: true,
          hookMode: false,
          includeAggregator: false,
          promptTier: this.options.promptTier || 'balanced',
          validatePolicy: this.options.validatePolicy || 'strict',
          executionCheckpoint,
        });
      },
      execute: async ({ context, executionCheckpoint, previousCheckpoint, runtimeIO }) => {
        const resumeCandidateFiles = deriveCheckResumeCandidateFiles(previousCheckpoint);
        executionCheckpoint.startRun({
          resumedFromRunId: previousCheckpoint?.runId || null,
          resumeCandidateCount: resumeCandidateFiles.length,
        });
        runtimeIO.info('[Check] Starting semantic architecture check...');

        const runner = new TaskRunner(context);
        const scanStage = await runner.run(new ScanAndCleanupTask(), {
          candidateFiles: resumeCandidateFiles.length > 0 ? resumeCandidateFiles : undefined,
        });
        const extractionStage = await runner.run(new ASTExtractionTask(), scanStage);
        const validationResult = await runner.run(new ValidationTask(), extractionStage);
        const validationSummary = validationResult.summary;

        if (validationSummary.totalViolations > 0) {
          runtimeIO.error(
            `\n❌ [Check Failed] Found ${validationSummary.totalViolations} violation(s) across ${validationSummary.filesWithViolations} file(s).`,
          );
        } else if (validationSummary.failedFiles > 0) {
          runtimeIO.error(
            `\n❌ [Check Failed] Validation failed for ${validationSummary.failedFiles} file(s).`,
          );
        } else {
          runtimeIO.info(
            `✅ [Check Passed] Audited ${validationSummary.auditedFiles} file(s) with no active violations.`,
          );
        }

        if (context.state.telemetry.stats.totalTokens > 0) {
          context.manifest.recordUsage('check', {
            inputTokens: context.state.telemetry.stats.inputTokens,
            outputTokens: context.state.telemetry.stats.outputTokens,
            totalTokens: context.state.telemetry.stats.totalTokens,
          });
        }
        executionCheckpoint.completeRun({
          totalViolations: validationSummary.totalViolations,
          failedFiles: validationSummary.failedFiles,
          auditedFiles: validationSummary.auditedFiles,
        });
        logStageMetrics(runtimeIO, context.state.telemetry.stageMetrics);
        runtimeIO.info(
          `[Usage Summary] Input Tokens: ${context.state.telemetry.stats.inputTokens} | Output Tokens: ${context.state.telemetry.stats.outputTokens} | Total Tokens: ${context.state.telemetry.stats.totalTokens}`,
        );
        return validationSummary;
      },
      onError: (error, { runtimeIO }) => {
        const wrapped = toArchSpineError(
          error,
          ErrorCodes.CheckExecutionFailed,
          '[Check] Semantic architecture check failed unexpectedly.',
          { context: { command: 'check' } },
        );
        runtimeIO.error(`\n❌ [Check Failed] ${wrapped.message}`);
        throw wrapped;
      },
    });
  }
}

export async function runCheck(
  rootDir: string,
  llmClient?: LLMClient,
  scanPolicy?: ScanPolicy,
): Promise<ValidationSummary> {
  const profile = resolveExecutionProfileFromSettings(
    resolveLLMSettings(
      new Config(rootDir),
      new Secrets(rootDir),
      new GlobalLLMConfig(),
      new GlobalLLMSecrets(),
    ),
    'check',
  );
  return new CheckService({
    rootDir,
    llmClient,
    scanPolicy,
    promptTier: profile.promptProfile,
    validatePolicy: profile.validationProfile,
    generationFlow: profile.generationFlow,
  }).run();
}
