import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
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
import {
  ExecutionCheckpointStore,
  deriveSyncFailedCandidateFiles,
  deriveSyncResumeCandidateFiles,
} from '../infra/execution-checkpoint.js';
import { evaluateRepairPolicy } from '../infra/repair-policy.js';
import { runWithRuntimeSession } from './runtime-session.js';
import { Scanner } from '../engines/scanner.js';
import { Manifest } from '../infra/manifest.js';
import { discoverLanguages, diffLanguages } from '../ast/lang-discovery.js';
import { promptForExplicitConfirmation } from '../utils/confirm.js';
import { runWithFoldableOutput } from '../infra/ui.js';
import { ArchSpineError, ErrorCodes, toArchSpineError } from '../core/errors.js';
import { syncV2AgentInstructionBlocks } from './repository-admin-service.js';

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

export interface SyncWorkflowOptions {
  runtimeOverrides?: Record<string, unknown>;
  full: boolean;
  hookMode: boolean;
  repairViolations: boolean;
  retryFailed?: boolean;
  origin: 'user' | 'hook';
  surface?: 'sync' | 'build';
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

    const prepared = createTaskContext({
      ...this.options,
      isFullSync: false,
      hookMode: false,
      includeAggregator: false,
    });

    try {
      const files = prepared.context.scanner.getAllTrackedFiles();
      const filteredFiles = prepared.context.scanner.filterFiles(
        files,
        LangRegistry.getTrackedExtensions(),
      );

      let needingSync = 0;
      for (const file of filteredFiles) {
        const filePath = path.join(this.options.rootDir, file);
        if (!fs.existsSync(filePath)) {
          continue;
        }
        const hash = prepared.context.manifest.calculateHash(filePath);
        if (prepared.context.manifest.needsUpdate(file, hash)) {
          needingSync++;
        }
      }

      return { total: filteredFiles.length, needingSync };
    } finally {
      prepared.close();
    }
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
          new PostCommitDerivationTask(this.options.viewLayer === true),
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

