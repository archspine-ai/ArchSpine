import * as fs from 'fs';
import * as path from 'path';
import { SpineTask, TaskContext } from '../core/task.js';
import type { ExtractionStageOutput, ScanStageOutput } from '../core/task-types.js';
import { LangRegistry } from '../ast/lang-registry.js';
import { resolveLanguage } from '../ast/lang-discovery.js';
import { setTaskSkeleton, setUnsupportedTaskFile } from '../core/task-state.js';

export class ASTExtractionTask extends SpineTask<ScanStageOutput, ExtractionStageOutput> {
  name = 'AST Extraction & Symbol Registration';
  checkpointId = 'ast-extraction';

  async execute(ctx: TaskContext, input: ScanStageOutput): Promise<ExtractionStageOutput> {
    const skeletons = new Map();
    const unsupportedFiles = new Map<string, string>();
    ctx.runtimeCache.skeletons = skeletons;
    ctx.runtimeCache.unsupportedFiles = unsupportedFiles;

    for (const file of input.selection.filteredFiles) {
      const filePath = path.join(ctx.rootDir, file);
      if (!fs.existsSync(filePath)) {
        ctx.runtimeIO.warn(`[Task: AST] Skipping missing file: ${file}`);
        ctx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, { reason: 'missing' });
        continue;
      }

      if (LangRegistry.isSourceFile(file)) {
        const resolved = await resolveLanguage(file);
        if (!resolved.supported) {
          setUnsupportedTaskFile(ctx, file, resolved.reason);
          LangRegistry.announceUnavailableLanguage(file, resolved.reason);
          ctx.manifest.removeFileState(file);
          ctx.outputManager.deleteFile(file, ctx.targetLocales);
          ctx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, {
            reason: resolved.reason,
          });
          continue;
        }
      }

      const hash = ctx.manifest.calculateHash(filePath);

      if (ctx.isFullSync || ctx.forcedSyncFiles.has(file) || ctx.manifest.needsUpdate(file, hash)) {
        if (LangRegistry.isSourceFile(file)) {
          try {
            ctx.executionCheckpoint?.markItemStarted(this.checkpointId, file);
            if (!fs.existsSync(filePath)) {
              ctx.runtimeIO.warn(`[Task: AST] File disappeared before read: ${file}`);
              ctx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, {
                reason: 'disappeared-before-read',
              });
              continue;
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            const skeleton = await ctx.extractor.extract(content, file);
            setTaskSkeleton(ctx, file, skeleton);

            ctx.manifest.ensureFileRecord(file, 'source');
            ctx.manifest.clearFileExports(file);
            ctx.manifest.registerExports(
              file,
              skeleton.exports.map((e: { name: string }) => e.name),
            );
            ctx.executionCheckpoint?.markItemCompleted(this.checkpointId, file);
          } catch (e) {
            ctx.runtimeIO.error(`[Task: AST] Failed to extract from ${file}:`, e);
            ctx.executionCheckpoint?.markItemFailed(this.checkpointId, file, e);
          }
        }
      } else {
        ctx.executionCheckpoint?.markItemSkipped(this.checkpointId, file, { reason: 'up-to-date' });
      }
    }

    if (ctx.runtimeCache.unsupportedFiles.size > 0) {
      ctx.runtimeIO.warn(
        `[Task: AST] Skipped ${ctx.runtimeCache.unsupportedFiles.size} source file(s) due to unavailable language support.`,
      );
    }

    return {
      selection: input.selection,
      artifacts: {
        skeletons,
        unsupportedFiles,
      },
    };
  }
}
