import prompts from 'prompts';
import { Config } from '../../infra/config.js';
import { Secrets } from '../../infra/secrets.js';
import { assertResolvedLLMUsable, GlobalLLMConfig, GlobalLLMSecrets } from '../../infra/llm.js';
import { RuntimeService } from '../../services/runtime-service.js';
import {
  buildLLMStatusViewModel,
  clearPersistedLLMApiKey,
  resolveLLMTarget,
  saveLLMSetup,
  setPersistedLLMValue,
} from '../../services/llm-admin-service.js';
import { parseLLMMode, LLMMode, PromptPolicyTier } from '../../infra/prompt-policy.js';
import { normalizeOptionalString, printStep, throwCliUsage } from '../cli-utils.js';

export type LLMConfigWriter = Pick<
  Config,
  | 'setLLMProvider'
  | 'setLLMModel'
  | 'setLLMBaseURL'
  | 'setLLMMode'
  | 'setPromptTier'
  | 'setValidatePolicy'
>;
export type LLMSecretsWriter = Pick<Secrets, 'setLLMApiKey' | 'clearLLMApiKey'>;
export type LLMScope = 'global' | 'project';

export interface ExecuteLlmCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
  secrets: Secrets;
  globalLLMConfig: GlobalLLMConfig;
  globalLLMSecrets: GlobalLLMSecrets;
  runtimeService: RuntimeService;
}

const LLM_COMMAND_USAGE = 'Usage: spine llm [--global|--project] [show|setup|set|clear|test]';
const LLM_SET_USAGE =
  'Usage: spine llm [--global|--project] set <provider|model|base-url|api-key|mode> <value>';
const LLM_SET_MODE_USAGE = 'Usage: spine llm [--global|--project] set mode <standard|heavy>';
const LLM_CLEAR_USAGE = 'Usage: spine llm [--global|--project] clear api-key';

function formatEffectiveValue(value: string | undefined, source: string, fallback: string): string {
  return `${value || fallback}${source !== 'unset' ? ` (${source})` : ''}`;
}

function redactDisplayValue(value: string | undefined, kind: 'plain' | 'url'): string | undefined {
  if (!value) {
    return value;
  }
  if (kind === 'url') {
    try {
      const parsed = new URL(value);
      if (parsed.username || parsed.password) {
        parsed.username = parsed.username ? '***' : '';
        parsed.password = parsed.password ? '***' : '';
      }
      return parsed.toString();
    } catch {
      return value.replace(/\/\/([^/@:\s]+)(?::[^@/\s]*)?@/g, '//***:***@');
    }
  }
  return value;
}

function printPersistedStoreStatus(viewModel: ReturnType<typeof buildLLMStatusViewModel>): void {
  console.log('');
  console.log(`Global Store: ${viewModel.persistedStores.global.path}`);
  console.log(`  Provider:   ${viewModel.persistedStores.global.provider || 'unset'}`);
  console.log(`  Model:      ${viewModel.persistedStores.global.model || 'default'}`);
  console.log(
    `  Base URL:   ${redactDisplayValue(viewModel.persistedStores.global.baseURL, 'url') || 'default'}`,
  );
  console.log(`  Mode:       ${viewModel.persistedStores.global.mode || 'unset'}`);
  console.log(
    `  API Key:    ${viewModel.persistedStores.global.apiKeyConfigured ? `configured (${viewModel.persistedStores.global.apiKeyBackend})` : 'missing'}`,
  );
  console.log('');
  console.log(`Project Store: ${viewModel.persistedStores.project.path}`);
  console.log(`  Provider:   ${viewModel.persistedStores.project.provider || 'unset'}`);
  console.log(`  Model:      ${viewModel.persistedStores.project.model || 'default'}`);
  console.log(
    `  Base URL:   ${redactDisplayValue(viewModel.persistedStores.project.baseURL, 'url') || 'default'}`,
  );
  console.log(`  Mode:       ${viewModel.persistedStores.project.mode || 'unset'}`);
  console.log(
    `  API Key:    ${viewModel.persistedStores.project.apiKeyConfigured ? `configured (${viewModel.persistedStores.project.apiKeyBackend})` : 'missing'}`,
  );
}

