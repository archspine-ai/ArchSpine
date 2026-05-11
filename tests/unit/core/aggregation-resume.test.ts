import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Aggregator } from '../../../src/engines/aggregator.js';
import { AggregationTask } from '../../../src/tasks/aggregate.js';
import { createTaskTelemetryState } from '../../../src/core/task-state.js';

describe('aggregation resume support', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('detects folder aggregation work when folder.json is missing', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-agg-missing-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, '.spine', 'index', 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, '.spine', 'index', 'src', 'demo.ts.json'),
      JSON.stringify({
        identity: { filePath: 'src/demo.ts', fileKind: 'source' },
        semantic: { role: 'Demo', responsibilities: [] },
      }),
    );

    const aggregator = new Aggregator(rootDir, {} as never, ['English']);

    expect(aggregator.needsDirectoryAggregation('src')).toBe(true);
  });

  it('detects stale project aggregation when folder outputs are newer than project.json', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-agg-project-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, '.spine', 'index', 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, '.spine', 'index', 'src', 'folder.json'),
      JSON.stringify({ directory: 'src', role: 'Source', responsibility: 'Code', children: [] }),
    );
    fs.writeFileSync(
      path.join(rootDir, '.spine', 'index', 'project.json'),
      JSON.stringify({ projectName: 'demo', modules: [] }),
    );

    const projectJsonPath = path.join(rootDir, '.spine', 'index', 'project.json');
    const folderJsonPath = path.join(rootDir, '.spine', 'index', 'src', 'folder.json');
    const earlier = new Date(Date.now() - 5000);
    const later = new Date();
    fs.utimesSync(projectJsonPath, earlier, earlier);
    fs.utimesSync(folderJsonPath, later, later);

    const aggregator = new Aggregator(rootDir, {} as never, ['English']);

    expect(aggregator.needsProjectAggregation()).toBe(true);
  });

  it('requeues resumable aggregate directories from checkpoint even without fresh source commits', async () => {
    const aggregateDirectory = vi.fn().mockResolvedValue(undefined);
    const aggregateProject = vi.fn().mockResolvedValue(undefined);
    const needsDirectoryAggregation = vi.fn((dir: string) => dir === 'src/core');
    const needsProjectAggregation = vi.fn().mockReturnValue(true);
    const warn = vi.fn();

    const task = new AggregationTask();
    await task.execute(
      {
        rootDir: '/repo',
        scanner: {
          getAllTrackedFiles: () => ['src/core/a.ts', 'src/utils/b.ts'],
        } as never,
        manifest: {} as never,
        aggregator: {
          aggregateDirectory,
          aggregateProject,
          needsDirectoryAggregation,
          needsProjectAggregation,
        } as never,
        outputManager: {} as never,
        ruleEngine: {} as never,
        contextEngine: {} as never,
        extractor: {} as never,
        llmClient: undefined,
        targetLocales: ['English'],
        isFullSync: false,
        hookMode: false,
        forcedSyncFiles: new Set(),
        runtimeIO: {
          info: vi.fn(),
          warn,
          error: vi.fn(),
          confirm: vi.fn(),
        },
        runtimeCache: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
          pendingCommits: new Map(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
        // Simulate an interrupted prior run: the aggregation stage has items
        // still marked as 'running' in the checkpoint, which collectRecoverableDirs
        // now reads instead of scanning all tracked files.
        executionCheckpoint: {
          load: () => ({
            schemaVersion: '1.0' as const,
            command: 'sync',
            runId: 'test-resume-1',
            status: 'running' as const,
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stages: {
              aggregation: {
                status: 'running' as const,
                updatedAt: new Date().toISOString(),
                items: {
                  src: { status: 'running' as const, updatedAt: new Date().toISOString() },
                  'src/core': { status: 'running' as const, updatedAt: new Date().toISOString() },
                  'src/utils': { status: 'running' as const, updatedAt: new Date().toISOString() },
                },
              },
            },
          }),
          markItemStarted: vi.fn(),
          markItemCompleted: vi.fn(),
          markItemFailed: vi.fn(),
        } as never,
      },
      {
        selection: {
          filteredFiles: [],
          affectedDirs: new Set<string>(),
        },
        committedFiles: [],
        committedCount: 0,
      },
    );

    expect(needsDirectoryAggregation).toHaveBeenCalledWith('src');
    expect(needsDirectoryAggregation).toHaveBeenCalledWith('src/core');
    expect(needsDirectoryAggregation).toHaveBeenCalledWith('src/utils');
    expect(aggregateDirectory).toHaveBeenCalledTimes(1);
    expect(aggregateDirectory).toHaveBeenCalledWith('src/core');
    expect(needsProjectAggregation).toHaveBeenCalled();
    expect(aggregateProject).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });
});
