import * as process from 'process';
import { Config, SupportedConfigKey, HookSyncMode } from '../../infra/config.js';
import { throwCliUsage, parseConfigValue, formatConfigValue, printStep } from '../cli-utils.js';
import { runRepoCheck, runRepoStrategySet, parseArtifactStrategy } from '../repo/strategy.js';
import { installGitHook, uninstallGitHook } from '../../utils/git-hook.js';
import { runSyncWorkflow } from './sync.js';
import type { RuntimeService } from '../../services/runtime-service.js';

export interface ExecuteConfigCommandOptions {
  args: string[];
  config: Config;
  rootDir?: string;
  runtimeService?: RuntimeService;
}

function parseSupportedConfigKey(rawKey: string): SupportedConfigKey {
  const supportedKeys: SupportedConfigKey[] = [
    'llm.provider',
    'llm.model',
    'llm.baseURL',
    'hooks.preCommit',
    'hooks.syncMode',
    'artifacts.strategy',
    'artifacts.viewLayer',
    'artifacts.enabledViews',
  ];

  if ((supportedKeys as string[]).includes(rawKey)) {
    return rawKey as SupportedConfigKey;
  }

  throwCliUsage(`Unsupported config key '${rawKey}'.`);
}

function parseHookSyncMode(value: string | undefined): HookSyncMode | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'hook') {
    return normalized;
  }
  return undefined;
}

export async function executeConfigCommand({
  args,
  config,
  rootDir,
  runtimeService,
}: ExecuteConfigCommandOptions): Promise<void> {
  if (args.length === 0) {
    console.log('Usage: spine config <get|set|repo|hook> ...');
    return;
  }

  // --- repo subcommand ---
  if (args[0] === 'repo') {
    const repoRoot = rootDir || process.cwd();
    const repoSubcommand = args[1];
    if (repoSubcommand === 'check') {
      runRepoCheck(repoRoot, config);
    } else if (repoSubcommand === 'strategy' && args[2] === 'set') {
      const nextStrategy = parseArtifactStrategy(args[3]);
      if (!nextStrategy || args.length !== 4) {
        throwCliUsage(
          `Invalid artifact strategy "${args[3] || ''}". Usage: spine config repo strategy set <local|distributable>`,
        );
      }
      runRepoStrategySet(repoRoot, config, nextStrategy, printStep);
    } else {
      throwCliUsage('Usage: spine config repo <check|strategy set <local|distributable>>');
    }
    return;
  }

  // --- hook subcommand ---
  if (args[0] === 'hook') {
    const hookArgs = args.slice(1);

    if (hookArgs.length === 0) {
      throwCliUsage('Usage: spine config hook [on|off|enable|disable|set-mode|should-run|run]');
    }

    const hookAction = hookArgs[0];

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
      const nextMode = parseHookSyncMode(hookArgs[1]);
      if (!nextMode) {
        throwCliUsage('Usage: spine config hook set-mode hook');
      }
      config.setHookSyncMode(nextMode);
      console.log(`Spine hook sync mode set to ${nextMode}.`);
    } else if (hookAction === 'should-run') {
      process.stdout.write(String(config.isPreCommitEnabled()));
    } else if (hookAction === 'run') {
      if (!rootDir || !runtimeService) {
        throwCliUsage('Missing rootDir or runtimeService for hook run command.');
        return;
      }
      const previousInternalHook = process.env.SPINE_INTERNAL_HOOK;
      process.env.SPINE_INTERNAL_HOOK = 'true';
      const hookSyncMode = config.getHookSyncMode();

      try {
        await runSyncWorkflow({
          rootDir,
          config,
          runtimeService,
          runtimeOverrides: undefined,
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
      console.log('Usage: spine config hook [on|off|should-run|run|set-mode]');
    }
    return;
  }

  // --- existing get/set subcommands ---
  if (args[0] === 'get') {
    const rawKey = args[1];
    if (!rawKey) {
      throwCliUsage('Usage: spine config get <key>');
    }
    const key = parseSupportedConfigKey(rawKey);

    if (key === 'hooks.preCommit') {
      const resolution = config.getPreCommitResolution();
      console.log(formatConfigValue(resolution.value));
    } else if (key === 'hooks.syncMode') {
      console.log(formatConfigValue(config.getHookSyncMode()));
    } else {
      console.log(formatConfigValue(config.getSupportedValue(key)));
    }
  } else if (args[0] === 'set') {
    const rawKey = args[1];
    const rawValue = args[2];
    if (!rawKey || rawValue === undefined) {
      throwCliUsage('Usage: spine config set <key> <value>');
    }
    const key = parseSupportedConfigKey(rawKey);

    config.setSupportedValue(key, parseConfigValue(rawValue));
    console.log(`Updated ${key}.`);
  } else {
    console.log('Usage: spine config <get|set|repo|hook> ...');
  }
}
