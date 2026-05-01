import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import { SpineTask, TaskContext } from '../core/task.js';
import type { ExtractionStageOutput, SummarizationStageOutput } from '../core/task-types.js';
import {
  FileKind,
  SpineUnit,
  CURRENT_SCHEMA_VERSION,
  GENERATOR_VERSION,
  SpineSemantic,
} from '../types/protocol.js';
import { LangRegistry } from '../ast/lang-registry.js';
import {
  addTaskUsage,
  incrementTaskFailed,
  incrementTaskSkipped,
  markTaskProcessedFile,
  queueTaskCommit,
} from '../core/task-state.js';

/**
 * Lite version of the Summarization task.
 * Designed to minimize token usage by stripping depth.
 */
export class LiteSummarizationTask extends SpineTask<
  ExtractionStageOutput,
  SummarizationStageOutput
> {
  name = 'LLM Lite Summarization (Low Precision)';

  async execute(ctx: TaskContext, input: ExtractionStageOutput): Promise<SummarizationStageOutput> {
    if (!ctx.llmClient) {
      ctx.runtimeIO.warn('[Task: LiteSummarize] Skipping because LLM Client is not configured.');
      return {
        selection: input.selection,
        artifacts: {
          ...input.artifacts,
          pendingCommits: new Map(),
        },
      };
    }

    // lower concurrency to avoid TPM burst
    const limit = pLimit(2);
    const pendingCommits = new Map<
      string,
      { hash: string; kind: FileKind; spineUnit: SpineUnit }
    >();
    const affectedDirs = new Set(input.selection.affectedDirs);
    ctx.runtimeCache.pendingCommits = pendingCommits;
    const syncPromises = input.selection.filteredFiles.map((file) =>
      limit(async () => {
        try {
          if (input.artifacts.unsupportedFiles.has(file)) {
            incrementTaskSkipped(ctx);
            return;
          }

          const filePath = path.join(ctx.rootDir, file);
          const hash = ctx.manifest.calculateHash(filePath);

          const skeletonExtractedThisTurn = input.artifacts.skeletons.has(file);
          if (ctx.isFullSync || skeletonExtractedThisTurn || ctx.manifest.needsUpdate(file, hash)) {
            ctx.runtimeIO.info(`[Lite Mode] Processing ${file}...`);
            await this.summarizeFile(ctx, input, pendingCommits, file, filePath, hash);
            markTaskProcessedFile(ctx, file);
            affectedDirs.add(path.dirname(file));
          } else {
            incrementTaskSkipped(ctx);
          }
        } catch (error) {
          ctx.runtimeIO.error(`[Lite Mode] Failed to sync ${file}:`, error);
          incrementTaskFailed(ctx);
        }
      }),
    );
    await Promise.all(syncPromises);

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

  private async summarizeFile(
    ctx: TaskContext,
    input: ExtractionStageOutput,
    pendingCommits: Map<string, { hash: string; kind: FileKind; spineUnit: SpineUnit }>,
    relativeFilePath: string,
    fullPath: string,
    hash: string,
  ): Promise<void> {
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Determine fileKind for Lite Mode
    const fileKind: FileKind = LangRegistry.isSourceFile(relativeFilePath)
      ? 'source'
      : relativeFilePath.endsWith('.json')
        ? 'config'
        : 'document';

    let liteInput = '';
    if (fileKind === 'source') {
      const skeleton = input.artifacts.skeletons.get(relativeFilePath);
      const header = content.split('\n').slice(0, 20).join('\n');
      const exports = skeleton ? skeleton.exports.map((e) => e.name).join(', ') : 'unknown';
      liteInput = `File Header:\n${header}\n\nExported Symbols: ${exports}`;
    } else {
      // For docs/configs, take first 50 lines for Lite Mode
      liteInput = content.split('\n').slice(0, 50).join('\n');
    }

    const rawSummary = await ctx.llmClient!.generateSummary(
      relativeFilePath,
      liteInput,
      '', // no contextData
      '', // no ruleData
      undefined,
      ctx.targetLocales,
      '', // no branch
      '', // no status
      undefined, // no previousSemantic
      'lite',
      undefined,
      fileKind,
    );

    addTaskUsage(ctx, rawSummary.usage);

    const spineUnit: SpineUnit = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      identity: {
        filePath: relativeFilePath,
        contentHash: hash,
        language: LangRegistry.getSourceLanguage(relativeFilePath),
        fileKind,
        scope: path.dirname(relativeFilePath) === '.' ? '' : path.dirname(relativeFilePath),
      },
      semantic: this.sanitizeLiteSemantic(rawSummary.json.semantic),
      skeleton: {
        imports: [],
        exports: [],
        declaredSymbols: [],
        structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
      },
      graph: { dependsOn: [], dependedBy: [], reverseIndexComplete: false, symbolEdges: [] },
      provenance: {
        indexedAt: new Date().toISOString(),
        generatorVersion: GENERATOR_VERSION,
        pipelineStages: ['lite-ast', 'lite-llm'],
      },
    };

    ctx.outputManager.saveIndex(relativeFilePath, spineUnit);
    for (const locale of ctx.targetLocales) {
      const md =
        rawSummary.markdown && rawSummary.markdown[locale]
          ? rawSummary.markdown[locale]
          : 'Partial summary generated in Lite Mode.';
      ctx.outputManager.saveDocs(relativeFilePath, locale, md);
    }
    pendingCommits.set(relativeFilePath, { hash, kind: fileKind, spineUnit });
    queueTaskCommit(ctx, relativeFilePath, { hash, kind: fileKind, spineUnit });
  }

  private sanitizeLiteSemantic(raw: Partial<SpineSemantic>): SpineSemantic {
    return {
      role: raw?.role ?? 'Summarized in Lite Mode.',
      responsibilities: Array.isArray(raw?.responsibilities)
        ? raw.responsibilities
        : ['Reduced precision analysis'],
      outOfScope: [],
      invariants: [],
      changeIntent: { architecturalIntent: null, recentChangeIntent: null },
      publicSurface: Array.isArray(raw?.publicSurface) ? raw.publicSurface : [],
      driftDetected: false,
      driftReason: null,
    };
  }
}
