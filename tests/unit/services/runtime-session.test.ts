import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('runtime session helper', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('warns on checkpoint load issues, fails the checkpoint on errors, and releases the lock', async () => {
    const failRun = vi.fn();
    const release = vi.fn();
    const warn = vi.fn();

    vi.doMock('../../../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../../../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => 'protected output warning',
    }));
    vi.doMock('../../../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return null;
        }
        getLastLoadWarning() {
          return 'checkpoint warning';
        }
        failRun = failRun;
      },
      isResumableCheckpoint: () => false,
    }));

    const { runWithRuntimeSession } = await import('../../../../src/services/runtime-session.js');

    await expect(
      runWithRuntimeSession({
        command: 'check',
        rootDir: process.cwd(),
        runtimeIO: {
          info: vi.fn(),
          warn,
          error: vi.fn(),
          confirm: vi.fn(),
        },
        prepare: () => ({
          context: { marker: 'ctx' },
          lockManager: {
            acquire: vi.fn(),
            release,
          },
        }),
        execute: async () => {
          throw new Error('boom');
        },
      }),
    ).rejects.toThrow('boom');

    expect(warn).toHaveBeenCalledWith('checkpoint warning');
    expect(warn).toHaveBeenCalledWith('protected output warning');
    expect(failRun).toHaveBeenCalledWith(expect.any(Error));
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('emits resume callbacks and returns the execute result on success', async () => {
    const onResume = vi.fn();

    vi.doMock('../../../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));
    vi.doMock('../../../src/infra/spine-gate.js', () => ({
      detectProtectedOutputMutations: () => ({
        hasBaseline: false,
        addedPaths: [],
        changedPaths: [],
        removedPaths: [],
      }),
      formatProtectedOutputMutationWarning: () => null,
    }));
    vi.doMock('../../../src/infra/execution-checkpoint.js', () => ({
      ExecutionCheckpointStore: class {
        load() {
          return { runId: 'resume-1', status: 'running' };
        }
        getLastLoadWarning() {
          return null;
        }
        failRun = vi.fn();
      },
      isResumableCheckpoint: () => true,
    }));

    const { runWithRuntimeSession } = await import('../../../../src/services/runtime-session.js');

    const result = await runWithRuntimeSession({
      command: 'sync',
      rootDir: process.cwd(),
      runtimeIO: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        confirm: vi.fn(),
      },
      onResume,
      prepare: () => ({
        context: { value: 42 },
        lockManager: {
          acquire: vi.fn(),
          release: vi.fn(),
        },
      }),
      execute: async ({ context }) => context.value,
    });

    expect(result).toBe(42);
    expect(onResume).toHaveBeenCalledWith(
      expect.objectContaining({
        previousCheckpoint: expect.objectContaining({ runId: 'resume-1' }),
      }),
    );
  });
});
