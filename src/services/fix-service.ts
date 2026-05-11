import type { LLMClient } from '../infra/llm.js';
import { TaskRunner } from '../core/pipeline.js';
import type { FixStageInput } from '../core/task-types.js';
import { FixTask } from '../tasks/fix.js';
import { ScanAndCleanupTask } from '../tasks/scan-cleanup.js';
import { ASTExtractionTask } from '../tasks/ast-extra.js';
import { ValidationSummary, ValidationTask } from '../tasks/validate.js';
import { ScanPolicy } from '../core/scan-policy.js';
import { createTaskContext } from './task-runtime.js';
import { resetTaskState } from '../core/task-state.js';
import { ArchSpineError, ErrorCodes, toArchSpineError } from '../core/errors.js';
import { defaultRuntimeIO, RuntimeIO } from '../infra/runtime-io.js';
import { runWithRuntimeSession } from './runtime-session.js';

const MAX_FIX_RETRIES = 2;

export interface FixRunSummary {
  initialViolations: number;
  remainingViolations: number;
  fixed: number;
  skipped: number;
  failed: number;
  revalidation?: ValidationSummary;
}

export interface FixServiceOptions {
  rootDir: string;
  llmClient?: LLMClient;
  scanPolicy?: ScanPolicy;
  runtimeIO?: RuntimeIO;
  skipConfirmation?: boolean;
  dryRun?: boolean;
}

export class FixService {
  constructor(private readonly options: FixServiceOptions) {}

  public async run(): Promise<FixRunSummary> {
    return runWithRuntimeSession({
      command: 'fix',
      rootDir: this.options.rootDir,
      runtimeIO: this.options.runtimeIO || defaultRuntimeIO,
      onResume: ({ previousCheckpoint, runtimeIO }) => {
        runtimeIO.info(
          `[Resume] Found interrupted fix run ${previousCheckpoint.runId}. Resuming from manifest-backed active violations.`,
        );
      },
      prepare: ({ executionCheckpoint }) => {
        if (!this.options.llmClient) {
          throw new ArchSpineError(
            ErrorCodes.LlmProviderMissing,
            '[Fix] Cannot run without an LLM provider. Configure one with "spine init" or "spine llm setup".',
            { context: { command: 'fix' } },
          );
        }
        return createTaskContext({
          ...this.options,
          isFullSync: false,
          hookMode: false,
          taskMode: 'validate',
          includeAggregator: false,
          executionCheckpoint,
          skipConfirmation: this.options.skipConfirmation ?? false,
          dryRun: this.options.dryRun ?? false,
        });
      },
      execute: async ({ context, executionCheckpoint, previousCheckpoint, runtimeIO }) => {
        executionCheckpoint.startRun({
          resumedFromRunId: previousCheckpoint?.runId || null,
        });
        runtimeIO.info('[Fix] Starting architectural auto-fix...');

        let totalFixed = 0;
        let totalSkipped = 0;
        let totalFailed = 0;
        const initialViolations = context.manifest.getActiveViolations().length;
        let lastRevalidation: ValidationSummary | undefined;

        for (let attempt = 0; attempt <= MAX_FIX_RETRIES; attempt++) {
          const violations = context.manifest.getActiveViolations();
          if (violations.length === 0) {
            if (attempt === 0) {
              runtimeIO.info(
                '[Fix] No active violations found. Run `spine check` first to detect violations, then re-run `spine fix`.',
              );
            } else {
              runtimeIO.info(`[Fix] All violations resolved after ${attempt} fix pass(es).`);
            }
            break;
          }

          if (attempt > 0) {
            runtimeIO.info(
              `\n[Fix] Retry attempt ${attempt}/${MAX_FIX_RETRIES} - ${violations.length} violation(s) remain.`,
            );
          }

          const runner = new TaskRunner(context);
          const fixInput: FixStageInput = {
            violations,
          };
          const result = await runner.run(new FixTask(), fixInput);
          totalFixed += result.fixed;
          totalSkipped += result.skipped;
          totalFailed += result.failed;

          if (result.fixed === 0) {
            runtimeIO.info('[Fix] No fixes were applied in this pass. Stopping.');
            break;
          }

          if (attempt < MAX_FIX_RETRIES) {
            const filesToRecheck = Array.from(new Set(result.recheckFiles));
            if (filesToRecheck.length === 0) {
              runtimeIO.warn(
                '[Fix] Fix pass reported changes but no files were queued for re-validation. Stopping to avoid a false convergence signal.',
              );
              break;
            }
            runtimeIO.info(`[Fix] Re-validating ${filesToRecheck.length} fixed file(s)...`);

            resetTaskState(context);

            const recheckRunner = new TaskRunner(context);
            const scanStage = await recheckRunner.run(new ScanAndCleanupTask(), {
              candidateFiles: filesToRecheck,
            });
            const extractionStage = await recheckRunner.run(new ASTExtractionTask(), scanStage);
            const validationResult = await recheckRunner.run(new ValidationTask(), extractionStage);
            const validationSummary = validationResult.summary;
            lastRevalidation = validationSummary;
            if (validationSummary.totalViolations > 0) {
              runtimeIO.info(
                `[Fix] Re-validation found ${validationSummary.totalViolations} remaining violation(s) across ${validationSummary.filesWithViolations} file(s).`,
              );
            } else {
              runtimeIO.info(
                `[Fix] Re-validation passed for ${validationSummary.auditedFiles} file(s).`,
              );
            }
          }
        }

        runtimeIO.info(
          `\n[Fix Summary] Fixed: ${totalFixed} | Skipped: ${totalSkipped} | Failed: ${totalFailed}`,
        );

        if (context.state.telemetry.stats.totalTokens > 0) {
          context.manifest.recordUsage('fix', {
            inputTokens: context.state.telemetry.stats.inputTokens,
            outputTokens: context.state.telemetry.stats.outputTokens,
            totalTokens: context.state.telemetry.stats.totalTokens,
          });
          runtimeIO.info(
            `[Usage Summary] Input Tokens: ${context.state.telemetry.stats.inputTokens} | Output Tokens: ${context.state.telemetry.stats.outputTokens} | Total Tokens: ${context.state.telemetry.stats.totalTokens}`,
          );
        }

        const remainingViolations = context.manifest.getActiveViolations();
        if (remainingViolations.length > 0) {
          runtimeIO.error(
            `\n⚠️  [Fix] ${remainingViolations.length} violation(s) remain unresolved.`,
          );
        }
        runtimeIO.info(
          `[Fix Summary] Active violations: ${initialViolations} -> ${remainingViolations.length}`,
        );
        executionCheckpoint.completeRun({
          initialViolations,
          remainingViolations: remainingViolations.length,
          fixed: totalFixed,
          skipped: totalSkipped,
          failed: totalFailed,
        });

        return {
          initialViolations,
          remainingViolations: remainingViolations.length,
          fixed: totalFixed,
          skipped: totalSkipped,
          failed: totalFailed,
          revalidation: lastRevalidation,
        };
      },
      onError: (error) => {
        throw toArchSpineError(
          error,
          ErrorCodes.FixExecutionFailed,
          '[Fix] Architectural auto-fix failed unexpectedly.',
          { context: { command: 'fix' } },
        );
      },
    });
  }
}

export async function runFix(
  rootDir: string,
  llmClient?: LLMClient,
  scanPolicy?: ScanPolicy,
): Promise<FixRunSummary> {
  return new FixService({
    rootDir,
    llmClient,
    scanPolicy,
  }).run();
}
