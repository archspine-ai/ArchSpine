import * as process from 'process';
import { Scanner } from '../../engines/scanner.js';
import { Config } from '../../infra/config.js';
import { Manifest } from '../../infra/manifest.js';
import { RuntimeService } from '../../services/runtime-service.js';
import { discoverLanguages, diffLanguages } from '../../ast/lang-discovery.js';
import { promptForExplicitConfirmation } from '../../utils/confirm.js';
import { runWithFoldableOutput } from '../../infra/ui.js';
import { ArchSpineError, ErrorCodes, toArchSpineError } from '../../core/errors.js';
import { withProtectedOutputsWriteAccess } from '../../infra/writer-boundary.js';
import { detectProtectedOutputMutations } from '../../infra/spine-gate.js';
import { evaluateRepairPolicy } from '../../infra/repair-policy.js';
import {
  ExecutionCheckpointStore,
  deriveSyncFailedCandidateFiles,
} from '../../infra/execution-checkpoint.js';
import type { LLMRuntimeOverrides } from '../../infra/llm.js';
import { throwCliUsage } from '../cli-utils.js';

function formatSyncLLMResolution(
  resolution: { value?: string; source: string },
  fallbackValue: string,
): string {
  return `${resolution.value || fallbackValue} (${resolution.source})`;
}

export interface ExecuteSyncCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
  displayUIBanner: (cmd?: string, argsArr?: string[]) => void;
  runtimeOverrides?: LLMRuntimeOverrides;
}

export async function executeSyncCommand(options: ExecuteSyncCommandOptions): Promise<void> {
  const { args, rootDir, config, runtimeService, displayUIBanner, runtimeOverrides } = options;
  displayUIBanner('sync', args);

  const supportedArgs = new Set(['--hook', '--no-docs', '--repair-violations', '--retry-failed']);
  if (args.some((arg) => !supportedArgs.has(arg))) {
    throwCliUsage('Usage: spine sync [--hook] [--repair-violations] [--retry-failed]');
  }

  const hookMode = args.includes('--hook') || args.includes('--no-docs');
  const repairViolations = args.includes('--repair-violations');
  const retryFailed = args.includes('--retry-failed');

  if ((hookMode && retryFailed) || (repairViolations && retryFailed)) {
    throwCliUsage('Usage: spine sync [--hook] [--repair-violations] [--retry-failed]');
  }

  await runSyncWorkflow({
    rootDir,
    config,
    runtimeService,
    runtimeOverrides,
    full: false,
    hookMode,
    repairViolations,
    retryFailed,
    origin: 'user',
    surface: 'sync',
  });
}

