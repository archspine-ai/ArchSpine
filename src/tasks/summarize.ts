import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import { SpineTask, TaskContext, TaskContextFor } from '../core/task.js';
import type { ExtractionStageOutput, SummarizationStageOutput } from '../core/task-types.js';
import {
  FileKind,
  RuleViolation,
  SpineSemantic,
  SpineSkeleton,
  SpineUnit,
  SymbolDependencyEdge,
  SymbolKind,
  CURRENT_SCHEMA_VERSION,
  GENERATOR_VERSION,
} from '../types/protocol.js';
import type { FileSkeleton } from '../ast/extractor.js';
import type { PreviousSemanticContext } from '../infra/llm.js';
import { LangRegistry } from '../ast/lang-registry.js';
import {
  buildSourcePromptArtifacts,
  RelevanceDiagnosticsSnapshot,
} from '../infra/prompt-context.js';
import {
  addTaskDriftWarning,
  addTaskUsage,
  incrementTaskFailed,
  incrementTaskSkipped,
  markTaskProcessedFile,
  pushSummarizeDiagnostics,
  queueTaskCommit,
} from '../core/task-state.js';
import { isRetryableError } from '../infra/llm/retry.js';
import { calculateSemanticFootprint, calculateStructuralFootprint } from '../utils/footprint.js';

type SummarizationTaskContext = TaskContextFor<
  | 'rootDir'
  | 'scanner'
  | 'manifest'
  | 'outputManager'
  | 'ruleEngine'
  | 'contextEngine'
  | 'extractor'
  | 'llmClient'
  | 'promptTier'
  | 'validatePolicy'
  | 'summarizeConcurrency'
  | 'summarizeRetryLimit'
  | 'targetLocales'
  | 'writeAtlasDocs'
  | 'isFullSync'
  | 'forcedSyncFiles'
  | 'runtimeIO'
  | 'executionCheckpoint'
  | 'runtimeCache'
  | 'state'
  | 'hookMode'
>;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function getRuleViolations(value: unknown): RuleViolation[] | undefined {
  return Array.isArray(value)
    ? value.filter(isObjectRecord).map((entry) => ({
        id: typeof entry.id === 'string' ? entry.id : 'rule-id',
        severity: typeof entry.severity === 'string' ? entry.severity : 'warning',
        reason: typeof entry.reason === 'string' ? entry.reason : '',
      }))
    : undefined;
}

function getSummarizationFileKind(relativeFilePath: string): FileKind {
  if (LangRegistry.isSourceFile(relativeFilePath)) {
    return 'source';
  }
  if (relativeFilePath.endsWith('.json')) {
    return 'config';
  }
  return 'document';
}

function shouldSummarizeFile(
  ctx: SummarizationTaskContext,
  input: ExtractionStageOutput,
  file: string,
  hash: string,
): boolean {
  const skeletonExtractedThisTurn = input.artifacts.skeletons.has(file);
  return (
    ctx.isFullSync ||
    ctx.forcedSyncFiles.has(file) ||
    skeletonExtractedThisTurn ||
    ctx.manifest.needsUpdate(file, hash)
  );
}

function persistSummarizationOutputs(
  ctx: SummarizationTaskContext,
  fullTaskContext: TaskContext,
  pendingCommits: Map<string, { hash: string; kind: FileKind; spineUnit: SpineUnit }>,
  relativeFilePath: string,
  hash: string,
  fileKind: FileKind,
  spineUnit: SpineUnit,
  markdown: string | Record<string, string> | undefined,
): void {
  ctx.outputManager.saveIndex(relativeFilePath, spineUnit);

  if (ctx.writeAtlasDocs) {
    for (const locale of ctx.targetLocales) {
      if (markdown && typeof markdown === 'object' && markdown[locale]) {
        ctx.outputManager.saveDocs(relativeFilePath, locale, markdown[locale]);
      } else if (typeof markdown === 'string') {
        ctx.outputManager.saveDocs(relativeFilePath, locale, markdown);
      }
    }
  }

  ctx.manifest.clearViolations(relativeFilePath);
  pendingCommits.set(relativeFilePath, { hash, kind: fileKind, spineUnit });
  queueTaskCommit(fullTaskContext, relativeFilePath, { hash, kind: fileKind, spineUnit });
}

/**
 * Ensures LLM-generated semantic block conforms to SpineSemantic interface.
 * Provides fallbacks for missing fields to avoid breaking schema.
 */
