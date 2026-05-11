import { Config } from '../../infra/config.js';
import { RuntimeService } from '../../services/runtime-service.js';
import type { LanguageSnapshot } from '../../types/protocol.js';
import { runRepositoryBootstrap } from '../init/repository-bootstrap.js';
import { promptForInitialSync, runRuntimeBootstrap } from '../init/runtime-bootstrap.js';
import type { LLMScope } from '../init/types.js';
import { normalizeOptionalString, throwCliUsage } from '../cli-utils.js';
import { parseArtifactStrategy } from '../repo/strategy.js';

function parseInitAgentFileArg(rawArgs: string[]): string | undefined {
  for (let index = 0; index < rawArgs.length; index += 1) {
    const current = rawArgs[index];
    if (current === '--agent-file') {
      const nextValue = normalizeOptionalString(rawArgs[index + 1]);
      if (!nextValue) {
        throwCliUsage('Usage: spine init [--agent-file <AGENTS.md|CLAUDE.md|GEMINI.md>]');
      }
      return nextValue;
    }
  }
  return undefined;
}

function parseInitInjectPackageScriptsArg(rawArgs: string[]): boolean | undefined {
  let value: boolean | undefined;
  for (const current of rawArgs) {
    if (current === '--inject-package-scripts') {
      value = true;
    } else if (current === '--no-inject-package-scripts') {
      value = false;
    }
  }
  return value;
}

function parseInitArtifactStrategyArg(rawArgs: string[]): any {
  for (let index = 0; index < rawArgs.length; index += 1) {
    const current = rawArgs[index];
    if (current === '--artifact-strategy') {
      const nextValue = parseArtifactStrategy(normalizeOptionalString(rawArgs[index + 1]));
      if (!nextValue) {
        throwCliUsage(
          'Usage: spine init [--agent-file <AGENTS.md|CLAUDE.md|GEMINI.md>] [--artifact-strategy <local|distributable>] [--inject-package-scripts|--no-inject-package-scripts]',
        );
      }
      return nextValue;
    }
  }
  return undefined;
}

async function promptForInitLLMScope(): Promise<any> {
  const prompts = (await import('prompts')).default;
  const response = await prompts({
    type: 'select',
    name: 'scope',
    message: 'Save LLM settings for:',
    choices: [
      { title: 'Machine-wide (Recommended for npm/brew installs)', value: 'global' },
      { title: 'This project only', value: 'project' },
      { title: 'Skip for now', value: '__skip__' },
    ],
    initial: 0,
  });

  if (!response.scope || response.scope === '__skip__') {
    return undefined;
  }
  return response.scope;
}

export interface ExecuteInitCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
  displayUIBanner: (cmd?: string, argsArr?: string[]) => void;
  printStep: (message: string, options?: { inline?: boolean }) => void;
  printLanguageDiscovery: (snapshot: LanguageSnapshot) => void;
  promptForImmediateConfirmation: (
    message: string,
    options?: { skipNewline?: boolean },
  ) => Promise<boolean>;
  promptForLLMSetup: (scope: LLMScope) => Promise<boolean>;
}

export async function executeInitCommand(options: ExecuteInitCommandOptions): Promise<void> {
  const {
    args,
    rootDir,
    config,
    runtimeService,
    displayUIBanner,
    printStep,
    printLanguageDiscovery,
    promptForImmediateConfirmation,
    promptForLLMSetup,
  } = options;

  displayUIBanner('init', args);
  console.log('  Initialization');
  const requestedAgentFile = parseInitAgentFileArg(args);
  const artifactStrategyArg = parseInitArtifactStrategyArg(args);
  const injectPackageScriptsArg = parseInitInjectPackageScriptsArg(args);

  const repositoryBootstrapResult = await runRepositoryBootstrap({
    rootDir,
    config,
    runtimeService,
    printStep,
    promptForImmediateConfirmation,
    artifactStrategyArg,
    requestedAgentFile,
    injectPackageScriptsArg,
  });

  await runRuntimeBootstrap({
    rootDir,
    config,
    runtimeService,
    printStep,
    printLanguageDiscovery,
    promptForImmediateConfirmation,
    promptForInitLLMScope,
    promptForLLMSetup,
  });

  console.log('\n✨ Initialization Complete!');
  console.log('-----------------------------------');
  console.log(
    `Rules:     ${repositoryBootstrapResult.installRules ? 'installed' : 'not installed'}`,
  );
  console.log(
    `Hooks:     ${repositoryBootstrapResult.hookSetupStatus === 'enabled' ? 'enabled' : repositoryBootstrapResult.hookSetupStatus === 'disabled' ? 'disabled' : 'skipped (not at Git repository root)'}`,
  );
  console.log('-----------------------------------');
  console.log('Get started:');
  console.log('1. Run `spine sync` to build the semantic index and views');
  console.log('2. Run `spine mcp setup` to connect your AI agent (one click)');
  console.log('3. Review `.spine/view/pages/agent-briefing.md` for a full project map');
  console.log('4. Run `spine check` to audit against architecture rules');
  console.log('5. Run `spine view show` to see what views are enabled');

  await promptForInitialSync({
    rootDir,
    config,
    runtimeService,
    printStep,
    printLanguageDiscovery,
    promptForImmediateConfirmation,
    promptForInitLLMScope,
    promptForLLMSetup,
  });
}
