import { Scanner } from '../../engines/scanner.js';
import { Config } from '../../infra/config.js';
import { throwCliUsage } from '../cli-utils.js';

export interface ExecuteScanCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
}

export async function executeScanCommand({
  args,
  rootDir,
  config,
}: ExecuteScanCommandOptions): Promise<void> {
  if (args[0] === '--dry-run') {
    const scanner = new Scanner(rootDir, config.getScanPolicy());
    console.log(scanner.formatDryRunReport());
  } else {
    throwCliUsage('Usage: spine scan --dry-run');
  }
}