function sanitizeSemantic(raw: unknown): SpineSemantic {
  const semantic = isObjectRecord(raw) ? raw : {};
  const changeIntent = isObjectRecord(semantic.changeIntent) ? semantic.changeIntent : {};
  return {
    role: typeof semantic.role === 'string' ? semantic.role : 'Unknown role',
    responsibilities: getStringArray(semantic.responsibilities),
    outOfScope: getStringArray(semantic.outOfScope),
    invariants: Array.isArray(semantic.invariants) ? semantic.invariants : [],
    changeIntent: {
      architecturalIntent:
        typeof changeIntent.architecturalIntent === 'string'
          ? changeIntent.architecturalIntent
          : null,
      recentChangeIntent:
        typeof changeIntent.recentChangeIntent === 'string'
          ? changeIntent.recentChangeIntent
          : null,
    },
    publicSurface: Array.isArray(semantic.publicSurface) ? semantic.publicSurface : [],
    ruleViolations: getRuleViolations(semantic.ruleViolations),
    driftDetected: Boolean(semantic.driftDetected),
    driftReason: typeof semantic.driftReason === 'string' ? semantic.driftReason : null,
    localized: isObjectRecord(semantic.localized)
      ? (semantic.localized as Record<string, unknown>)
      : undefined,
  };
}

function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldPropagateDirChange(
  previousUnit: SpineUnit | undefined,
  nextUnit: SpineUnit,
): boolean {
  if (!previousUnit?.identity?.semanticHash || !nextUnit.identity.semanticHash) {
    return true;
  }
  return previousUnit.identity.semanticHash !== nextUnit.identity.semanticHash;
}

function hasAllRequestedMarkdown(
  markdown: Record<string, string> | undefined,
  targetLocales: string[],
): boolean {
  if (!markdown) {
    return false;
  }

  return targetLocales.every((locale) => {
    const content = markdown[locale];
    return typeof content === 'string' && content.trim().length > 0;
  });
}

function buildSpineSkeleton(fileSkeleton: FileSkeleton, filePath: string): SpineSkeleton {
  const imports = (fileSkeleton.imports || []).map((imp) => ({
    source: imp.source,
    symbols: imp.symbols,
    locality: (imp.source.startsWith('.') ? 'local' : 'external') as 'local' | 'external',
  }));

  const exports = (fileSkeleton.exports || []).map((exp) => ({
    name: exp.name,
    kind: exp.kind.toLowerCase() as SymbolKind,
    signature: exp.signature || null,
  }));

  const declaredSymbols = (fileSkeleton.exports || []).map((exp) => ({
    name: exp.name,
    kind: exp.kind.toLowerCase() as SymbolKind,
    exported: true,
    symbolUri: `${filePath}#`,
  }));

  const exportKinds = exports.map((e) => e.kind);
  const isTypeOnly =
    exportKinds.length > 0 && exportKinds.every((k) => k === 'interface' || k === 'type');

  return {
    imports,
    exports,
    declaredSymbols,
    structuralHints: {
      importCount: imports.length,
      exportCount: exports.length,
      isBarrel: exports.length >= 3 && imports.length >= 3,
      isTypeOnly,
    },
  };
}

export class SummarizationTask extends SpineTask<ExtractionStageOutput, SummarizationStageOutput> {
  name = 'LLM Summarization & Synthesis';
  checkpointId = 'summarization';

