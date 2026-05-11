import { afterEach, describe, expect, it, vi } from 'vitest';
import { AggregationTask } from '../../../src/tasks/aggregate.js';
import type { CommitStageOutput } from '../../../src/core/task-types.js';

function mockTaskContext(overrides?: Record<string, unknown>) {
  return {
    rootDir: '/fake',
    aggregator: {
      needsDirectoryAggregation: vi.fn().mockReturnValue(true),
      needsProjectAggregation: vi.fn().mockReturnValue(false),
      aggregateDirectory: vi
        .fn()
        .mockResolvedValue({ inputTokens: 5, outputTokens: 10, totalTokens: 15 }),
      aggregateProject: vi.fn().mockResolvedValue(undefined),
    },
    executionCheckpoint: {
      load: vi.fn().mockReturnValue(null),
      markItemStarted: vi.fn(),
      markItemCompleted: vi.fn(),
      markItemFailed: vi.fn(),
    },
    runtimeIO: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
    state: {
      telemetry: {
        diagnostics: {},
        stats: { processed: 0, skipped: 0, failed: 0 },
        summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
      },
    },
    ...overrides,
  };
}

function makeCommitStageOutput(overrides?: Partial<CommitStageOutput>): CommitStageOutput {
  return {
    selection: { filteredFiles: [], affectedDirs: new Set() },
    committedFiles: [],
    committedCount: 0,
    ...overrides,
  };
}

describe('AggregationTask', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Main Path: throws when aggregator is not in context', async () => {
    const task = new AggregationTask();
    const ctx = mockTaskContext({ aggregator: undefined });

    await expect(task.execute(ctx as any, makeCommitStageOutput())).rejects.toThrow(
      'AggregationTask requires ctx.aggregator.',
    );
  });

  it('Main Path: returns early when nothing to aggregate', async () => {
    const task = new AggregationTask();
    const ctx = mockTaskContext({
      aggregator: {
        needsDirectoryAggregation: vi.fn().mockReturnValue(false),
        needsProjectAggregation: vi.fn().mockReturnValue(false),
        aggregateDirectory: vi.fn(),
        aggregateProject: vi.fn(),
      },
    });

    await task.execute(ctx as any, makeCommitStageOutput());

    expect(ctx.aggregator.aggregateDirectory).not.toHaveBeenCalled();
    expect(ctx.aggregator.aggregateProject).not.toHaveBeenCalled();
  });

  it('Main Path: aggregates committed files with bubble-up', async () => {
    const task = new AggregationTask();
    const ctx = mockTaskContext();

    await task.execute(
      ctx as any,
      makeCommitStageOutput({
        committedFiles: ['src/api/handler.ts', 'src/services/auth.ts'],
        committedCount: 2,
      }),
    );

    expect(ctx.aggregator.needsDirectoryAggregation).toHaveBeenCalled();
    expect(ctx.aggregator.aggregateDirectory).toHaveBeenCalled();
  });

  it('Main Path: bubbles up from affectedDirs', async () => {
    const task = new AggregationTask();
    const ctx = mockTaskContext();

    await task.execute(
      ctx as any,
      makeCommitStageOutput({
        selection: { filteredFiles: [], affectedDirs: new Set(['src/infra']) },
      }),
    );

    expect(ctx.aggregator.needsDirectoryAggregation).toHaveBeenCalled();
  });

  it('Main Path: runs project aggregation when needed', async () => {
    const task = new AggregationTask();
    const ctx = mockTaskContext({
      aggregator: {
        needsDirectoryAggregation: vi.fn().mockReturnValue(false),
        needsProjectAggregation: vi.fn().mockReturnValue(true),
        aggregateDirectory: vi.fn(),
        aggregateProject: vi
          .fn()
          .mockResolvedValue({ inputTokens: 10, outputTokens: 20, totalTokens: 30 }),
      },
    });

    await task.execute(ctx as any, makeCommitStageOutput());

    expect(ctx.aggregator.aggregateProject).toHaveBeenCalled();
  });

  it('Boundary: handles directory aggregation failure gracefully', async () => {
    const task = new AggregationTask();
    const ctx = mockTaskContext({
      aggregator: {
        needsDirectoryAggregation: vi.fn().mockReturnValue(true),
        needsProjectAggregation: vi.fn().mockReturnValue(false),
        aggregateDirectory: vi.fn().mockRejectedValue(new Error('Index read failed')),
        aggregateProject: vi.fn(),
      },
    });

    await task.execute(
      ctx as any,
      makeCommitStageOutput({
        committedFiles: ['src/api/handler.ts'],
        committedCount: 1,
      }),
    );

    expect(ctx.runtimeIO.warn).toHaveBeenCalled();
    expect(ctx.executionCheckpoint.markItemFailed).toHaveBeenCalled();
  });

  it('Boundary: handles project aggregation failure gracefully', async () => {
    const task = new AggregationTask();
    const ctx = mockTaskContext({
      aggregator: {
        needsDirectoryAggregation: vi.fn().mockReturnValue(false),
        needsProjectAggregation: vi.fn().mockReturnValue(true),
        aggregateDirectory: vi.fn(),
        aggregateProject: vi.fn().mockRejectedValue(new Error('Project aggregation failed')),
      },
    });

    await task.execute(ctx as any, makeCommitStageOutput());

    expect(ctx.runtimeIO.warn).toHaveBeenCalled();
    expect(ctx.executionCheckpoint.markItemFailed).toHaveBeenCalledWith(
      'aggregation',
      '__project__',
      expect.any(Error),
    );
  });
});
