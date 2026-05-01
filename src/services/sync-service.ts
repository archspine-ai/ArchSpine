import * as fs from 'fs';
import * as path from 'path';
import { TaskRunner } from '../core/pipeline.js';
import type { SummarizationStageOutput } from '../core/task-types.js';
import { ReconcileTask } from '../tasks/reconcile.js';
import { ScanAndCleanupTask } from '../tasks/scan-cleanup.js';
import { ASTExtractionTask } from '../tasks/ast-extra.js';
import { SummarizationTask } from '../tasks/summarize.js';
import { StateCommitTask } from '../tasks/state-commit.js';
import { PostCommitDerivationTask } from '../tasks/post-commit-derivation.js';
import { LangRegistry } from '../ast/lang-registry.js';
import {
  detectProtectedOutputMutations,
  formatProtectedOutputMutationWarning,
  writeProtectedOutputBaseline,
} from '../infra/spine-gate.js';
import { createTaskContext, ServiceOptions } from './task-runtime.js';
import { defaultRuntimeIO } from '../infra/runtime-io.js';
import { deriveSyncResumeCandidateFiles } from '../infra/execution-checkpoint.js';
import { runWithRuntimeSession } from './runtime-session.js';

export interface SyncStats {
  processed: number;
  skipped: number;
  failed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface SyncExecutionOptions {
  candidateFiles?: string[];
  forceCandidateFiles?: string[];
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function logStageMetrics(
  runtimeIO: typeof defaultRuntimeIO,
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
  const focusStages = [
    'ast-extraction',
    'summarization',
    'state-commit',
    'post-commit-derivation',
    'reverse-index',
    'aggregation',
    'view-derivation',
  ];
  const safeMetrics = metrics || {};

  runtimeIO.info(' Stage Telemetry:');
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

function mergeUnique(items: Array<string[] | undefined>): string[] | undefined {
  const merged = Array.from(new Set(items.flatMap((entry) => entry || [])));
  return merged.length > 0 ? merged : undefined;
}

export class SyncService {
  constructor(private readonly options: ServiceOptions) {}

  public async status(): Promise<{ total: number; needingSync: number }> {
    const runtimeIO = this.options.runtimeIO || defaultRuntimeIO;
    const violationWarning = formatProtectedOutputMutationWarning(
      detectProtectedOutputMutations(this.options.rootDir),
    );
    if (violationWarning) {
      runtimeIO.warn(violationWarning);
    }

    const { context } = createTaskContext({
      ...this.options,
      isFullSync: false,
      hookMode: false,
      includeAggregator: false,
    });

    const files = context.scanner.getAllTrackedFiles();
    const filteredFiles = context.scanner.filterFiles(files, LangRegistry.getTrackedExtensions());

    let needingSync = 0;
    for (const file of filteredFiles) {
      const filePath = path.join(this.options.rootDir, file);
      if (!fs.existsSync(filePath)) {
        continue;
      }
      const hash = context.manifest.calculateHash(filePath);
      if (context.manifest.needsUpdate(file, hash)) {
        needingSync++;
      }
    }

    return { total: filteredFiles.length, needingSync };
  }

  public async sync(
    full: boolean = false,
    hookMode: boolean = false,
    executionOptions: SyncExecutionOptions = {},
  ): Promise<SyncStats> {
    return runWithRuntimeSession({
      command: 'sync',
      rootDir: this.options.rootDir,
      runtimeIO: this.options.runtimeIO || defaultRuntimeIO,
      onResume: ({ previousCheckpoint, runtimeIO }) => {
        const resumeCandidateFiles = deriveSyncResumeCandidateFiles(previousCheckpoint);
        runtimeIO.info(
          `[Resume] Found interrupted sync run ${previousCheckpoint.runId}. ` +
            `Recoverable source candidates: ${resumeCandidateFiles.length}.`,
        );
      },
      prepare: ({ executionCheckpoint, previousCheckpoint }) => {
        const resumeCandidateFiles = deriveSyncResumeCandidateFiles(previousCheckpoint);
        const effectiveForceCandidateFiles = mergeUnique([
          executionOptions.forceCandidateFiles,
          resumeCandidateFiles,
        ]);
        return createTaskContext({
          ...this.options,
          isFullSync: full,
          hookMode,
          writeAtlasDocs: full && !hookMode,
          includeAggregator: true,
          forcedSyncFiles: effectiveForceCandidateFiles,
          executionCheckpoint,
        });
      },
      execute: async ({ context, executionCheckpoint, previousCheckpoint, runtimeIO }) => {
        const startTime = Date.now();
        const resumeCandidateFiles = deriveSyncResumeCandidateFiles(previousCheckpoint);
        const effectiveCandidateFiles = mergeUnique([
          executionOptions.candidateFiles,
          resumeCandidateFiles,
        ]);
        executionCheckpoint.startRun({
          full,
          hookMode,
          resumedFromRunId: previousCheckpoint?.runId || null,
          resumeCandidateCount: resumeCandidateFiles.length,
        });
        const runner = new TaskRunner(context);
        await runner.runVoid(new ReconcileTask());
        const scanStage = await runner.run(new ScanAndCleanupTask(), {
          candidateFiles: effectiveCandidateFiles,
        });
        const extractionStage = await runner.run(new ASTExtractionTask(), scanStage);
        const summarizationStage: SummarizationStageOutput = hookMode
          ? {
              selection: extractionStage.selection,
              artifacts: {
                ...extractionStage.artifacts,
                pendingCommits: new Map(),
              },
            }
          : await runner.run(new SummarizationTask(), extractionStage);

        const commitStage = await runner.run(new StateCommitTask(), summarizationStage);
        await runner.run(
          new PostCommitDerivationTask(this.options.experimentalViewLayer === true),
          commitStage,
        );

        const durationMs = Date.now() - startTime;
        context.manifest.save(full ? 'full' : 'incremental', durationMs, {
          provider: this.options.resolvedLLMSettings?.provider,
          model: this.options.resolvedLLMSettings?.model,
        });
        writeProtectedOutputBaseline(this.options.rootDir);
        const stats = context.state.telemetry.stats;
        if (stats.totalTokens > 0) {
          context.manifest.recordUsage(full ? 'full' : 'incremental', {
            inputTokens: stats.inputTokens,
            outputTokens: stats.outputTokens,
            totalTokens: stats.totalTokens,
          });
        }
        if (context.state.telemetry.driftWarnings.length > 0) {
          runtimeIO.warn(
            `Semantic change detected in ${context.state.telemetry.driftWarnings.length} file(s):`,
          );
          for (const warning of context.state.telemetry.driftWarnings) {
            runtimeIO.warn(`  [Semantic Change] ${warning.filePath}: ${warning.reason}`);
          }
        }
        const seconds = Math.floor(durationMs / 1000);
        const rate = seconds > 0 ? Math.floor(stats.totalTokens / seconds) : 0;

        runtimeIO.info(`\n========================================`);
        runtimeIO.info(` Sync Performance Details (${full ? 'FULL' : 'INC'})`);
        runtimeIO.info(`========================================`);
        runtimeIO.info(` Duration:    ${seconds}s`);
        runtimeIO.info(` Throughput:  ${rate} tokens/sec`);
        runtimeIO.info(` Processed:   ${stats.processed} files`);
        runtimeIO.info(` Skipped:     ${stats.skipped} files`);
        runtimeIO.info(` Failed:      ${stats.failed} errors`);
        runtimeIO.info(
          ` Usage:       ${stats.inputTokens.toLocaleString()} (In) / ${stats.outputTokens.toLocaleString()} (Out)`,
        );
        logStageMetrics(runtimeIO, context.state.telemetry.stageMetrics);
        runtimeIO.info(`========================================\n`);
        executionCheckpoint.completeRun({
          processed: stats.processed,
          skipped: stats.skipped,
          failed: stats.failed,
          totalTokens: stats.totalTokens,
        });

        return {
          processed: stats.processed,
          skipped: stats.skipped,
          failed: stats.failed,
          inputTokens: stats.inputTokens,
          outputTokens: stats.outputTokens,
          totalTokens: stats.totalTokens,
        };
      },
    });
  }
}