  async execute(ctx: TaskContext, input: ExtractionStageOutput): Promise<SummarizationStageOutput> {
    const taskCtx: SummarizationTaskContext = ctx;
    if (taskCtx.writeAtlasDocs) {
      const removedLocales = taskCtx.outputManager.pruneAtlasLocales(taskCtx.targetLocales);
      if (removedLocales.length > 0) {
        taskCtx.runtimeIO.info(
          `[Task: Summarization] Removed stale atlas locales: ${removedLocales.join(', ')}`,
        );
      }
    }

    if (!ctx.llmClient) {
      ctx.runtimeIO.warn('[Task: Summarization] Skipping because LLM Client is not configured.');
      return {
        selection: input.selection,
        artifacts: {
          ...input.artifacts,
          pendingCommits: new Map(),
        },
      };
    }

    const limit = pLimit(taskCtx.summarizeConcurrency);
    const branch = taskCtx.scanner.getBranchName();
    const status = taskCtx.scanner.getGitStatusInfo();
    const pendingCommits = new Map<
      string,
      { hash: string; kind: FileKind; spineUnit: SpineUnit }
    >();
    const affectedDirs = new Set(input.selection.affectedDirs);
    taskCtx.runtimeCache.pendingCommits = pendingCommits;
    taskCtx.runtimeIO.info(
      `[Task: Summarization] Concurrency=${taskCtx.summarizeConcurrency} RetryLimit=${taskCtx.summarizeRetryLimit}`,
    );
    const syncPromises = input.selection.filteredFiles.map((file) =>
      limit(async () => {
        try {
          if (input.artifacts.unsupportedFiles.has(file)) {
            incrementTaskSkipped(ctx);
            return;
          }

          const filePath = path.join(taskCtx.rootDir, file);
          const hash = taskCtx.manifest.calculateHash(filePath);
          if (shouldSummarizeFile(taskCtx, input, file, hash)) {
            const fileKind = getSummarizationFileKind(file);

            if (!taskCtx.hookMode && !taskCtx.isFullSync) {
              // Attempt zero-token recovery from local index for interrupted runs
              const recovered = await tryRecoverFromLocalIndex(
                taskCtx,
                ctx,
                pendingCommits,
                file,
                hash,
                fileKind,
              );
              if (recovered) {
                affectedDirs.add(path.dirname(file));
                incrementTaskSkipped(ctx);
                return;
              }
            }

            taskCtx.runtimeIO.info(`[Task: Summarization] Processing ${file}...`);
            taskCtx.executionCheckpoint?.markItemStarted(this.checkpointId, file);
            const shouldPropagate = await this.summarizeFileWithRetry(
              taskCtx,
              ctx,
              input,
              pendingCommits,
              file,
              filePath,
              hash,
              branch,
              status,
            );
            taskCtx.executionCheckpoint?.markItemCompleted(this.checkpointId, file);
            markTaskProcessedFile(ctx, file);
            if (shouldPropagate) {
              affectedDirs.add(path.dirname(file));
            }
          } else {
            taskCtx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, {
              reason: 'up-to-date',
            });
            incrementTaskSkipped(ctx);
          }
        } catch (error) {
          taskCtx.runtimeIO.error(
            `[Task: Summarization] Failed to sync ${file} after retries:`,
            formatErrorMessage(error),
          );
          taskCtx.executionCheckpoint?.markItemFailed(this.checkpointId, file, error);
          incrementTaskFailed(ctx);
        }
      }),
    );
    await Promise.all(syncPromises);

    if (
      taskCtx.state.telemetry.diagnostics.mode !== 'off' &&
      taskCtx.state.telemetry.diagnostics.summarize.length > 0
    ) {
      const snapshot: RelevanceDiagnosticsSnapshot = {
        taskMode: 'summarize',
        promptTier: taskCtx.promptTier,
        validatePolicy: taskCtx.validatePolicy,
        generatedAt: new Date().toISOString(),
        files: taskCtx.state.telemetry.diagnostics.summarize,
      };
      taskCtx.outputManager.saveDiagnostics('summarize-diagnostics.json', snapshot);
      taskCtx.runtimeIO.info(
        `[Diagnostics] Wrote summarize relevance snapshot for ${snapshot.files.length} file(s).`,
      );
    }