function handleSetCommand(
  target: { configStore: LLMConfigWriter; secretsStore: LLMSecretsWriter; label: string },
  commandArgs: string[],
): void {
  const key = commandArgs[1];
  const rawValue = normalizeOptionalString(commandArgs[2]);
  if (!key || rawValue === undefined) {
    throwCliUsage(LLM_SET_USAGE);
  }

  switch (key) {
    case 'provider':
      console.log(setPersistedLLMValue(target, 'provider', rawValue));
      return;
    case 'model':
      console.log(setPersistedLLMValue(target, 'model', rawValue));
      return;
    case 'base-url':
      console.log(setPersistedLLMValue(target, 'base-url', rawValue));
      return;
    case 'api-key':
      console.log(setPersistedLLMValue(target, 'api-key', rawValue));
      return;
    case 'mode': {
      const mode = parseLLMMode(rawValue);
      if (!mode) {
        throwCliUsage(LLM_SET_MODE_USAGE);
      }
      console.log(setPersistedLLMValue(target, 'mode', mode));
      return;
    }
    default:
      throwCliUsage(LLM_SET_USAGE);
  }
}

function handleClearCommand(
  target: { secretsStore: LLMSecretsWriter; label: string },
  commandArgs: string[],
): void {
  const key = commandArgs[1];
  if (key !== 'api-key') {
    throwCliUsage(LLM_CLEAR_USAGE);
  }
  console.log(clearPersistedLLMApiKey(target));
}

function handleTestCommand(runtimeService: RuntimeService): void {
  const resolved = runtimeService.getResolvedLLMSettings();
  assertResolvedLLMUsable(resolved, { command: 'llm test' });
  console.log(
    `LLM test passed: provider=${resolved.provider.value}, model=${resolved.model.value || 'default'}, ` +
      `mode=${resolved.mode.value || 'unset'}, apiKey=${resolved.apiKey.value ? 'configured' : 'missing'}.`,
  );
}

export function resolveLLMScope(rawArgs: string[]): { scope: LLMScope; commandArgs: string[] } {
  let scope: LLMScope = 'global';
  const commandArgs = rawArgs.filter((arg) => {
    if (arg === '--project') {
      scope = 'project';
      return false;
    }
    if (arg === '--global') {
      scope = 'global';
      return false;
    }
    return true;
  });
  return { scope, commandArgs };
}

export function getLLMTarget(options: {
  scope: LLMScope;
  rootDir: string;
  config: Config;
  secrets: Secrets;
  globalLLMConfig: GlobalLLMConfig;
  globalLLMSecrets: GlobalLLMSecrets;
}): { configStore: LLMConfigWriter; secretsStore: LLMSecretsWriter; label: string } {
  return resolveLLMTarget(options);
}

