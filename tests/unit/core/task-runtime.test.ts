import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  addTaskUsage,
  createTaskArtifactsState,
  createTaskState,
  incrementTaskFailed,
  incrementTaskSkipped,
  markTaskProcessedFile,
  queueTaskCommit,
  recordTaskStageMetric,
  resetTaskState,
} from '../../../src/core/task-state.js';
import { TaskRunner } from '../../../src/core/pipeline.js';
import { SpineTask, TaskContext } from '../../../src/core/task.js';
import type { ScanStageOutput } from '../../../src/core/task-types.js';
import type { RuntimeIO } from '../../../src/infra/runtime-io.js';
import { createTaskContext } from '../../../src/services/task-runtime.js';

function createRuntimeIOStub(): RuntimeIO {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    confirm: vi.fn(async () => true),
  };
}

function createMockLLMClient() {
  return {
    generateFolderSummary: vi.fn(async () => ({
      json: { role: 'folder', responsibility: 'summary' },
      markdown: { English: '# folder' },
      usage: undefined,
    })),
  } as any;
}

describe('task runtime state management', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-task-runtime-'));
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    delete process.env.SPINE_DIAGNOSTICS_MODE;
  });

  afterEach(() => {
    delete process.env.SPINE_DIAGNOSTICS_MODE;
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('resets transient task state comprehensively between fix revalidation passes', () => {
    const context = {
      runtimeCache: createTaskArtifactsState(),
      state: createTaskState('off'),
    } as TaskContext;

    context.state.telemetry.stats.processed = 3;
    context.runtimeCache.skeletons.set('src/old.ts', {} as any);
    context.runtimeCache.unsupportedFiles.set('src/skip.ts', 'unsupported');
    context.runtimeCache.pendingCommits.set('src/old.ts', {
      hash: 'hash',
      kind: 'source',
      spineUnit: {} as any,
    });
    context.state.telemetry.driftWarnings.push({ filePath: 'src/old.ts', reason: 'drift' });
    context.state.telemetry.diagnostics.summarize.push({} as any);
    context.state.telemetry.diagnostics.validate.push({} as any);

    resetTaskState(context);

    expect(context.state.telemetry.stats).toEqual({
      processed: 0,
      skipped: 0,
      failed: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    });
    expect(context.state.telemetry.stageMetrics).toEqual({});
    expect(context.runtimeCache.skeletons.size).toBe(0);
    expect(context.runtimeCache.unsupportedFiles.size).toBe(0);
    expect(context.runtimeCache.pendingCommits.size).toBe(0);
    expect(context.state.telemetry.driftWarnings).toEqual([]);
    expect(context.state.telemetry.diagnostics.summarize).toEqual([]);
    expect(context.state.telemetry.diagnostics.validate).toEqual([]);
    expect(context.state.telemetry.diagnostics.mode).toBe('off');
  });

  it('provides a runtime I/O interface that can be injected into task execution', async () => {
    const runtimeIO = createRuntimeIOStub();

    await runtimeIO.confirm('Apply fix?');
    runtimeIO.info('info');
    runtimeIO.warn('warn');
    runtimeIO.error('error');

    expect(runtimeIO.confirm).toHaveBeenCalledWith('Apply fix?');
    expect(runtimeIO.info).toHaveBeenCalledWith('info');
    expect(runtimeIO.warn).toHaveBeenCalledWith('warn');
    expect(runtimeIO.error).toHaveBeenCalledWith('error');
  });

  it('updates task state through helpers with the expected semantics', () => {
    const context = {
      runtimeCache: createTaskArtifactsState(),
      state: createTaskState('off'),
    } as TaskContext;

    markTaskProcessedFile(context, 'src/demo.ts');
    incrementTaskSkipped(context);
    incrementTaskFailed(context);
    addTaskUsage(context, { inputTokens: 1, outputTokens: 2, totalTokens: 3 });
    queueTaskCommit(context, 'src/demo.ts', { hash: 'h', kind: 'source', spineUnit: {} as any });
    recordTaskStageMetric(context, 'ast-extraction', {
      durationMs: 12,
      heapUsedBytes: 1024,
      rssBytes: 2048,
    });

    expect(context.state.telemetry.stats).toEqual({
      processed: 1,
      skipped: 1,
      failed: 1,
      inputTokens: 1,
      outputTokens: 2,
      totalTokens: 3,
    });
    expect(context.state.telemetry.stageMetrics).toEqual({
      'ast-extraction': {
        runs: 1,
        totalDurationMs: 12,
        lastDurationMs: 12,
        maxDurationMs: 12,
        lastHeapUsedBytes: 1024,
        maxHeapUsedBytes: 1024,
        lastRssBytes: 2048,
        maxRssBytes: 2048,
      },
    });
    expect(context.runtimeCache.pendingCommits.has('src/demo.ts')).toBe(true);
  });

  it('passes explicit stage outputs between tasks without reading shared state implicitly', async () => {
    class ScanStubTask extends SpineTask<void, ScanStageOutput> {
      name = 'Scan Stub';

      async execute(ctx: TaskContext, _input: void): Promise<ScanStageOutput> {
        ctx.state.telemetry.stats.processed = 99;
        return {
          selection: {
            filteredFiles: ['right.ts'],
            affectedDirs: new Set(['src']),
          },
        };
      }
    }

    class ConsumeStubTask extends SpineTask<ScanStageOutput, string[]> {
      name = 'Consume Stub';

      async execute(_ctx: TaskContext, input: ScanStageOutput): Promise<string[]> {
        return input.selection.filteredFiles;
      }
    }

    const context = {
      runtimeIO: createRuntimeIOStub(),
      runtimeCache: createTaskArtifactsState(),
      state: createTaskState('off'),
    } as TaskContext;

    const runner = new TaskRunner(context);
    const scanStage = await runner.runVoid(new ScanStubTask());
    const consumed = await runner.run(new ConsumeStubTask(), scanStage);

    expect(consumed).toEqual(['right.ts']);
    expect(context.state.telemetry.stats.processed).toBe(99);
  });

  it('creates a strict validation context with the expected runtime defaults', () => {
    process.env.SPINE_DIAGNOSTICS_MODE = 'diagnostic';
    const runtimeIO = createRuntimeIOStub();

    const prepared = createTaskContext({
      rootDir: testDir,
      llmClient: createMockLLMClient(),
      summarizeConcurrency: 9,
      summarizeRetryLimit: 4,
      enabledViews: ['risk-hotspots'],
      invalidEnabledViews: ['unknown-view'],
      runtimeIO,
      forcedSyncFiles: ['src/a.ts', 'src/a.ts', 'src/b.ts'],
      isFullSync: true,
      hookMode: true,
    });

    expect(prepared.context.summarizeConcurrency).toBe(9);
    expect(prepared.context.summarizeRetryLimit).toBe(4);
    expect(prepared.context.enabledViews).toEqual(['risk-hotspots']);
    expect(prepared.context.invalidEnabledViews).toEqual(['unknown-view']);
    expect(prepared.context.isFullSync).toBe(true);
    expect(prepared.context.hookMode).toBe(true);
    expect(prepared.context.forcedSyncFiles).toEqual(new Set(['src/a.ts', 'src/b.ts']));
    expect(prepared.context.runtimeIO).toBe(runtimeIO);
    expect(prepared.context.aggregator).toBeDefined();
    expect(prepared.lockManager).toBeDefined();
    expect(prepared.context.state.telemetry.diagnostics.mode).toBe('diagnostic');
  });

  it('supports no-llm and no-aggregator contexts with summarize defaults', () => {
    const prepared = createTaskContext({
      rootDir: testDir,
      includeAggregator: false,
      isFullSync: false,
      hookMode: false,
    });

    expect(prepared.context.aggregator).toBeUndefined();
    expect(prepared.context.llmClient).toBeUndefined();
    expect(prepared.context.summarizeConcurrency).toBe(3);
    expect(prepared.context.summarizeRetryLimit).toBe(2);
    expect(prepared.context.enabledViews).toEqual([]);
    expect(prepared.context.invalidEnabledViews).toEqual([]);
    expect(prepared.context.forcedSyncFiles).toEqual(new Set());
    expect(prepared.context.state.telemetry.diagnostics.mode).toBe('off');
  });
});