    return {
      selection: {
        filteredFiles: input.selection.filteredFiles,
        affectedDirs,
      },
      artifacts: {
        ...input.artifacts,
        pendingCommits,
      },
    };
  }

  // Helper method for the Task itself, so I'll put it at the end of summarize.ts or here.
  // Actually, I can put it right above or below `summarizeFileWithRetry`

  private async summarizeFileWithRetry(
    ctx: SummarizationTaskContext,
    fullTaskContext: TaskContext,
    input: ExtractionStageOutput,
    pendingCommits: Map<string, { hash: string; kind: FileKind; spineUnit: SpineUnit }>,
    relativeFilePath: string,
    fullPath: string,
    hash: string,
    branch: string,
    status: string,
  ): Promise<boolean> {
    const maxAttempts = Math.max(1, ctx.summarizeRetryLimit + 1);
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        if (attempt > 1) {
          ctx.runtimeIO.warn(
            `[Task: Summarization] Retry ${attempt}/${maxAttempts} for ${relativeFilePath}...`,
          );
        }
        return await this.summarizeFile(
          ctx,
          fullTaskContext,
          input,
          pendingCommits,
          relativeFilePath,
          fullPath,
          hash,
          branch,
          status,
        );
      } catch (error) {
        lastError = error;
        if (attempt >= maxAttempts || !isRetryableError(error)) {
          throw error;
        }

        const baseDelayMs = 5000 * 2 ** (attempt - 1);
        const jitter = Math.floor(Math.random() * baseDelayMs * 0.3);
        const delayMs = baseDelayMs + jitter;

        ctx.runtimeIO.warn(
          `[Task: Summarization] Attempt ${attempt}/${maxAttempts} failed for ${relativeFilePath}. ` +
            `Retrying in ${delayMs}ms. Error: ${formatErrorMessage(error)}`,
        );
        await wait(delayMs);
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async summarizeFile(
    ctx: SummarizationTaskContext,
    fullTaskContext: TaskContext,
    input: ExtractionStageOutput,
    pendingCommits: Map<string, { hash: string; kind: FileKind; spineUnit: SpineUnit }>,
    relativeFilePath: string,
    fullPath: string,
    hash: string,
    branch: string,
    status: string,
  ): Promise<boolean> {
    const stat = fs.statSync(fullPath);
    const MAX_SUMMARIZE_SIZE = 2 * 1024 * 1024; // 2MB
    if (stat.size > MAX_SUMMARIZE_SIZE) {
      throw new Error(
        `File is too large for LLM summarization (${(stat.size / 1024).toFixed(1)} KB). ` +
          `ArchSpine has a 2MB safety limit per file. You MUST add this file to .spineignore or .gitignore to proceed cleanly.`,
      );
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const gitIntent = ctx.scanner.getFileLastCommit(relativeFilePath);
    const rules = ctx.ruleEngine.getRulesForFile(relativeFilePath);
    let ruleData = rules.join('\n\n');

    const fileKind = getSummarizationFileKind(relativeFilePath);

    const previousUnit = ctx.manifest.getFileDocs(relativeFilePath);
    let previousSemantic: PreviousSemanticContext | undefined = previousUnit?.semantic
      ? {
          role: previousUnit.semantic.role,
          responsibilities: previousUnit.semantic.responsibilities || [],
        }
      : undefined;

    let fileInput = content;
    let contextData = '';
    let symbolEdges: SymbolDependencyEdge[] = [];

    let resolvedSkeleton = input.artifacts.skeletons.get(relativeFilePath);
    try {
      if (fileKind === 'source') {
        const skeleton =
          resolvedSkeleton || (await ctx.extractor.extract(content, relativeFilePath));
        resolvedSkeleton = skeleton;
        const currentStructuralHash = calculateStructuralFootprint(skeleton);
        if (
          previousUnit?.identity?.skeletonHash &&
          previousUnit.identity.skeletonHash === currentStructuralHash
        ) {
          const semantic = sanitizeSemantic(previousUnit.semantic);
          const semanticHash =
            previousUnit.identity.semanticHash || calculateSemanticFootprint(semantic);
          const recoveredUnit: SpineUnit = {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            identity: {
              filePath: relativeFilePath,
              contentHash: hash,
              skeletonHash: currentStructuralHash,
              semanticHash,
              language: LangRegistry.getSourceLanguage(relativeFilePath),
              fileKind,
              scope: path.dirname(relativeFilePath) === '.' ? '' : path.dirname(relativeFilePath),
            },
            semantic,
            skeleton: previousUnit.skeleton,
            graph: {
              ...previousUnit.graph,
              reverseIndexComplete: Boolean(previousUnit.graph?.reverseIndexComplete),
            },
            provenance: {
              indexedAt: new Date().toISOString(),
              generatorVersion: GENERATOR_VERSION,
              pipelineStages: ['ast', 'fallback'],
            },
          };
          persistSummarizationOutputs(
            ctx,
            fullTaskContext,
            pendingCommits,
            relativeFilePath,
            hash,
            fileKind,
            recoveredUnit,
            undefined,
          );
          return false;
        }
        const resolved = ctx.contextEngine.resolveDependencies(
          relativeFilePath,
          skeleton,
          ctx.manifest,
        );
        const promptArtifacts = buildSourcePromptArtifacts({
          content,
          skeleton,
          dependencyContext: resolved.contextData,
          dependencyDiagnostics: resolved.diagnostics,
          ruleData,
          previousSemantic,
          taskMode: 'summarize',
          promptTier: ctx.promptTier,
          validatePolicy: ctx.validatePolicy,
        });
        fileInput = promptArtifacts.fileInput;
        contextData = promptArtifacts.contextData;
        previousSemantic = promptArtifacts.previousSemantic;
        ruleData = promptArtifacts.ruleData;
        symbolEdges = resolved.symbolEdges;
        if (ctx.state.telemetry.diagnostics.mode !== 'off') {
          pushSummarizeDiagnostics(fullTaskContext, {
            filePath: relativeFilePath,
            prompt: promptArtifacts.diagnostics,
            context: resolved.diagnostics,
          });
        }
      } else if (fileKind === 'config') {
        const maxLines = ctx.promptTier === 'lite' ? 40 : 100;
        fileInput = content.split('\n').slice(0, maxLines).join('\n');
      } else {
        const maxLines = ctx.promptTier === 'lite' ? 60 : 200;
        fileInput = content.split('\n').slice(0, maxLines).join('\n');
      }
    } catch (e) {
      ctx.runtimeIO.warn(`[Summarization] Context extraction failed for ${relativeFilePath}`);
    }

    const rawSummary = await ctx.llmClient!.generateSummary(
      relativeFilePath,
      fileInput,
      contextData,
      ruleData,
      gitIntent || undefined,
      ctx.targetLocales,
      branch,
      status,
      previousSemantic,
      ctx.promptTier,
      ctx.validatePolicy,
      fileKind,
      'summarize',
    );

    addTaskUsage(fullTaskContext, rawSummary.usage);

    if (
      ctx.writeAtlasDocs &&
      ctx.targetLocales.length > 0 &&
      !hasAllRequestedMarkdown(rawSummary.markdown, ctx.targetLocales)
    ) {
      throw new Error(
        `LLM response did not include markdown blocks for requested locales: ${ctx.targetLocales.join(', ')}`,
      );
    }

    const semantic = sanitizeSemantic(rawSummary.json.semantic);
    const structuralHash = resolvedSkeleton
      ? calculateStructuralFootprint(resolvedSkeleton)
      : undefined;
    const semanticHash = calculateSemanticFootprint(semantic);

    const spineUnit: SpineUnit = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      identity: {
        filePath: relativeFilePath,
        contentHash: hash,
        skeletonHash: structuralHash,
        semanticHash,
        language: LangRegistry.getSourceLanguage(relativeFilePath),
        fileKind,
        scope: path.dirname(relativeFilePath) === '.' ? '' : path.dirname(relativeFilePath),
      },
      semantic,
      skeleton: resolvedSkeleton
        ? buildSpineSkeleton(resolvedSkeleton, relativeFilePath)
        : rawSummary.json.skeleton || {
            imports: [],
            exports: [],
            declaredSymbols: [],
            structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
          },
      graph: {
        dependsOn: rawSummary.json.graph?.dependsOn || [],
        dependedBy: rawSummary.json.graph?.dependedBy || [],
        reverseIndexComplete: Boolean(rawSummary.json.graph?.reverseIndexComplete),
        symbolEdges,
      },
      provenance: {
        indexedAt: new Date().toISOString(),
        generatorVersion: GENERATOR_VERSION,
        pipelineStages: ['ast', 'llm'],
      },
    };

    if (spineUnit.semantic.driftDetected) {
      addTaskDriftWarning(fullTaskContext, {
        filePath: relativeFilePath,
        reason: spineUnit.semantic.driftReason || 'Semantic responsibilities changed materially.',
      });
    }

    persistSummarizationOutputs(
      ctx,
      fullTaskContext,
      pendingCommits,
      relativeFilePath,
      hash,
      fileKind,
      spineUnit,
      rawSummary.markdown,
    );
    return shouldPropagateDirChange(previousUnit, spineUnit);
  }
}

async function tryRecoverFromLocalIndex(
  ctx: SummarizationTaskContext,
  fullTaskContext: TaskContext,
  pendingCommits: Map<string, { hash: string; kind: FileKind; spineUnit: SpineUnit }>,
  relativeFilePath: string,
  hash: string,
  fileKind: FileKind,
): Promise<boolean> {
  const existingIndex = ctx.outputManager.readIndex(relativeFilePath);
  if (!existingIndex) {
    return false;
  }

  if (existingIndex.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return false;
  }
  if (!existingIndex.identity || existingIndex.identity.contentHash !== hash) {
    return false;
  }

  ctx.runtimeIO.info(`[Task: Summarization] Recovered from local index: ${relativeFilePath}...`);

  // Note: We don't need to overwrite atlas markdown docs again if we are recovering.
  const markdown: Record<string, string> | undefined = undefined;

  persistSummarizationOutputs(
    ctx,
    fullTaskContext,
    pendingCommits,
    relativeFilePath,
    hash,
    fileKind,
    existingIndex,
    markdown,
  );

  return true;
}
