import * as process from 'process';
import { Config, HookSyncMode } from '../../infra/config.js';
import { installGitHook, uninstallGitHook } from '../../utils/git-hook.js';
import { printStep, throwCliUsage } from '../cli-utils.js';
import { runSyncWorkflow } from './sync.js';
import { RuntimeService } from '../../services/runtime-service.js';

export interface ExecuteHookCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
}

export function parseHookSyncMode(value: string | undefined): HookSyncMode | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'hook' || normalized === 'standard' || normalized === 'heavy') {
    return normalized;
  }
  return undefined;
}

export async function executeHookCommand(options: ExecuteHookCommandOptions): Promise<void> {
  const { args, rootDir, config, runtimeService } = options;
  const hookAction = args[0];

  if (hookAction === 'on' || hookAction === 'enable') {
    const hookInstallResult = installGitHook();
    if (hookInstallResult.status === 'skipped-no-git-root') {
      console.warn(`⚠️  ${hookInstallResult.message}`);
    } else {
      config.setPreCommitEnabled(true);
      printStep('Spine pre-commit hook installed and enabled.');
    }
  } else if (hookAction === 'off' || hookAction === 'disable') {
    config.setPreCommitEnabled(false);
    uninstallGitHook();
    printStep('Spine pre-commit hook disabled and removed.');
  } else if (hookAction === 'set-mode') {
    const nextMode = parseHookSyncMode(args[1]);
    if (!nextMode) {
      throwCliUsage('Usage: spine hook set-mode <hook|standard|heavy>');
    }
    config.setHookSyncMode(nextMode);
    console.log(`Spine hook sync mode set to ${nextMode}.`);
  } else if (hookAction === 'should-run') {
    process.stdout.write(String(config.isPreCommitEnabled()));
  } else if (hookAction === 'run') {
    const previousInternalHook = process.env.SPINE_INTERNAL_HOOK;
    process.env.SPINE_INTERNAL_HOOK = 'true';
    const hookSyncMode = config.getHookSyncMode();
    const runtimeOverrides =
      hookSyncMode === 'heavy' || hookSyncMode === 'standard' ? { mode: hookSyncMode } : undefined;

    try {
      await runSyncWorkflow({
        rootDir,
        config,
        runtimeService,
        runtimeOverrides,
        full: false,
        hookMode: hookSyncMode === 'hook',
        repairViolations: false,
        origin: 'hook',
      });
    } finally {
      if (previousInternalHook === undefined) {
        delete process.env.SPINE_INTERNAL_HOOK;
      } else {
        process.env.SPINE_INTERNAL_HOOK = previousInternalHook;
      }
    }
  } else {
    console.log('Usage: spine hook [on|off|should-run|run|set-mode]');
  }
}
