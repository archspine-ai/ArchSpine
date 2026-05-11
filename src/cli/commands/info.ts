import { ErrorCodes, toArchSpineError } from '../../core/errors.js';
import { runInfoReport } from '../../engines/info.js';
import { runUsageReport } from '../../engines/usage.js';
import { defaultRuntimeIO } from '../../infra/runtime-io.js';
import type { RuntimeService } from '../../services/runtime-service.js';

export interface ExecuteInfoCommandOptions {
  args: string[];
  rootDir: string;
  runtimeService?: RuntimeService;
}

export async function executeInfoCommand({
  args,
  rootDir,
  runtimeService,
}: ExecuteInfoCommandOptions): Promise<void> {
  // Status subcommand: spine info status / spine status
  if (args.includes('status') || args[0] === 'status') {
    if (!runtimeService) {
      console.log('Status requires runtime service.');
      return;
    }
    try {
      const status = await runtimeService.getSyncStatusService().status();
      console.log('Spine Status:');
      console.log(`  Total scannable files: ${status.total}`);
      console.log(`  Files needing sync: ${status.needingSync}`);
      if (status.needingSync > 0) {
        console.log('Run "spine sync" to update.');
      }
    } catch (error) {
      throw toArchSpineError(
        error,
        ErrorCodes.SyncStatusFailed,
        'Failed to compute sync status. Please check .spine/manifest.json and .spine/cache.db, then run "spine sync".',
        { context: { command: 'status' } },
      );
    }
    return;
  }

  // Usage subcommand: spine info --usage / spine usage
  if (args.includes('--usage') || args[0] === 'usage') {
    await runUsageReport(rootDir, defaultRuntimeIO);
    return;
  }

  // Default: info report
  try {
    await runInfoReport(rootDir, {
      verbose: args.includes('--verbose'),
      runtimeIO: defaultRuntimeIO,
    });
  } catch (error) {
    throw toArchSpineError(
      error,
      ErrorCodes.InfoReportFailed,
      'Failed to render workspace info. Please check config/manifest integrity and retry.',
      { context: { command: 'info' } },
    );
  }
}
