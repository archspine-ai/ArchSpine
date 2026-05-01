import * as path from 'path';
import pLimit from 'p-limit';
import { SpineTask, TaskContext } from '../core/task.js';
import type { CommitStageOutput } from '../core/task-types.js';
import { addTaskUsage, incrementTaskFailed } from '../core/task-state.js';

export class AggregationTask extends SpineTask<CommitStageOutput, void> {
  name = 'Hierarchical Content Aggregation';
  checkpointId = 'aggregation';

  private collectRecoverableDirs(ctx: TaskContext): string[] {
    const allDirs = new Set<string>();
    for (const file of ctx.scanner.getAllTrackedFiles()) {
      let dir = path.dirname(file);
      while (dir && dir !== '.' && dir !== '/') {
        allDirs.add(dir);
        dir = path.dirname(dir);
      }
    }

    return Array.from(allDirs).filter(
      (dir) => ctx.aggregator?.needsDirectoryAggregation(dir) === true,
    );
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

    let dirsToAggregate: string[];

    if (ctx.isFullSync) {
      dirsToAggregate = Array.from(
        new Set(ctx.scanner.getAllTrackedFiles().map((f: string) => path.dirname(f))),
      );
      const allDirs = new Set<string>();
      for (let dir of dirsToAggregate) {
        while (dir && dir !== '.' && dir !== '/') {
          allDirs.add(dir);
          dir = path.dirname(dir);
        }
      }
      dirsToAggregate = Array.from(allDirs);
    } else {
      const allDirs = new Set<string>();
      for (let dir of input.selection.affectedDirs) {
        while (dir && dir !== '.' && dir !== '/') {
          allDirs.add(dir);
          dir = path.dirname(dir);
        }
      }
      for (const dir of resumableDirs) {
        allDirs.add(dir);
      }
      dirsToAggregate = Array.from(allDirs);
    }

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

    if (
      input.committedCount > 0 ||
      input.selection.affectedDirs.size > 0 ||
      resumableDirs.length > 0 ||
      shouldRecoverProject
    ) {
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
