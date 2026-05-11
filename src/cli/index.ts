#!/usr/bin/env node
import { setGlobalDispatcher, ProxyAgent } from 'undici';

if (process.env.https_proxy || process.env.http_proxy) {
  const proxyUrl = process.env.https_proxy || process.env.http_proxy || '';
  const dispatcher = new ProxyAgent(proxyUrl);
  setGlobalDispatcher(dispatcher);
}

import { Config } from '../infra/config.js';
import { Manifest } from '../infra/manifest.js';
import { Secrets } from '../infra/secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets } from '../infra/llm.js';
import { promptForImmediateConfirmation } from '../utils/confirm.js';
import { RuntimeService } from '../services/runtime-service.js';
import { ErrorCodes, toArchSpineError } from '../core/errors.js';
import { executeInitCommand } from './commands/init.js';

// New modular command imports
import { throwCliUsage, printStep, printLanguageDiscovery, displayUIBanner } from './cli-utils.js';
import { printGeneralHelp, printCommandHelp, printDashboard } from './help.js';
import { executeSyncCommand } from './commands/sync.js';
import { executeBuildCommand } from './commands/build.js';
import { executeLlmCommand, getLLMTarget, promptForLLMSetup } from './commands/llm.js';
import { executeRemoveCommand } from './commands/remove.js';
import { executeCheckCommand } from './commands/check.js';
import { executeScanCommand } from './commands/scan.js';
import { executeConfigCommand } from './commands/config.js';
import { executeMcpCommand } from './commands/mcp.js';
import { executeInfoCommand } from './commands/info.js';
import { executeViewCommand } from './commands/view.js';
import { executeTryCommand } from './commands/try.js';
import { executeSkillCommand } from './commands/skill.js';
import { executeRulesCommand } from './commands/rules.js';

const [, , command, ...args] = process.argv;

async function main() {
  const rootDir = process.cwd();

  if (!command) {
    printDashboard(rootDir);
    return;
  }

  if (command === '--version' || command === '-v') {
    const { CURRENT_PACKAGE_VERSION } = await import('../types/protocol/versions.js');
    console.log(`ArchSpine v${CURRENT_PACKAGE_VERSION}`);
    return;
  }

  const wantsTopLevelHelp = command === 'help' || command === '--help' || command === '-h';
  const wantsCommandHelp = args.includes('--help') || args.includes('-h');

  if (wantsTopLevelHelp) {
    displayUIBanner(command, args);
    printGeneralHelp();
    return;
  }

  if (wantsCommandHelp) {
    displayUIBanner(command, args);
    printCommandHelp(command);
    return;
  }

  const config = new Config(rootDir);
  const secrets = new Secrets(rootDir);
  const globalLLMConfig = new GlobalLLMConfig();
  const globalLLMSecrets = new GlobalLLMSecrets();
  const runtimeService = new RuntimeService(
    rootDir,
    config,
    secrets,
    globalLLMConfig,
    globalLLMSecrets,
  );
  if (config.hasPersistedConfig()) {
    if (['check', 'status', 'mcp'].includes(command)) {
      const m = Manifest.open(rootDir);
      try {
        if (m.needsInitialSync()) {
          console.log(
            `\nℹ️  ArchSpine index not yet initialized. Run 'spine build' or 'spine sync' first for full functionality.\n`,
          );
        }
      } finally {
        m.close();
      }
    }
  }

  switch (command) {
    case 'check':
      await executeCheckCommand({ args, runtimeService });
      break;

    case 'scan':
      await executeScanCommand({ args, rootDir, config });
      break;

    case 'try':
      await executeTryCommand({ args, rootDir, displayUIBanner });
      break;

    case 'init':
      await executeInitCommand({
        args,
        rootDir,
        config,
        runtimeService,
        displayUIBanner,
        printStep,
        printLanguageDiscovery,
        promptForImmediateConfirmation,
        promptForLLMSetup: async (scope) => {
          const llmTarget = getLLMTarget({
            scope,
            rootDir,
            config,
            secrets,
            globalLLMConfig,
            globalLLMSecrets,
          });
          return promptForLLMSetup(llmTarget.configStore, llmTarget.secretsStore, llmTarget.label);
        },
      });
      break;

    case 'sync':
      await executeSyncCommand({ args, rootDir, config, runtimeService, displayUIBanner });
      break;

    case 'build':
      await executeBuildCommand({ args, rootDir, config, runtimeService, displayUIBanner });
      break;

    case 'config':
      await executeConfigCommand({ args, config, rootDir, runtimeService });
      break;

    case 'llm':
      await executeLlmCommand({
        args,
        rootDir,
        config,
        secrets,
        globalLLMConfig,
        globalLLMSecrets,
        runtimeService,
      });
      break;

    case 'remove':
      await executeRemoveCommand({ args, rootDir, config });
      break;

    case 'mcp':
      await executeMcpCommand({ args, rootDir, config });
      break;

    case 'info':
      await executeInfoCommand({ args, rootDir, runtimeService });
      break;

    case 'view':
      await executeViewCommand({ args, config, rootDir, runtimeService });
      break;

    case 'skill':
      await executeSkillCommand({ args });
      break;

    case 'rules':
      await executeRulesCommand({ args, rootDir });
      break;

    default:
      if (command && !command.startsWith('-') && command !== 'help') {
        throwCliUsage(`Unknown command '${command}'.`);
      }
      displayUIBanner(command, args);
      printGeneralHelp();
      throwCliUsage('Invalid command.');
  }
}

main().catch((err) => {
  const wrapped = toArchSpineError(
    err,
    ErrorCodes.CliCommandFailed,
    'Command failed unexpectedly.',
  );
  if (wrapped.code === ErrorCodes.CliUsageInvalid) {
    console.error(`❌ ${wrapped.message}`);
  } else {
    console.error(`❌ [${wrapped.code}] ${wrapped.message}`);
  }
  process.exit(wrapped.exitCode);
});
