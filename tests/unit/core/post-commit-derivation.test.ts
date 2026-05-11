import { describe, expect, it, vi, afterEach } from 'vitest';
import { PostCommitDerivationTask } from '../../../src/tasks/post-commit-derivation.js';
import { ReverseIndexingTask } from '../../../src/tasks/reverse-index.js';
import { KnowledgeGraphTask } from '../../../src/tasks/knowledge-graph.js';
import { AggregationTask } from '../../../src/tasks/aggregate.js';
import { ViewDerivationTask } from '../../../src/tasks/view-derivation.js';
import { ViewService } from '../../../src/services/view/view-service.js';
import { VIEW_DEFINITIONS } from '../../../src/services/view/view-registry.js';
import { createTaskTelemetryState } from '../../../src/core/task-state.js';

describe('post-commit derivation task', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createContext(overrides: Partial<any> = {}): any {
    return {
      rootDir: '/repo',
      scanner: {} as never,
      manifest: {} as never,
      aggregator: {} as never,
      outputManager: {
        saveGodDoc: vi.fn(),
        deleteViewArtifacts: vi.fn(),
      } as never,
      ruleEngine: {} as never,
      contextEngine: {} as never,
      extractor: {} as never,
      llmClient: undefined,
      summarizeConcurrency: 3,
      summarizeRetryLimit: 2,
      enabledViews: ['public-surface'],
      invalidEnabledViews: [],
      isFullSync: false,
      hookMode: false,
      forcedSyncFiles: new Set<string>(),
      runtimeIO: {
        info: vi.fn(),
        warn: vi.fn(),
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
      ...overrides,
    };
  }

  const commitStage = {
    selection: {
      filteredFiles: ['src/demo.ts'],
      affectedDirs: new Set<string>(['src']),
    },
    committedFiles: ['src/demo.ts'],
    committedCount: 1,
  };

  it('runs reverse-index, aggregation, knowledge-graph, then view derivation in order when view layer is enabled', async () => {
    const calls: string[] = [];
    vi.spyOn(ReverseIndexingTask.prototype, 'execute').mockImplementation(async () => {
      calls.push('reverse-index');
    });
    vi.spyOn(AggregationTask.prototype, 'execute').mockImplementation(async () => {
      calls.push('aggregation');
    });
    vi.spyOn(KnowledgeGraphTask.prototype, 'execute').mockImplementation(async () => {
      calls.push('knowledge-graph');
    });
    vi.spyOn(ViewDerivationTask.prototype, 'execute').mockImplementation(async () => {
      calls.push('view-derivation');
      return {
        publicSurfaceCount: 0,
        riskHotspotCount: 0,
        archDiagramGenerated: false,
        generatedViews: [],
        skippedViews: [],
      };
    });

    const task = new PostCommitDerivationTask(true);
    await task.execute(createContext(), commitStage);

    expect(calls).toEqual(['reverse-index', 'aggregation', 'knowledge-graph', 'view-derivation']);
  });

  it('runs only reverse-index in hook mode', async () => {
    const reverseIndexExecute = vi
      .spyOn(ReverseIndexingTask.prototype, 'execute')
      .mockResolvedValue();
    const aggregationExecute = vi.spyOn(AggregationTask.prototype, 'execute').mockResolvedValue();
    const viewDerivationExecute = vi
      .spyOn(ViewDerivationTask.prototype, 'execute')
      .mockResolvedValue({
        publicSurfaceCount: 0,
        riskHotspotCount: 0,
        archDiagramGenerated: false,
        generatedViews: [],
        skippedViews: [],
      });

    const task = new PostCommitDerivationTask(true);
    await task.execute(createContext({ hookMode: true }), commitStage);

    expect(reverseIndexExecute).toHaveBeenCalledTimes(1);
    expect(aggregationExecute).not.toHaveBeenCalled();
    expect(viewDerivationExecute).not.toHaveBeenCalled();
  });

  it('clears all view artifacts when view layer is disabled', async () => {
    vi.spyOn(ReverseIndexingTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(AggregationTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(KnowledgeGraphTask.prototype, 'execute').mockResolvedValue();
    const viewDerivationExecute = vi
      .spyOn(ViewDerivationTask.prototype, 'execute')
      .mockResolvedValue({
        publicSurfaceCount: 0,
        riskHotspotCount: 0,
        archDiagramGenerated: false,
        generatedViews: [],
        skippedViews: [],
      });
    const clearViewArtifacts = vi
      .spyOn(ViewService.prototype, 'clearViewArtifacts')
      .mockImplementation(() => {});

    const task = new PostCommitDerivationTask(false);
    await task.execute(createContext(), commitStage);

    expect(viewDerivationExecute).not.toHaveBeenCalled();
    expect(clearViewArtifacts).toHaveBeenCalledWith(
      VIEW_DEFINITIONS.map((definition) => definition.id),
    );
  });

  it('preserves child stage checkpoint and telemetry semantics under the unified entry', async () => {
    const markStageStarted = vi.fn();
    const markStageCompleted = vi.fn();
    const markStageFailed = vi.fn();
    vi.spyOn(ReverseIndexingTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(AggregationTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(KnowledgeGraphTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(ViewDerivationTask.prototype, 'execute').mockResolvedValue({
      publicSurfaceCount: 0,
      riskHotspotCount: 0,
      archDiagramGenerated: false,
      generatedViews: [],
      skippedViews: [],
    });

    const ctx = createContext({
      executionCheckpoint: {
        markStageStarted,
        markStageCompleted,
        markStageFailed,
      },
    });

    const task = new PostCommitDerivationTask(true);
    await task.execute(ctx, commitStage);

    expect(markStageStarted).toHaveBeenCalledWith('reverse-index');
    expect(markStageStarted).toHaveBeenCalledWith('aggregation');
    expect(markStageStarted).toHaveBeenCalledWith('knowledge-graph');
    expect(markStageStarted).toHaveBeenCalledWith('view-derivation');
    expect(markStageCompleted).toHaveBeenCalledWith('reverse-index');
    expect(markStageCompleted).toHaveBeenCalledWith('aggregation');
    expect(markStageCompleted).toHaveBeenCalledWith('knowledge-graph');
    expect(markStageCompleted).toHaveBeenCalledWith('view-derivation');
    expect(markStageFailed).not.toHaveBeenCalled();
    expect(ctx.state.telemetry.stageMetrics).toEqual(
      expect.objectContaining({
        'reverse-index': expect.any(Object),
        aggregation: expect.any(Object),
        'knowledge-graph': expect.any(Object),
        'view-derivation': expect.any(Object),
      }),
    );
  });

  it('writes .spine/SPINE.md after aggregation', async () => {
    vi.spyOn(ReverseIndexingTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(AggregationTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(KnowledgeGraphTask.prototype, 'execute').mockResolvedValue();
    vi.spyOn(ViewDerivationTask.prototype, 'execute').mockResolvedValue({
      publicSurfaceCount: 0,
      riskHotspotCount: 0,
      archDiagramGenerated: false,
      generatedViews: [],
      skippedViews: [],
    });

    const ctx = createContext();
    const task = new PostCommitDerivationTask(true);
    await task.execute(ctx, commitStage);

    expect(ctx.outputManager.saveGodDoc).toHaveBeenCalledWith(
      'SPINE.md',
      expect.stringContaining('ArchSpine Control Plane'),
    );
    expect(ctx.outputManager.saveGodDoc).toHaveBeenCalledWith(
      'SPINE.md',
      expect.stringContaining('Generated by ArchSpine. Do not edit manually.'),
    );
  });
});
