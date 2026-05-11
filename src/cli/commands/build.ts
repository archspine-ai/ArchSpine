import { RuntimeService } from '../../services/runtime-service.js';
import { Config } from '../../infra/config.js';
import { throwCliUsage } from '../cli-utils.js';
import { runSyncWorkflow } from './sync.js';

export interface ExecuteBuildCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
  displayUIBanner: (cmd?: string, argsArr?: string[]) => void;
}

export async function executeBuildCommand(options: ExecuteBuildCommandOptions): Promise<void> {
  const { args, rootDir, config, runtimeService, displayUIBanner } = options;
  displayUIBanner('build', args);

  if (args.length > 0) {
    throwCliUsage('Usage: spine build');
  }

  await runBuildWorkflow({ rootDir, config, runtimeService });
}

export async function runBuildWorkflow(options: {
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
}): Promise<void> {
  const { rootDir, config, runtimeService } = options;
  await runSyncWorkflow({
    rootDir,
    config,
    runtimeService,
    full: true,
    hookMode: false,
    repairViolations: false,
    origin: 'user',
    surface: 'build',
  });
}
