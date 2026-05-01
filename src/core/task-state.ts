import type { FileSkeleton } from '../ast/extractor.js';
import type { UsageInfo } from '../infra/llm.js';
import type {
  TaskStageMetric,
  TaskArtifactsState,
  TaskState,
  TaskTelemetryState,
} from './task-types.js';
import type { TaskContext } from './task.js';
import type { FileKind, SpineUnit } from '../types/protocol.js';

export function createTaskArtifactsState(): TaskArtifactsState {
  return {
    skeletons: new Map(),
    unsupportedFiles: new Map(),
    pendingCommits: new Map(),
  };
}

export function createTaskTelemetryState(
  diagnosticsMode: TaskTelemetryState['diagnostics']['mode'],
): TaskTelemetryState {
  return {
    stats: {
      processed: 0,
      skipped: 0,
      failed: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
    stageMetrics: {},
    driftWarnings: [],
    diagnostics: {
      mode: diagnosticsMode,
      summarize: [],
      validate: [],
    },
  };
}

export function createTaskState(
  diagnosticsMode: TaskTelemetryState['diagnostics']['mode'],
): TaskState {
  return {
    telemetry: createTaskTelemetryState(diagnosticsMode),
  };
}

export function resetTaskState(context: TaskContext, overrides: Partial<TaskState> = {}): void {
  const baseState = createTaskState(context.state.telemetry.diagnostics.mode);
  context.runtimeCache = createTaskArtifactsState();
  context.state = {
    ...baseState,
    ...overrides,
    telemetry: {
      ...baseState.telemetry,
      ...overrides.telemetry,
      diagnostics: {
        ...baseState.telemetry.diagnostics,
        ...overrides.telemetry?.diagnostics,
      },
    },
  };
}

export function addTaskUsage(context: TaskContext, usage?: UsageInfo): void {
  if (!usage) {
    return;
  }
  context.state.telemetry.stats.inputTokens += usage.inputTokens;
  context.state.telemetry.stats.outputTokens += usage.outputTokens;
  context.state.telemetry.stats.totalTokens += usage.totalTokens;
}

export function recordTaskStageMetric(
  context: TaskContext,
  stageId: string,
  metric: {
    durationMs: number;
    heapUsedBytes: number;
    rssBytes: number;
  },
): void {
  const previous = context.state.telemetry.stageMetrics[stageId];
  const next: TaskStageMetric = previous
    ? {
        runs: previous.runs + 1,
        totalDurationMs: previous.totalDurationMs + metric.durationMs,
        lastDurationMs: metric.durationMs,
        maxDurationMs: Math.max(previous.maxDurationMs, metric.durationMs),
        lastHeapUsedBytes: metric.heapUsedBytes,
        maxHeapUsedBytes: Math.max(previous.maxHeapUsedBytes, metric.heapUsedBytes),
        lastRssBytes: metric.rssBytes,
        maxRssBytes: Math.max(previous.maxRssBytes, metric.rssBytes),
      }
    : {
        runs: 1,
        totalDurationMs: metric.durationMs,
        lastDurationMs: metric.durationMs,
        maxDurationMs: metric.durationMs,
        lastHeapUsedBytes: metric.heapUsedBytes,
        maxHeapUsedBytes: metric.heapUsedBytes,
        lastRssBytes: metric.rssBytes,
        maxRssBytes: metric.rssBytes,
      };

  context.state.telemetry.stageMetrics[stageId] = next;
}

export function markTaskProcessedFile(context: TaskContext, _filePath: string): void {
  context.state.telemetry.stats.processed++;
}

export function incrementTaskSkipped(context: TaskContext): void {
  context.state.telemetry.stats.skipped++;
}

export function incrementTaskFailed(context: TaskContext): void {
  context.state.telemetry.stats.failed++;
}

export function setUnsupportedTaskFile(
  context: TaskContext,
  filePath: string,
  reason: string,
): void {
  context.runtimeCache.unsupportedFiles.set(filePath, reason);
}

export function hasUnsupportedTaskFile(context: TaskContext, filePath: string): boolean {
  return context.runtimeCache.unsupportedFiles.has(filePath);
}

export function setTaskSkeleton(
  context: TaskContext,
  filePath: string,
  skeleton: FileSkeleton,
): void {
  context.runtimeCache.skeletons.set(filePath, skeleton);
}

export function getTaskSkeleton(context: TaskContext, filePath: string): FileSkeleton | undefined {
  return context.runtimeCache.skeletons.get(filePath);
}

export function queueTaskCommit(
  context: TaskContext,
  filePath: string,
  commit: { hash: string; kind: FileKind; spineUnit: SpineUnit },
): void {
  context.runtimeCache.pendingCommits.set(filePath, commit);
}

export function addTaskDriftWarning(
  context: TaskContext,
  warning: { filePath: string; reason: string },
): void {
  context.state.telemetry.driftWarnings.push(warning);
}

export function pushSummarizeDiagnostics(
  context: TaskContext,
  snapshot: TaskTelemetryState['diagnostics']['summarize'][number],
): void {
  context.state.telemetry.diagnostics.summarize.push(snapshot);
}

export function pushValidateDiagnostics(
  context: TaskContext,
  snapshot: TaskTelemetryState['diagnostics']['validate'][number],
): void {
  context.state.telemetry.diagnostics.validate.push(snapshot);
}
