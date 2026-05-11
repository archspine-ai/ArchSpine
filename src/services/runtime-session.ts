import {
  ExecutionCheckpointStore,
  isResumableCheckpoint,
  type ExecutionCheckpointState,
} from '../infra/execution-checkpoint.js';
import {
  detectProtectedOutputMutations,
  formatProtectedOutputMutationWarning,
} from '../infra/spine-gate.js';
import { defaultRuntimeIO, type RuntimeIO } from '../infra/runtime-io.js';
import { withProtectedOutputsWriteAccess } from '../infra/writer-boundary.js';
import type { PreparedTaskContext } from './task-runtime.js';

export type RuntimeCommand = 'sync' | 'check' | 'fix';

export interface RuntimeSessionOptions<TContext, TResult> {
  command: RuntimeCommand;
  rootDir: string;
  runtimeIO?: RuntimeIO;
  prepare: (args: {
    executionCheckpoint: ExecutionCheckpointStore;
    previousCheckpoint: ExecutionCheckpointState | null;
    runtimeIO: RuntimeIO;
  }) => PreparedTaskContext & { context: TContext };
  onResume?: (args: { previousCheckpoint: ExecutionCheckpointState; runtimeIO: RuntimeIO }) => void;
  execute: (args: {
    context: TContext;
    executionCheckpoint: ExecutionCheckpointStore;
    previousCheckpoint: ExecutionCheckpointState | null;
    runtimeIO: RuntimeIO;
  }) => Promise<TResult>;
  onError?: (
    error: unknown,
    args: {
      executionCheckpoint: ExecutionCheckpointStore;
      previousCheckpoint: ExecutionCheckpointState | null;
      runtimeIO: RuntimeIO;
    },
  ) => never;
}

export async function runWithRuntimeSession<TContext, TResult>(
  options: RuntimeSessionOptions<TContext, TResult>,
): Promise<TResult> {
  return withProtectedOutputsWriteAccess(options.rootDir, async () => {
    const runtimeIO = options.runtimeIO || defaultRuntimeIO;
    const executionCheckpoint = new ExecutionCheckpointStore(options.rootDir, options.command);
    const previousCheckpoint = executionCheckpoint.load();
    const checkpointLoadWarning = executionCheckpoint.getLastLoadWarning();
    if (checkpointLoadWarning) {
      runtimeIO.warn(checkpointLoadWarning);
    }
    if (previousCheckpoint && isResumableCheckpoint(previousCheckpoint)) {
      options.onResume?.({
        previousCheckpoint,
        runtimeIO,
      });
    }

    const violationWarning = formatProtectedOutputMutationWarning(
      detectProtectedOutputMutations(options.rootDir),
    );
    if (violationWarning) {
      runtimeIO.warn(violationWarning);
    }

    const prepared = options.prepare({
      executionCheckpoint,
      previousCheckpoint,
      runtimeIO,
    });
    prepared.lockManager.acquire();

    try {
      return await options.execute({
        context: prepared.context,
        executionCheckpoint,
        previousCheckpoint,
        runtimeIO,
      });
    } catch (error) {
      executionCheckpoint.failRun(error);
      if (options.onError) {
        options.onError(error, {
          executionCheckpoint,
          previousCheckpoint,
          runtimeIO,
        });
      }
      throw error;
    } finally {
      prepared.lockManager.release();
      prepared.close?.();
    }
  });
}
