import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTaskTelemetryState } from '../src/core/task-state.js';

describe('resume-aware services', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('feeds interrupted sync candidates back into the scan and forced-sync paths', async () => {
    const createTaskContext = vi.fn(() => ({
      context: {
        manifest: {
          save: vi.fn(),
          recordUsage: vi.fn(),
        },
        outputManager: {
          saveView: vi.fn(),
          saveViewMarkdown: vi.fn(),
          saveViewHtml: vi.fn(),
          deleteViewArtifacts: vi.fn(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
        runtimeIO: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
      },
      lockManager: {
        acquire: vi.fn(),
        release: vi.fn(),
      },
    }));

    let scanInput: any;

    vi.doMock('../src/services/task-runtime.js', () => ({
      createTaskContext,
    }));
    vi.doMock('../src/core/pipeline.js', () => ({
      TaskRunner: class {
        async runVoid() {
          return undefined;
        }

        async run(task: { checkpointId?: string }, input: unknown) {
          switch (task.checkpointId) {
            case 'scan-cleanup':
              scanInput = input;
              return {
                selection: { filteredFiles: ['src/todo.ts'], affectedDirs: new Set<string>() },
              };
            case 'ast-extraction':
              return {
                selection: { filteredFiles: ['src/todo.ts'], affectedDirs: new Set<string>() },
                artifacts: { skeletons: new Map(), unsupportedFiles: new Map() },
              };
            case 'summarization':
              return {
                selection: { filteredFiles: ['src/todo.ts'], affectedDirs: new Set<string>() },
                artifacts: {
                  skeletons: new Map(),
                  unsupportedFiles: new Map(),
                  pendingCommits: new Map(),
                },
              };
            case 'state-commit':
              return {
                selection: { filteredFiles: ['src/todo.ts'], affectedDirs: new Set<string>() },
                committedFiles: [],
                committedCount: 0,
              };
            case 'post-commit-derivation':
              return undefined;
            default:
              return undefined;
          }
        }
      },
    }));
    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => null,
      writeProtectedOutputBaseline: vi.fn(),
    }));
    vi.doMock('../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return { runId: 'sync-old', status: 'running' };
        }
        getLastLoadWarning() {
          return null;
        }
        startRun = vi.fn();
        completeRun = vi.fn();
        failRun = vi.fn();
      },
      deriveSyncResumeCandidateFiles: () => ['src/todo.ts'],
      isResumableCheckpoint: () => true,
    }));

    const { SyncService } = await import('../src/services/sync-service.js');
    const service = new SyncService({
      rootDir: process.cwd(),
      runtimeIO: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        confirm: vi.fn(),
      },
    });

    await service.sync(false, false, {});

    expect(createTaskContext).toHaveBeenCalledWith(
      expect.objectContaining({
        forcedSyncFiles: ['src/todo.ts'],
      }),
    );
    expect(scanInput).toEqual({ candidateFiles: ['src/todo.ts'] });
  });

  it('feeds interrupted check candidates back into scan selection', async () => {
    const createTaskContext = vi.fn(() => ({
      context: {
        manifest: {
          recordUsage: vi.fn(),
        },
        outputManager: {
          saveView: vi.fn(),
          saveViewMarkdown: vi.fn(),
          saveViewHtml: vi.fn(),
          deleteViewArtifacts: vi.fn(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
        runtimeIO: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
      },
      lockManager: {
        acquire: vi.fn(),
        release: vi.fn(),
      },
    }));

    let scanInput: any;

    vi.doMock('../src/services/task-runtime.js', () => ({
      createTaskContext,
    }));
    vi.doMock('../src/core/pipeline.js', () => ({
      TaskRunner: class {
        async run(task: { checkpointId?: string }, input: unknown) {
          switch (task.checkpointId) {
            case 'scan-cleanup':
              scanInput = input;
              return {
                selection: { filteredFiles: ['src/check.ts'], affectedDirs: new Set<string>() },
              };
            case 'ast-extraction':
              return {
                selection: { filteredFiles: ['src/check.ts'], affectedDirs: new Set<string>() },
                artifacts: { skeletons: new Map(), unsupportedFiles: new Map() },
              };
            case 'validation':
              return {
                summary: {
                  auditedFiles: 1,
                  filesWithRules: 1,
                  filesWithViolations: 0,
                  totalViolations: 0,
                  failedFiles: 0,
                },
                stage: {
                  selection: { filteredFiles: ['src/check.ts'], affectedDirs: new Set<string>() },
                  artifacts: { skeletons: new Map(), unsupportedFiles: new Map() },
                },
              };
            default:
              return undefined;
          }
        }
      },
    }));
    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => null,
    }));
    vi.doMock('../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return { runId: 'check-old', status: 'running' };
        }
        getLastLoadWarning() {
          return null;
        }
        startRun = vi.fn();
        completeRun = vi.fn();
        failRun = vi.fn();
      },
      deriveCheckResumeCandidateFiles: () => ['src/check.ts'],
      isResumableCheckpoint: () => true,
    }));

    const { CheckService } = await import('../src/services/check-service.js');
    const service = new CheckService({
      rootDir: process.cwd(),
      llmClient: {} as never,
      runtimeIO: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        confirm: vi.fn(),
      },
    });

    await service.run();

    expect(scanInput).toEqual({ candidateFiles: ['src/check.ts'] });
  });

  it('fails the sync checkpoint and releases the runtime lock when a resumed run aborts mid-pipeline', async () => {
    const failRun = vi.fn();
    const release = vi.fn();
    const createTaskContext = vi.fn(() => ({
      context: {
        manifest: {
          save: vi.fn(),
          recordUsage: vi.fn(),
        },
        outputManager: {
          saveView: vi.fn(),
          saveViewMarkdown: vi.fn(),
          saveViewHtml: vi.fn(),
          deleteViewArtifacts: vi.fn(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
        runtimeIO: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
      },
      lockManager: {
        acquire: vi.fn(),
        release,
      },
    }));

    vi.doMock('../src/services/task-runtime.js', () => ({
      createTaskContext,
    }));
    vi.doMock('../src/core/pipeline.js', () => ({
      TaskRunner: class {
        async runVoid() {
          return undefined;
        }

        async run(task: { checkpointId?: string }) {
          if (task.checkpointId === 'scan-cleanup') {
            throw new Error('scan exploded');
          }
          return undefined;
        }
      },
    }));
    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => null,
      writeProtectedOutputBaseline: vi.fn(),
    }));
    vi.doMock('../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return { runId: 'sync-old', status: 'running' };
        }
        getLastLoadWarning() {
          return null;
        }
        startRun = vi.fn();
        completeRun = vi.fn();
        failRun = failRun;
      },
      deriveSyncResumeCandidateFiles: () => ['src/todo.ts'],
      isResumableCheckpoint: () => true,
    }));

    const { SyncService } = await import('../src/services/sync-service.js');
    const service = new SyncService({
      rootDir: process.cwd(),
      runtimeIO: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        confirm: vi.fn(),
      },
    });

    await expect(service.sync(false, false, {})).rejects.toThrow('scan exploded');
    expect(failRun).toHaveBeenCalledWith(expect.any(Error));
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('fails the check checkpoint and releases the runtime lock when a resumed run aborts mid-pipeline', async () => {
    const failRun = vi.fn();
    const release = vi.fn();
    const runtimeError = new Error('validate exploded');
    const createTaskContext = vi.fn(() => ({
      context: {
        manifest: {
          recordUsage: vi.fn(),
        },
        outputManager: {
          saveView: vi.fn(),
          saveViewMarkdown: vi.fn(),
          saveViewHtml: vi.fn(),
          deleteViewArtifacts: vi.fn(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
        runtimeIO: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
      },
      lockManager: {
        acquire: vi.fn(),
        release,
      },
    }));

    vi.doMock('../src/services/task-runtime.js', () => ({
      createTaskContext,
    }));
    vi.doMock('../src/core/pipeline.js', () => ({
      TaskRunner: class {
        async run(task: { checkpointId?: string }) {
          if (task.checkpointId === 'validation') {
            throw runtimeError;
          }
          if (task.checkpointId === 'scan-cleanup') {
            return {
              selection: { filteredFiles: ['src/check.ts'], affectedDirs: new Set<string>() },
            };
          }
          if (task.checkpointId === 'ast-extraction') {
            return {
              selection: { filteredFiles: ['src/check.ts'], affectedDirs: new Set<string>() },
              artifacts: { skeletons: new Map(), unsupportedFiles: new Map() },
            };
          }
          return undefined;
        }
      },
    }));
    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => null,
    }));
    vi.doMock('../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return { runId: 'check-old', status: 'running' };
        }
        getLastLoadWarning() {
          return null;
        }
        startRun = vi.fn();
        completeRun = vi.fn();
        failRun = failRun;
      },
      deriveCheckResumeCandidateFiles: () => ['src/check.ts'],
      isResumableCheckpoint: () => true,
    }));

    const { CheckService } = await import('../src/services/check-service.js');
    const service = new CheckService({
      rootDir: process.cwd(),
      llmClient: {} as never,
      runtimeIO: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        confirm: vi.fn(),
      },
    });

    await expect(service.run()).rejects.toMatchObject({ message: 'validate exploded' });
    expect(failRun).toHaveBeenCalledWith(runtimeError);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('fails the fix checkpoint and releases the runtime lock when a resumed run aborts during revalidation', async () => {
    const failRun = vi.fn();
    const release = vi.fn();
    const runtimeError = new Error('revalidation exploded');
    const createTaskContext = vi.fn(() => ({
      context: {
        manifest: {
          getActiveViolations: vi
            .fn()
            .mockReturnValueOnce([
              { file_path: 'src/demo.ts', rule_id: 'r1', severity: 'error', reason: 'demo' },
            ])
            .mockReturnValue([
              { file_path: 'src/demo.ts', rule_id: 'r1', severity: 'error', reason: 'demo' },
            ]),
          recordUsage: vi.fn(),
        },
        outputManager: {
          saveView: vi.fn(),
          saveViewMarkdown: vi.fn(),
          saveViewHtml: vi.fn(),
          deleteViewArtifacts: vi.fn(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
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
      },
      lockManager: {
        acquire: vi.fn(),
        release,
      },
    }));

    vi.doMock('../src/services/task-runtime.js', () => ({
      createTaskContext,
    }));
    vi.doMock('../src/core/pipeline.js', () => ({
      TaskRunner: class {
        async run(task: { checkpointId?: string }) {
          if (task.checkpointId === 'fix') {
            return { fixed: 1, skipped: 0, failed: 0, recheckFiles: ['src/demo.ts'] };
          }
          if (task.checkpointId === 'scan-cleanup') {
            return {
              selection: { filteredFiles: ['src/demo.ts'], affectedDirs: new Set<string>() },
            };
          }
          if (task.checkpointId === 'ast-extraction') {
            return {
              selection: { filteredFiles: ['src/demo.ts'], affectedDirs: new Set<string>() },
              artifacts: { skeletons: new Map(), unsupportedFiles: new Map() },
            };
          }
          if (task.checkpointId === 'validation') {
            throw runtimeError;
          }
          return undefined;
        }
      },
    }));
    vi.doMock('../src/core/task-state.js', async () => {
      const actual = await vi.importActual<typeof import('../src/core/task-state.js')>(
        '../src/core/task-state.js',
      );
      return {
        ...actual,
        resetTaskState: vi.fn(actual.resetTaskState),
      };
    });
    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => null,
    }));
    vi.doMock('../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return { runId: 'fix-old', status: 'running' };
        }
        getLastLoadWarning() {
          return null;
        }
        startRun = vi.fn();
        completeRun = vi.fn();
        failRun = failRun;
      },
      isResumableCheckpoint: () => true,
    }));

    const { FixService } = await import('../src/services/fix-service.js');
    const service = new FixService({
      rootDir: process.cwd(),
      llmClient: {} as never,
      runtimeIO: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        confirm: vi.fn(),
      },
    });

    await expect(service.run()).rejects.toMatchObject({ message: 'revalidation exploded' });
    expect(failRun).toHaveBeenCalledWith(runtimeError);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('stops fix retries when a fix pass reports changes but returns no recheck files', async () => {
    const completeRun = vi.fn();
    const runtimeWarn = vi.fn();
    const createTaskContext = vi.fn(() => ({
      context: {
        manifest: {
          getActiveViolations: vi
            .fn()
            .mockReturnValueOnce([
              { file_path: 'src/demo.ts', rule_id: 'r1', severity: 'error', reason: 'demo' },
            ])
            .mockReturnValue([
              { file_path: 'src/demo.ts', rule_id: 'r1', severity: 'error', reason: 'demo' },
            ]),
          recordUsage: vi.fn(),
        },
        outputManager: {
          saveView: vi.fn(),
          saveViewMarkdown: vi.fn(),
          saveViewHtml: vi.fn(),
          deleteViewArtifacts: vi.fn(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
        runtimeIO: {
          info: vi.fn(),
          warn: runtimeWarn,
          error: vi.fn(),
          confirm: vi.fn(),
        },
        runtimeCache: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
          pendingCommits: new Map(),
        },
      },
      lockManager: {
        acquire: vi.fn(),
        release: vi.fn(),
      },
    }));

    vi.doMock('../src/services/task-runtime.js', () => ({
      createTaskContext,
    }));
    vi.doMock('../src/core/pipeline.js', () => ({
      TaskRunner: class {
        async run(task: { checkpointId?: string }) {
          if (task.checkpointId === 'fix') {
            return { fixed: 1, skipped: 0, failed: 0, recheckFiles: [] };
          }
          throw new Error(`unexpected stage: ${task.checkpointId}`);
        }
      },
    }));
    vi.doMock('../src/core/task-state.js', async () => {
      const actual = await vi.importActual<typeof import('../src/core/task-state.js')>(
        '../src/core/task-state.js',
      );
      return {
        ...actual,
        resetTaskState: vi.fn(actual.resetTaskState),
      };
    });
    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => null,
    }));
    vi.doMock('../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return null;
        }
        getLastLoadWarning() {
          return null;
        }
        startRun = vi.fn();
        completeRun = completeRun;
        failRun = vi.fn();
      },
      isResumableCheckpoint: () => false,
    }));

    const { FixService } = await import('../src/services/fix-service.js');
    const service = new FixService({
      rootDir: process.cwd(),
      llmClient: {} as never,
      runtimeIO: {
        info: vi.fn(),
        warn: runtimeWarn,
        error: vi.fn(),
        confirm: vi.fn(),
      },
    });

    const summary = await service.run();
    expect(summary.fixed).toBe(1);
    expect(summary.remainingViolations).toBe(1);
    expect(runtimeWarn).toHaveBeenCalledWith(
      expect.stringContaining('no files were queued for re-validation'),
    );
    expect(completeRun).toHaveBeenCalledWith(
      expect.objectContaining({
        fixed: 1,
        skipped: 0,
        failed: 0,
        remainingViolations: 1,
      }),
    );
  });
});