export async function runSyncWorkflow(options: {
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
  runtimeOverrides?: LLMRuntimeOverrides;
  full: boolean;
  hookMode: boolean;
  repairViolations: boolean;
  retryFailed?: boolean;
  origin: 'user' | 'hook';
  surface?: 'sync' | 'build' | 'publish';
}): Promise<void> {
  const { rootDir, config, runtimeService, runtimeOverrides } = options;
  const surface = options.surface || 'sync';
  let effectiveRuntimeOverrides = runtimeOverrides;
  if (!options.full) {
    effectiveRuntimeOverrides = {
      ...(effectiveRuntimeOverrides || {}),
      generationStrategy: 'json-only',
    };
  }

  return withProtectedOutputsWriteAccess(rootDir, async () => {
    let effectiveHookMode = options.hookMode;
    let effectiveFullSync = options.full;
    let forcedCandidateFiles: string[] | undefined;
    const syncManifest = Manifest.open(rootDir);
    const isVirginState = syncManifest.isVirginState();

    if (isVirginState && surface !== 'publish') {
      if (!effectiveFullSync) {
        console.log(`\n🌱 First run detected: The semantic mirror baseline does not exist yet.`);
        if (effectiveHookMode) {
          throwCliUsage(
            'Hook sync cannot initialize the semantic mirror. Run "spine build" first.',
          );
        }
        throwCliUsage('Semantic mirror baseline missing. Run "spine build" first.');
      }

      console.log(
        `\n🌱 First build detected: ArchSpine is creating the initial semantic mirror baseline.`,
      );
      console.log(`   This build is intentionally heavy and may take a few minutes.\n`);
      effectiveFullSync = true;
      effectiveHookMode = false;
      effectiveRuntimeOverrides = { ...(effectiveRuntimeOverrides || {}), mode: 'heavy' };
    } else if (options.retryFailed) {
      const checkpoint = new ExecutionCheckpointStore(rootDir, 'sync');
      const checkpointState = checkpoint.load();
      const checkpointWarning = checkpoint.getLastLoadWarning();
      if (checkpointWarning) {
        console.log(checkpointWarning);
      }

      if (!checkpointState) {
        console.log('[Retry Failed] No prior sync checkpoint found. Nothing to retry.');
        return;
      }

      const failedCandidates = deriveSyncFailedCandidateFiles(checkpointState);
      if (failedCandidates.length === 0) {
        console.log(
          '[Retry Failed] No failed summarization or state-commit items found in the latest sync checkpoint.',
        );
        return;
      }

      forcedCandidateFiles = failedCandidates;
      effectiveHookMode = false;
      console.log(
        `[Retry Failed] Re-running ${failedCandidates.length} failed file(s): ${failedCandidates.join(', ')}`,
      );
    } else if (options.repairViolations) {
      const violationReport = detectProtectedOutputMutations(rootDir);
      const repairDecision = evaluateRepairPolicy(violationReport);
      if (repairDecision.violationCount > 0) {
        if (repairDecision.action === 'targeted-repair') {
          forcedCandidateFiles = repairDecision.targetedSourceFiles;
          effectiveHookMode = false;
          console.log(
            `[Spine Gate] Repair mode enabled. Running targeted repair for ${repairDecision.targetedSourceFiles.length} source file(s): ${repairDecision.targetedSourceFiles.join(', ')}`,
          );
        } else if (repairDecision.action === 'prompt-full-rebuild') {
          console.log(
            `[Spine Gate] Repair mode detected broader protected output violations. ` +
              `Violations=${repairDecision.violationCount}, Aggregate=${repairDecision.aggregateLevelPaths.length}, ` +
              `Unmapped=${repairDecision.unmappedPaths.length}.`,
          );
          if (!process.stdout.isTTY) {
            if (repairDecision.safeNonInteractiveDowngrade?.action === 'targeted-repair') {
              forcedCandidateFiles = repairDecision.safeNonInteractiveDowngrade.targetedSourceFiles;
              effectiveHookMode = false;
              console.log(
                `[Spine Gate] Non-interactive repair downgraded safely to targeted repair for ${forcedCandidateFiles.length} source file(s): ${forcedCandidateFiles.join(', ')}`,
              );
            } else {
              throw new ArchSpineError(
                ErrorCodes.SyncExecutionFailed,
                `Protected output violations exceed targeted repair safety bounds. Run 'spine build' explicitly.`,
                {
                  context: {
                    action: repairDecision.action,
                    reason: repairDecision.reason,
                    violationCount: repairDecision.violationCount,
                  },
                },
              );
            }
          } else {
            const proceed = await promptForExplicitConfirmation(
              'Protected output violations exceed targeted repair bounds. Run a build now? (Recommended)',
            );

            if (!proceed) {
              throwCliUsage(
                "Repair aborted. Run 'spine build' when you're ready to rebuild protected outputs.",
              );
            }

            effectiveFullSync = true;
            effectiveHookMode = false;
            forcedCandidateFiles = undefined;
            effectiveRuntimeOverrides = { ...(effectiveRuntimeOverrides || {}), mode: 'heavy' };
            console.log('[Spine Gate] Escalating repair to a full build.');
          }
        } else {
          throw toArchSpineError(
            new Error(repairDecision.reason),
            ErrorCodes.SyncExecutionFailed,
            `Protected output violations require a full build. Run 'spine build'.`,
            {
              context: {
                action: repairDecision.action,
                reason: repairDecision.reason,
                violationCount: repairDecision.violationCount,
                unmappedPaths: repairDecision.unmappedPaths,
              },
            },
          );
        }
      } else if (options.origin === 'user') {
        console.log(surface === 'build' ? 'Building Spine...' : 'Syncing Spine...');
      }
    } else if (options.origin === 'user') {
      console.log(surface === 'build' ? 'Building Spine...' : 'Syncing Spine...');
    }

    const prevSnapshot = syncManifest.loadLanguageSnapshot();
    const syncScanner = new Scanner(rootDir, config.getScanPolicy());
    const currentFiles = syncScanner.getAllTrackedFiles();
    const currentSnapshot = await discoverLanguages(currentFiles);

    if (prevSnapshot) {
      const delta = diffLanguages(prevSnapshot, currentSnapshot);
      if (delta.newExtensions.length > 0 || delta.statusChanges.length > 0) {
        console.log(`\n🔄 Language landscape changed:`);
        if (delta.newExtensions.length > 0) {
          console.log(`  - New extensions: ${delta.newExtensions.join(', ')}`);
        }
        for (const change of delta.statusChanges) {
          console.log(`  - ${change.language}: ${change.oldStatus} -> ${change.newStatus}`);
        }
      }
    }
    syncManifest.saveLanguageSnapshot(currentSnapshot);

    let syncStats: {
      processed: number;
      skipped: number;
      failed: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
    try {
      syncStats = await runWithFoldableOutput(() =>
        runtimeService
          .getSyncService(effectiveRuntimeOverrides)
          .sync(effectiveFullSync, effectiveHookMode, {
            candidateFiles: forcedCandidateFiles,
            forceCandidateFiles: forcedCandidateFiles,
          }),
      );
    } catch (error) {
      throw toArchSpineError(
        error,
        ErrorCodes.SyncExecutionFailed,
        'Sync failed. Please verify .spine state files and runtime configuration, then retry.',
        {
          context: {
            full: effectiveFullSync,
            hookMode: effectiveHookMode,
            origin: options.origin,
          },
        },
      );
    }
    if (effectiveHookMode) {
      console.log(
        `\n[Hook Sync Summary] Processed: ${syncStats.processed} | Skipped: ${syncStats.skipped} | Failed: ${syncStats.failed}`,
      );
      console.log(`⚡ Atlas synthesis skipped. Run 'spine sync' to rebuild the full Atlas.`);
    } else {
      const resolvedLlmSettings = runtimeService.getResolvedLLMSettings(effectiveRuntimeOverrides);
      const summaryLabel = surface === 'build' ? 'Spine Build Summary' : 'Spine Sync Summary';
      console.log(
        `\n[${summaryLabel}] Processed: ${syncStats.processed} | Skipped: ${syncStats.skipped} | Failed: ${syncStats.failed}`,
      );
      console.log(
        `[Usage Summary] Input Tokens: ${syncStats.inputTokens} | Output Tokens: ${syncStats.outputTokens} | Total Tokens: ${syncStats.totalTokens}`,
      );
      console.log(
        `[LLM Summary] Provider: ${formatSyncLLMResolution(resolvedLlmSettings.provider, 'unset')} | ` +
          `Model: ${formatSyncLLMResolution(resolvedLlmSettings.model, 'default')}`,
      );
    }

    if (
      !effectiveFullSync &&
      !effectiveHookMode &&
      surface !== 'publish' &&
      syncStats.processed > 0
    ) {
      syncManifest.markAtlasStale();
      console.log(
        `[Consistency] Atlas marked stale (.spine/.stale). Run 'spine publish' or 'spine build' to refresh docs.`,
      );
    } else if (effectiveFullSync && !effectiveHookMode) {
      syncManifest.clearAtlasStale();
    }
  });
}
