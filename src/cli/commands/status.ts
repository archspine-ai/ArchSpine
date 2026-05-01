import { RuntimeService } from '../../services/runtime-service.js';
import { ErrorCodes, toArchSpineError } from '../../core/errors.js';

export interface ExecuteStatusCommandOptions {
  runtimeService: RuntimeService;
}

export async function executeStatusCommand({
  runtimeService,
}: ExecuteStatusCommandOptions): Promise<void> {
  let status;
  try {
    status = await runtimeService.getSyncService().status();
  } catch (error) {
    throw toArchSpineError(
      error,
      ErrorCodes.SyncStatusFailed,
      'Failed to compute sync status. Please check .spine/manifest.json and .spine/cache.db, then run "spine sync".',
      { context: { command: 'status' } },
    );
  }
  console.log('Spine Status:');
  console.log(`  Total scannable files: ${status.total}`);
  console.log(`  Files needing sync: ${status.needingSync}`);
  if (status.needingSync > 0) {
    console.log('Run "spine sync" to update.');
  }
}
