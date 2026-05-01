import { ErrorCodes, toArchSpineError } from '../../core/errors.js';
import { runInfoReport } from '../../engines/info.js';

import { defaultRuntimeIO } from '../../infra/runtime-io.js';

export interface ExecuteInfoCommandOptions {
  args: string[];
  rootDir: string;
}

export async function executeInfoCommand({
  args,
  rootDir,
}: ExecuteInfoCommandOptions): Promise<void> {
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