export async function promptForLLMSetup(
  configStore: LLMConfigWriter,
  secretsStore: LLMSecretsWriter,
  label: string,
): Promise<boolean> {
  console.log(`Saving LLM settings to ${label}`);
  const providerAnswer = await prompts({
    type: 'select',
    name: 'provider',
    message: 'Choose an LLM provider for semantic sync:',
    choices: parseProviderChoices(),
    initial: 0,
  });

  if (!providerAnswer.provider || providerAnswer.provider === '__skip__') {
    return false;
  }

  const preset = mapProviderPreset(providerAnswer.provider as string);
  const provider = preset.provider;
  const modelAnswer = await prompts({
    type: 'text',
    name: 'model',
    message: 'Model name (leave blank to use provider default):',
    initial: preset.defaultModel,
  });
  const baseURLAnswer =
    preset.requiresBaseURL || preset.defaultBaseURL
      ? await prompts({
          type: 'text',
          name: 'baseURL',
          message: preset.requiresBaseURL
            ? 'Base URL (required for custom OpenAI-compatible providers):'
            : 'Base URL (press Enter to keep the default):',
          initial: preset.defaultBaseURL,
        })
      : { baseURL: undefined };
  const apiKeyAnswer = await prompts({
    type: 'password',
    name: 'apiKey',
    message: preset.defaultApiKey
      ? 'API key (press Enter to keep the suggested local value):'
      : 'API key (leave blank only if this provider does not require one):',
  });
  const modeChoices = getModeChoices('standard');
  const modeAnswer = await prompts({
    type: 'select',
    name: 'mode',
    message: 'Choose a runtime mode:',
    choices: modeChoices,
    initial: 0,
  });

  const selectedMode = modeAnswer.mode as LLMMode;

  saveLLMSetup(
    { configStore, secretsStore, label },
    {
      provider,
      model: normalizeOptionalString(modelAnswer.model) || preset.defaultModel,
      baseURL: normalizeOptionalString(baseURLAnswer.baseURL) || preset.defaultBaseURL,
      apiKey: normalizeOptionalString(apiKeyAnswer.apiKey) || preset.defaultApiKey,
      mode: selectedMode,
      defaultPromptTier: preset.defaultPromptTier,
    },
  );

  printStep(`LLM provider saved: ${provider} (${label})`);
  return true;
}

export function printLLMStatus(options: {
  runtimeService: RuntimeService;
  globalLLMConfig: GlobalLLMConfig;
  globalLLMSecrets: GlobalLLMSecrets;
  config: Config;
  secrets: Secrets;
  rootDir: string;
  verbose?: boolean;
}): void {
  const viewModel = buildLLMStatusViewModel(options);
  const verbose = options.verbose === true;
  console.log('LLM Configuration');
  console.log(
    `  Effective Provider:   ${formatEffectiveValue(redactDisplayValue(viewModel.effectiveProvider.value, 'plain'), viewModel.effectiveProvider.source, 'unset')}`,
  );
  console.log(
    `  Effective Model:      ${formatEffectiveValue(redactDisplayValue(viewModel.effectiveModel.value, 'plain'), viewModel.effectiveModel.source, 'default')}`,
  );
  console.log(
    `  Effective Base URL:   ${formatEffectiveValue(redactDisplayValue(viewModel.effectiveBaseURL.value, 'url'), viewModel.effectiveBaseURL.source, 'default')}`,
  );
  console.log(
    `  Effective API Key:    ${viewModel.effectiveApiKey.configured ? `configured (${viewModel.effectiveApiKey.source})` : 'missing'}`,
  );
  console.log(
    `  Configured Mode:      ${formatEffectiveValue(viewModel.configuredMode.value, viewModel.configuredMode.source, 'unset')}`,
  );
  console.log(`  Effective Sync Mode:  ${viewModel.syncMode.value} (${viewModel.syncMode.source})`);
  console.log(
    `  Effective Check Mode: ${viewModel.checkMode.value} (${viewModel.checkMode.source})`,
  );
  console.log(`  Effective Fix Mode:   ${viewModel.fixMode.value} (${viewModel.fixMode.source})`);
  if (verbose) {
    console.log(
      `  Sync Runtime Detail: ${viewModel.syncMode.value === 'heavy' ? 'high-confidence mode with expanded validation and generation budget' : 'default day-to-day generation mode'}`,
    );
    console.log(
      `  Check Runtime Detail: ${viewModel.checkMode.value === 'heavy' ? 'high-confidence audit mode' : 'default audit mode'}`,
    );
    console.log(
      `  Fix Runtime Detail: ${viewModel.fixMode.value === 'heavy' ? 'high-confidence repair mode' : 'default repair mode'}`,
    );
    printPersistedStoreStatus(viewModel);
  } else {
    console.log(`  Runtime Details:      hidden (use --verbose)`);
  }
}

