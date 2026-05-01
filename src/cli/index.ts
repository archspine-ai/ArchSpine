#!/usr/bin/env node
import 'dotenv/config';
import { setGlobalDispatcher, ProxyAgent } from 'undici';

if (process.env.https_proxy || process.env.http_proxy) {
  const proxyUrl = process.env.https_proxy || process.env.http_proxy || '';
  const dispatcher = new ProxyAgent(proxyUrl);
  setGlobalDispatcher(dispatcher);
}

import { Config } from '../infra/config.js';
import { hasManifestBaseline } from '../infra/manifest.js';
import { Secrets } from '../infra/secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets } from '../infra/llm.js';
import { promptForImmediateConfirmation } from '../utils/confirm.js';
import { RuntimeService } from '../services/runtime-service.js';
import { ErrorCodes, toArchSpineError } from '../core/errors.js';
import { executeInitCommand } from './commands/init.js';

// New modular command imports
import { throwCliUsage, printStep, printLanguageDiscovery, displayUIBanner } from './cli-utils.js';
import { printGeneralHelp, printCommandHelp } from './help.js';
import { executeSyncCommand } from './commands/sync.js';
import { executeBuildCommand } from './commands/build.js';
import { executePublishCommand } from './commands/publish.js';
import { executeLlmCommand, getLLMTarget, promptForLLMSetup } from './commands/llm.js';
import { executeRemoveCommand } from './commands/remove.js';
import { executeLanguagesCommand, promptForDocumentationLanguages } from './commands/languages.js';
import { executeHookCommand } from './commands/hook.js';
import { executeCheckCommand } from './commands/check.js';
import { executeFixCommand } from './commands/fix.js';
import { executeScanCommand } from './commands/scan.js';
import { executeRepoCommand } from './commands/repo.js';
import { executeGodCommand } from './commands/god.js';
import { executeConfigCommand } from './commands/config.js';
import { executeStatusCommand } from './commands/status.js';
import { executeMcpCommand } from './commands/mcp.js';
import { executeUsageCommand } from './commands/usage.js';
import { executeInfoCommand } from './commands/info.js';
import { executeViewCommand } from './commands/view.js';
import { executeTryCommand } from './commands/try.js';
import { executeHistoryCommand } from './commands/history.js';

const [, , command, ...args] = process.argv;

async function main() {
  const rootDir = process.cwd();

  if (command === '--version' || command === '-v') {
    const { CURRENT_PACKAGE_VERSION } = await import('../types/protocol/versions.js');
    console.log(`ArchSpine v${CURRENT_PACKAGE_VERSION}`);
    return;
  }

  const wantsTopLevelHelp =
    !command || command === 'help' || command === '--help' || command === '-h';
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
  const syncPromptTier = runtimeService.getResolvedExecutionProfile('sync').promptTier;
  const isLitePromptTier = syncPromptTier === 'lite';

  if (isLitePromptTier && (command === 'sync' || command === 'build' || command === 'init')) {
    console.log('\x1b[43m\x1b[30m' + ' '.repeat(60) + '\x1b[0m');
    console.log(
      '\x1b[43m\x1b[30m' +
        '  ⚠️  LITE MODE ACTIVE — Low-Precision Lightweight Mode     ' +
        '\x1b[0m',
    );
    console.log(
      '\x1b[43m\x1b[30m' +
        '  This mode is for low-TPM environments only. Outputs are   ' +
        '\x1b[0m',
    );
    console.log(
      '\x1b[43m\x1b[30m' +
        '  partial and NOT a primary source of architectural truth.  ' +
        '\x1b[0m',
    );
    console.log('\x1b[43m\x1b[30m' + ' '.repeat(60) + '\x1b[0m');
    console.log('');
  }

  if (config.hasPersistedConfig()) {
    if (!hasManifestBaseline(rootDir)) {
      if (['check', 'fix', 'status', 'mcp', 'god'].includes(command)) {
        console.log(`\n⚠️  ArchSpine has been initialized but the semantic mirror is empty.`);
        console.log(`   Please run 'spine build' first to establish the baseline.\n`);
        throwCliUsage('Semantic mirror baseline missing. Run "spine build" first.');
      }
    }
  }

  switch (command) {
    case 'check':
      await executeCheckCommand({ runtimeService });
      break;

    case 'fix':
      await executeFixCommand({ runtimeService });
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
        promptForDocumentationLanguages,
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

    case 'publish':
      await executePublishCommand({ args, rootDir, config, runtimeService, displayUIBanner });
      break;

    case 'repo':
      await executeRepoCommand({ args, rootDir, config });
      break;

    case 'god':
      await executeGodCommand({ args, rootDir });
      break;

    case 'hook':
      await executeHookCommand({ args, rootDir, config, runtimeService });
      break;

    case 'config':
      await executeConfigCommand({ args, config });
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

    case 'status':
      await executeStatusCommand({ runtimeService });
      break;

    case 'remove':
      await executeRemoveCommand({ args, rootDir, config });
      break;

    case 'mcp':
      await executeMcpCommand({ args, rootDir });
      break;

    case 'usage':
      await executeUsageCommand({ rootDir });
      break;

    case 'info':
      await executeInfoCommand({ args, rootDir });
      break;

    case 'languages':
      await executeLanguagesCommand({ args, rootDir, config });
      break;

    case 'view':
      await executeViewCommand({ args, config, rootDir, runtimeService });
      break;

    case 'history':
      await executeHistoryCommand({ args, rootDir });
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
  process.exitCode = wrapped.exitCode;
});
