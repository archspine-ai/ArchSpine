import { runUsageReport } from '../../engines/usage.js';
import { defaultRuntimeIO } from '../../infra/runtime-io.js';

export interface ExecuteUsageCommandOptions {
  rootDir: string;
}

export async function executeUsageCommand({ rootDir }: ExecuteUsageCommandOptions): Promise<void> {
  await runUsageReport(rootDir, defaultRuntimeIO);
}
