import * as path from 'path';
import pLimit from 'p-limit';
import { SpineTask, TaskContext } from '../core/task.js';
import type { CommitStageOutput } from '../core/task-types.js';
import { addTaskUsage, incrementTaskFailed } from '../core/task-state.js';
import { getStageItemsByStatus } from '../infra/execution-checkpoint.js';

export class AggregationTask extends SpineTask<CommitStageOutput, void> {
  name = 'Hierarchical Content Aggregation';
  checkpointId = 'aggregation';

  /**
   * Collect directories whose aggregation was interrupted in a prior run.
   *
   * Instead of scanning every tracked file and bubbling up through the entire
   * directory tree (O(files × depth) stat calls), we query the execution
   * checkpoint for items that were marked as started but never completed.
   * If no prior checkpoint exists or all items finished, we return an empty
   * array — the bubble-up from committedFiles and affectedDirs already covers
   * directories with genuine semantic changes.
   */
  private collectRecoverableDirs(ctx: TaskContext): string[] {
    const state = ctx.executionCheckpoint?.load();
    if (!state) {
      return [];
    }

    const incompleteDirs = getStageItemsByStatus(state, this.checkpointId, ['running']);
    if (incompleteDirs.length === 0) {
      return [];
    }

    // Only recover dirs whose children have genuinely changed since the
    // interrupted run — avoids re-aggregating dirs that were already done.
    return incompleteDirs.filter((dir) => ctx.aggregator?.needsDirectoryAggregation(dir) === true);
  }

  async execute(ctx: TaskContext, input: CommitStageOutput): Promise<void> {
    if (!ctx.aggregator) {
      throw new Error('AggregationTask requires ctx.aggregator.');
    }
    const aggregator = ctx.aggregator;

    const resumableDirs = this.collectRecoverableDirs(ctx);
    const shouldRecoverProject = aggregator.needsProjectAggregation();

    if (
      input.committedCount === 0 &&
      input.selection.affectedDirs.size === 0 &&
      resumableDirs.length === 0 &&
      !shouldRecoverProject
    ) {
      return;
    }

    const allDirs = new Set<string>();
    for (const dir of resumableDirs) {
      allDirs.add(dir);
    }

    // Bubble up from committed files: only include dirs that genuinely need re-aggregation.
    for (const file of input.committedFiles) {
      let dir = path.dirname(file);
      while (dir && dir !== '.' && dir !== '/') {
        if (aggregator.needsDirectoryAggregation(dir)) {
          allDirs.add(dir);
        }
        dir = path.dirname(dir);
      }
    }

    // Also bubble up from selection.affectedDirs (e.g. deletions that had no commit).
    for (let dir of input.selection.affectedDirs) {
      while (dir && dir !== '.' && dir !== '/') {
        if (aggregator.needsDirectoryAggregation(dir)) {
          allDirs.add(dir);
        }
        dir = path.dirname(dir);
      }
    }

    const dirsToAggregate = Array.from(allDirs);

    const getDepth = (dir: string) => dir.split(path.sep).filter(Boolean).length;

    const depthGroups = new Map<number, string[]>();
    for (const dir of dirsToAggregate) {
      const depth = getDepth(dir);
      if (!depthGroups.has(depth)) {
        depthGroups.set(depth, []);
      }
      depthGroups.get(depth)!.push(dir);
    }

    const sortedDepths = Array.from(depthGroups.keys()).sort((a, b) => b - a);

    const aggLimit = pLimit(20);

    for (const depth of sortedDepths) {
      const dirsAtDepth = depthGroups.get(depth)!;
      const promises = dirsAtDepth.map((dir) =>
        aggLimit(async () => {
          try {
            ctx.executionCheckpoint?.markItemStarted(this.checkpointId, dir);
            const usage = await aggregator.aggregateDirectory(dir);
            if (usage) {
              addTaskUsage(ctx, usage);
            }
            ctx.executionCheckpoint?.markItemCompleted(this.checkpointId, dir);
          } catch (err) {
            ctx.runtimeIO.warn(
              `[Task: Aggregation] Missing child or failure at ${dir}:`,
              err instanceof Error ? err.message : String(err),
            );
            ctx.executionCheckpoint?.markItemFailed(this.checkpointId, dir, err);
            incrementTaskFailed(ctx);
          }
        }),
      );
      await Promise.all(promises);
    }

    if (shouldRecoverProject) {
      try {
        ctx.executionCheckpoint?.markItemStarted(this.checkpointId, '__project__');
        const projUsage = await aggregator.aggregateProject();
        if (projUsage) {
          addTaskUsage(ctx, projUsage);
        }
        ctx.executionCheckpoint?.markItemCompleted(this.checkpointId, '__project__');
      } catch (err) {
        ctx.runtimeIO.warn(
          `[Task: Aggregation] Project aggregation failed:`,
          err instanceof Error ? err.message : String(err),
        );
        ctx.executionCheckpoint?.markItemFailed(this.checkpointId, '__project__', err);
        incrementTaskFailed(ctx);
      }
    }
  }
}
