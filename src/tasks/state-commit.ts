import { SpineTask, TaskContext } from '../core/task.js';
import type { CommitStageOutput, SummarizationStageOutput } from '../core/task-types.js';

/**
 * StateCommitTask — Unified commitment of synchronized state to SQLite.
 *
 * This task is responsible for committing file hashes and metadata to the database
 * AFTER AST extraction and LLM summarization are complete.
 * This prevents write competition and ensures that partial failures during
 * summarization don't leave the database in a "synced" state for failed files.
 */
export class StateCommitTask extends SpineTask<SummarizationStageOutput, CommitStageOutput> {
  name = 'State Commitment';
  checkpointId = 'state-commit';

  async execute(ctx: TaskContext, input: SummarizationStageOutput): Promise<CommitStageOutput> {
    const pending = input.artifacts.pendingCommits;
    if (pending.size === 0) {
      ctx.runtimeIO.info('[Task: StateCommit] No pending commits.');
      return {
        selection: input.selection,
        committedFiles: [],
        committedCount: 0,
      };
    }

    ctx.runtimeIO.info(
      `[Task: StateCommit] Committing state for ${pending.size} processed files...`,
    );
    const committedFiles = Array.from(pending.keys());

    ctx.manifest.commitBatch(
      Array.from(pending.entries(), ([filePath, info]) => {
        const oldDocs = info.spineUnit.semantic.driftDetected
          ? ctx.manifest.getFileDocs(filePath)
          : undefined;

        return {
          filePath,
          hash: info.hash,
          kind: info.kind,
          spineUnit: info.spineUnit,
          locales: ctx.targetLocales,
          driftInfo: oldDocs?.semantic
            ? {
                previousRole: oldDocs.semantic.role,
                previousResponsibilities: oldDocs.semantic.responsibilities,
                driftReason: info.spineUnit.semantic.driftReason ?? 'Unspecified',
              }
            : undefined,
        };
      }),
    );

    ctx.runtimeIO.info(
      `[Task: StateCommit] Successfully committed ${pending.size} units to cache.db.`,
    );
    for (const filePath of committedFiles) {
      ctx.executionCheckpoint?.markItemCompleted(this.checkpointId, filePath);
    }

    return {
      selection: input.selection,
      committedFiles,
      committedCount: committedFiles.length,
    };
  }
}