  /**
   * Orchestrated sync workflow: handles mode resolution (virgin, retry, repair),
   * language discovery, protected output compliance, and post-sync agent refresh.
   * Thin CLI adapters call this method instead of duplicating orchestration logic.
   */
  public async runSyncWorkflow(options: SyncWorkflowOptions): Promise<SyncStats> {
    const rootDir = this.options.rootDir;
    const config = this.options.config;
    const runtimeIO = this.options.runtimeIO || defaultRuntimeIO;
    const surface = options.surface || 'sync';

    let effectiveRuntimeOverrides = options.runtimeOverrides;
    if (!options.full) {
      effectiveRuntimeOverrides = {
        ...(effectiveRuntimeOverrides || {}),
        generationStrategy: 'json-only',
      };
    }

    let effectiveHookMode = options.hookMode;
    let effectiveFullSync = options.full;
    let forcedCandidateFiles: string[] | undefined;

    const syncManifest = Manifest.open(rootDir);
    try {
      const needsInit = syncManifest.needsInitialSync();

      if (needsInit) {
        if (!effectiveFullSync) {
          runtimeIO.info('\n📦 Index not yet initialized: auto-escalating to full sync.\n');
          effectiveFullSync = true;
          effectiveHookMode = false;
        }
      } else if (options.retryFailed) {
        const checkpoint = new ExecutionCheckpointStore(rootDir, 'sync');
        const checkpointState = checkpoint.load();
        if (!checkpointState) {
          runtimeIO.info('[Retry Failed] No prior sync checkpoint found. Nothing to retry.');
          return {
            processed: 0,
            skipped: 0,
            failed: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          };
        }
        const failedCandidates = deriveSyncFailedCandidateFiles(checkpointState);
        if (failedCandidates.length === 0) {
          runtimeIO.info(
            '[Retry Failed] No failed summarization or state-commit items found in the latest sync checkpoint.',
          );
          return {
            processed: 0,
            skipped: 0,
            failed: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          };
        }
        forcedCandidateFiles = failedCandidates;
        effectiveHookMode = false;
        runtimeIO.info(
          `[Retry Failed] Re-running ${failedCandidates.length} failed file(s): ${failedCandidates.join(', ')}`,
        );
      } else if (options.repairViolations) {
        const violationReport = detectProtectedOutputMutations(rootDir);
        const repairDecision = evaluateRepairPolicy(violationReport);
        if (repairDecision.violationCount > 0) {
          if (repairDecision.action === 'targeted-repair') {
            forcedCandidateFiles = repairDecision.targetedSourceFiles;
            effectiveHookMode = false;
            runtimeIO.info(
              `[Spine Gate] Repair mode enabled. Running targeted repair for ${repairDecision.targetedSourceFiles.length} source file(s): ${repairDecision.targetedSourceFiles.join(', ')}`,
            );
          } else if (repairDecision.action === 'prompt-full-rebuild') {
            runtimeIO.info(
              `[Spine Gate] Repair mode detected broader protected output violations. ` +
                `Violations=${repairDecision.violationCount}, Aggregate=${repairDecision.aggregateLevelPaths.length}, ` +
                `Unmapped=${repairDecision.unmappedPaths.length}.`,
            );
            if (!process.stdout.isTTY) {
              if (repairDecision.safeNonInteractiveDowngrade?.action === 'targeted-repair') {
                forcedCandidateFiles =
                  repairDecision.safeNonInteractiveDowngrade.targetedSourceFiles;
                effectiveHookMode = false;
                runtimeIO.info(
                  `[Spine Gate] Non-interactive repair downgraded safely to targeted repair for ${forcedCandidateFiles.length} source file(s): ${forcedCandidateFiles.join(', ')}`,
                );
              } else {
                throw new ArchSpineError(
                  ErrorCodes.SyncExecutionFailed,
                  `Protected output violations exceed targeted repair safety bounds. Run 'spine build' explicitly.`,
                );
              }
            } else {
              const proceed = await promptForExplicitConfirmation(
                'Protected output violations exceed targeted repair bounds. Run a build now? (Recommended)',
              );
              if (!proceed) {
                throw new ArchSpineError(
                  ErrorCodes.CliCommandFailed,
                  "Repair aborted. Run 'spine build' when you're ready to rebuild protected outputs.",
                );
              }
              effectiveFullSync = true;
              effectiveHookMode = false;
              forcedCandidateFiles = undefined;
              runtimeIO.info('[Spine Gate] Escalating repair to a full build.');
            }
          } else {
            throw toArchSpineError(
              new Error(repairDecision.reason),
              ErrorCodes.SyncExecutionFailed,
              `Protected output violations require a full build. Run 'spine build'.`,
            );
          }
        }
      }

      // Language discovery and diffing
      const prevSnapshot = syncManifest.loadLanguageSnapshot();
      const syncScanner = new Scanner(rootDir, this.options.scanPolicy);
      const currentFiles = syncScanner.getAllTrackedFiles();
      const currentSnapshot = await discoverLanguages(currentFiles);

      if (prevSnapshot) {
        const delta = diffLanguages(prevSnapshot, currentSnapshot);
        if (delta.newExtensions.length > 0 || delta.statusChanges.length > 0) {
          runtimeIO.info('\n🔄 Language landscape changed:');
          for (const ext of delta.newExtensions) {
            runtimeIO.info(`  - New extensions: ${ext}`);
          }
          for (const change of delta.statusChanges) {
            runtimeIO.info(`  - ${change.language}: ${change.oldStatus} -> ${change.newStatus}`);
          }
        }
      }
      syncManifest.saveLanguageSnapshot(currentSnapshot);

      // Run the core sync pipeline
      let syncStats: SyncStats;
      try {
        syncStats = await runWithFoldableOutput(() =>
          this.sync(effectiveFullSync, effectiveHookMode, {
            candidateFiles: forcedCandidateFiles,
            forceCandidateFiles: forcedCandidateFiles,
          }),
        );
      } catch (error) {
        throw toArchSpineError(
          error,
          ErrorCodes.SyncExecutionFailed,
          'Sync failed. Please verify .spine state files and runtime configuration, then retry.',
        );
      }
      if (effectiveHookMode) {
        runtimeIO.info(
          `[Hook Sync Summary] Processed: ${syncStats.processed} | Skipped: ${syncStats.skipped} | Failed: ${syncStats.failed}`,
        );
      } else {
        const summaryLabel = surface === 'build' ? 'Spine Build Summary' : 'Spine Sync Summary';
        runtimeIO.info(
          `[${summaryLabel}] Processed: ${syncStats.processed} | Skipped: ${syncStats.skipped} | Failed: ${syncStats.failed}`,
        );
        runtimeIO.info(
          `[Usage Summary] Input Tokens: ${syncStats.inputTokens} | Output Tokens: ${syncStats.outputTokens} | Total Tokens: ${syncStats.totalTokens}`,
        );
      }

      // Refresh V2 agent instruction blocks
      if (!effectiveHookMode && typeof config?.getAgentInstructionsFile === 'function') {
        const agentFile = config.getAgentInstructionsFile();
        if (agentFile) {
          syncV2AgentInstructionBlocks(rootDir, agentFile);
        }
      }

      return syncStats;
    } finally {
      syncManifest.close?.();
    }
  }
}
