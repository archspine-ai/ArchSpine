import { SpineTask, TaskContext } from './task.js';
import { recordTaskStageMetric } from './task-state.js';

export class TaskRunner {
  private context: TaskContext;

  constructor(context: TaskContext) {
    this.context = context;
  }

  public async run<I, O>(task: SpineTask<I, O>, input: I): Promise<O> {
    const startTime = Date.now();
    const checkpointId = task.checkpointId || task.name;
    this.context.executionCheckpoint?.markStageStarted(checkpointId);
    this.context.runtimeIO.info(`[Task: ${task.name}] Starting...`);
    try {
      const result = await task.execute(this.context, input);
      const duration = Date.now() - startTime;
      const memory = process.memoryUsage();
      recordTaskStageMetric(this.context, checkpointId, {
        durationMs: duration,
        heapUsedBytes: memory.heapUsed,
        rssBytes: memory.rss,
      });
      this.context.executionCheckpoint?.markStageCompleted(checkpointId);
      this.context.runtimeIO.info(`[Task: ${task.name}] Completed successfully in ${duration}ms.`);
      return result;
    } catch (error) {
      this.context.executionCheckpoint?.markStageFailed(checkpointId, error);
      this.context.runtimeIO.error(`[Task: ${task.name}] Failed:`, error);
      throw error;
    }
    // no finally — task.execute owns its own resource lifecycle
  }

  public async runVoid<O>(task: SpineTask<void, O>): Promise<O> {
    return this.run(task, undefined);
  }
}
