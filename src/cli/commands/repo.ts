import { Config } from '../../infra/config.js';
import { runRepoCheck, runRepoStrategySet, parseArtifactStrategy } from '../repo/strategy.js';
import { throwCliUsage, printStep } from '../cli-utils.js';

export interface ExecuteRepoCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
}

export async function executeRepoCommand({
  args,
  rootDir,
  config,
}: ExecuteRepoCommandOptions): Promise<void> {
  const repoSubcommand = args[0];
  if (repoSubcommand === 'check') {
    runRepoCheck(rootDir, config);
  } else if (repoSubcommand === 'strategy' && args[1] === 'set') {
    const nextStrategy = parseArtifactStrategy(args[2]);
    if (!nextStrategy || args.length !== 3) {
      throwCliUsage('Usage: spine repo strategy set <local|distributable>');
    }
    runRepoStrategySet(rootDir, config, nextStrategy, printStep);
  } else {
    throwCliUsage('Usage: spine repo <check|strategy set <local|distributable>>');
  }
}
