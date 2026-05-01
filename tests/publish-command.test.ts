import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  callOrder,
  syncWorkflowMock,
  warnIfPublishingFromLocalStrategyMock,
  assertPublishRuntimeBaselineMock,
  assertPublishSnapshotReadyMock,
  clearAtlasStaleMock,
  documentBackfillRunMock,
} = vi.hoisted(() => ({
  callOrder: [] as string[],
  syncWorkflowMock: vi.fn(async () => {
    callOrder.push('sync');
  }),
  warnIfPublishingFromLocalStrategyMock: vi.fn(() => {
    callOrder.push('warn-local');
  }),
  assertPublishRuntimeBaselineMock: vi.fn(() => {
    callOrder.push('assert-runtime');
  }),
  assertPublishSnapshotReadyMock: vi.fn(() => {
    callOrder.push('assert-snapshot');
  }),
  clearAtlasStaleMock: vi.fn(() => {
    callOrder.push('clear-atlas');
  }),
  documentBackfillRunMock: vi.fn(async () => {
    callOrder.push('doc-backfill');
    return { generated: 1, skipped: 0, usage: { totalTokens: 42 } };
  }),
}));

vi.mock('../src/cli/commands/sync.js', () => ({
  runSyncWorkflow: syncWorkflowMock,
}));

vi.mock('../src/services/publish-preflight.js', () => ({
  warnIfPublishingFromLocalStrategy: warnIfPublishingFromLocalStrategyMock,
  assertPublishRuntimeBaseline: assertPublishRuntimeBaselineMock,
  assertPublishSnapshotReady: assertPublishSnapshotReadyMock,
}));

vi.mock('../src/tasks/document-backfill.js', () => ({
  DocumentBackfillTask: class {
    run = documentBackfillRunMock;
  },
}));

vi.mock('../src/infra/manifest.js', () => ({
  Manifest: {
    open: vi.fn(() => ({
      clearAtlasStale: clearAtlasStaleMock,
    })),
  },
}));

import { runPublishWorkflow } from '../src/cli/commands/publish.js';

describe('runPublishWorkflow', () => {
  beforeEach(() => {
    callOrder.length = 0;
    vi.clearAllMocks();
  });

  it('runs preflight, sync, backfill, cleanup, and snapshot checks in order', async () => {
    const runtimeService = {
      getResolvedLLMClient: () => ({
        llmClient: {
          generateText: vi.fn(async () => ({ content: '{}', usage: { totalTokens: 1 } })),
        },
      }),
    } as any;

    const config = {
      getLanguages: () => ['en-US', 'zh-CN'],
    } as any;

    await runPublishWorkflow({
      rootDir: '/tmp/example',
      config,
      runtimeService,
    });

    expect(callOrder).toEqual([
      'warn-local',
      'assert-runtime',
      'sync',
      'doc-backfill',
      'clear-atlas',
      'assert-snapshot',
    ]);

    expect(syncWorkflowMock).toHaveBeenCalledWith(
      expect.objectContaining({
        full: false,
        surface: 'publish',
        origin: 'user',
      }),
    );
  });

  it('stops immediately when runtime baseline assertion fails', async () => {
    assertPublishRuntimeBaselineMock.mockImplementationOnce(() => {
      throw new Error('baseline-missing');
    });

    await expect(
      runPublishWorkflow({
        rootDir: '/tmp/example',
        config: { getLanguages: () => ['en-US'] } as any,
        runtimeService: {
          getResolvedLLMClient: () => ({ llmClient: undefined }),
        } as any,
      }),
    ).rejects.toThrow('baseline-missing');

    expect(syncWorkflowMock).not.toHaveBeenCalled();
    expect(documentBackfillRunMock).not.toHaveBeenCalled();
    expect(assertPublishSnapshotReadyMock).not.toHaveBeenCalled();
  });
});