export function parseProviderChoices() {
  return [
    { title: 'OpenAI', value: 'openai' },
    { title: 'DeepSeek', value: 'deepseek' },
    { title: 'OpenRouter', value: 'openrouter' },
    { title: 'Groq', value: 'groq' },
    { title: 'Gemini', value: 'gemini' },
    { title: 'Ollama', value: 'ollama' },
    { title: 'LM Studio', value: 'lmstudio' },
    { title: 'Custom OpenAI-compatible', value: 'custom-openai' },
    { title: 'Skip for now', value: '__skip__' },
  ];
}

export function mapProviderPreset(selection: string): {
  provider: string;
  defaultModel?: string;
  defaultBaseURL?: string;
  defaultApiKey?: string;
  defaultPromptTier?: PromptPolicyTier;
  requiresBaseURL: boolean;
} {
  switch (selection) {
    case 'openai':
      return { provider: 'openai', requiresBaseURL: false };
    case 'deepseek':
      return {
        provider: 'deepseek',
        defaultBaseURL: 'https://api.deepseek.com',
        requiresBaseURL: false,
      };
    case 'openrouter':
      return {
        provider: 'openrouter',
        defaultBaseURL: 'https://openrouter.ai/api/v1',
        requiresBaseURL: false,
      };
    case 'groq':
      return { provider: 'groq', requiresBaseURL: false };
    case 'gemini':
      return { provider: 'gemini', requiresBaseURL: false };
    case 'ollama':
      return {
        provider: 'openai',
        defaultBaseURL: 'http://127.0.0.1:11434/v1',
        defaultApiKey: 'ollama',
        defaultPromptTier: 'lite',
        requiresBaseURL: false,
      };
    case 'lmstudio':
      return {
        provider: 'openai',
        defaultBaseURL: 'http://127.0.0.1:1234/v1',
        defaultApiKey: 'lm-studio',
        defaultPromptTier: 'lite',
        requiresBaseURL: false,
      };
    case 'custom-openai':
      return { provider: 'openai', requiresBaseURL: true };
    default:
      return { provider: selection, requiresBaseURL: false };
  }
}

export function getModeChoices(selectedMode: LLMMode = 'standard') {
  return [
    {
      title: 'Standard',
      value: 'standard',
      description: 'Default day-to-day generation for incremental sync.',
      selected: selectedMode === 'standard',
    },
    {
      title: 'Heavy',
      value: 'heavy',
      description: 'Slower and costlier, but more robust for high-confidence sync and checks.',
      selected: selectedMode === 'heavy',
    },
  ];
}

export async function executeLlmCommand(options: ExecuteLlmCommandOptions): Promise<void> {
  const { args, rootDir, config, secrets, globalLLMConfig, globalLLMSecrets, runtimeService } =
    options;
  const llmArgs = resolveLLMScope(args);
  const llmAction = llmArgs.commandArgs[0];
  const llmTarget = getLLMTarget({
    scope: llmArgs.scope,
    rootDir,
    config,
    secrets,
    globalLLMConfig,
    globalLLMSecrets,
  });

  if (!llmAction || llmAction === 'show') {
    printLLMStatus({
      runtimeService,
      globalLLMConfig,
      globalLLMSecrets,
      config,
      secrets,
      rootDir,
      verbose: llmArgs.commandArgs.includes('--verbose'),
    });
  } else if (llmAction === 'setup') {
    await promptForLLMSetup(llmTarget.configStore, llmTarget.secretsStore, llmTarget.label);
  } else if (llmAction === 'set') {
    handleSetCommand(llmTarget, llmArgs.commandArgs);
  } else if (llmAction === 'clear') {
    handleClearCommand(llmTarget, llmArgs.commandArgs);
  } else if (llmAction === 'test') {
    handleTestCommand(runtimeService);
  } else {
    console.log(LLM_COMMAND_USAGE);
  }
}
