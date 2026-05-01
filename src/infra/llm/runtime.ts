import { Config } from '../config.js';
import { Secrets } from '../secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets } from './global.js';
import { LLMClient, ProviderConfig } from './base.js';
import { LLMFactory } from './factory.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';
import type {
  GenerationFlow,
  GenerationStrategy,
  LLMMode,
  PromptPolicyTier,
  PromptProfile,
  ValidatePolicy,
  ValidationProfile,
} from '../prompt-policy.js';
import { parseLLMMode, parsePromptPolicyTier, parseValidatePolicy } from '../prompt-policy.js';

/**
 * This module is intentionally limited to configuration resolution and provider
 * client creation. Future runtime orchestration belongs in services/runtime-service.ts.
 */
export interface ResolvedLLMValue<T> {
  value?: T;
  source:
    | 'runtime-override'
    | 'env'
    | 'project-config'
    | 'global-config'
    | 'project-keychain'
    | 'global-keychain'
    | 'project-secrets-file'
    | 'global-secrets-file'
    | 'default'
    | 'unset';
}

export interface LLMRuntimeOverrides {
  mode?: LLMMode;
  promptTier?: PromptPolicyTier;
  generationFlow?: GenerationFlow;
  generationStrategy?: GenerationStrategy;
}

export interface ResolvedLLMSettings {
  provider: ResolvedLLMValue<string>;
  model: ResolvedLLMValue<string>;
  baseURL: ResolvedLLMValue<string>;
  apiKey: ResolvedLLMValue<string>;
  mode: ResolvedLLMValue<LLMMode>;
  promptTier: ResolvedLLMValue<PromptPolicyTier>;
  promptProfile: ResolvedLLMValue<PromptProfile>;
  validatePolicy: ResolvedLLMValue<ValidatePolicy>;
  validationProfile: ResolvedLLMValue<ValidationProfile>;
  generationFlow: ResolvedLLMValue<GenerationFlow>;
  generationStrategy: ResolvedLLMValue<GenerationStrategy>;
}

export function providerRequiresApiKey(provider: string | undefined): boolean {
  if (!provider) {
    return false;
  }

  return provider.toLowerCase() !== 'mock';
}

export function assertResolvedLLMUsable(
  resolved: ResolvedLLMSettings,
  context: { command: string },
): void {
  if (!resolved.provider.value) {
    throw new ArchSpineError(
      ErrorCodes.LlmProviderMissing,
      `LLM provider is not configured for "${context.command}". Run "spine llm setup" first.`,
      { exitCode: 1, context },
    );
  }

  if (providerRequiresApiKey(resolved.provider.value) && !resolved.apiKey.value) {
    throw new ArchSpineError(
      ErrorCodes.LlmApiKeyMissing,
      `LLM API key is not configured for provider "${resolved.provider.value}". Configure it with "spine llm --global set api-key <key>" or "spine llm --project set api-key <key>".`,
      {
        exitCode: 1,
        context: {
          ...context,
          provider: resolved.provider.value,
          providerSource: resolved.provider.source,
        },
      },
    );
  }
}

type RuntimeConfigSource = 'runtime-override' | 'project-config' | 'global-config' | 'env';

const RUNTIME_CONFIG_SOURCES: RuntimeConfigSource[] = [
  'runtime-override',
  'project-config',
  'global-config',
  'env',
];

function resolveString(
  projectValue: string | undefined,
  globalValue: string | undefined,
  envValue: string | undefined,
): ResolvedLLMValue<string> {
  if (typeof projectValue === 'string' && projectValue.trim() !== '') {
    return { value: projectValue, source: 'project-config' };
  }

  if (typeof globalValue === 'string' && globalValue.trim() !== '') {
    return { value: globalValue, source: 'global-config' };
  }

  if (typeof envValue === 'string' && envValue.trim() !== '') {
    return { value: envValue, source: 'env' };
  }

  return { source: 'unset' };
}

function resolvePromptTier(
  projectValue: string | undefined,
  globalValue: string | undefined,
  envValue: string | undefined,
  resolvedMode: ResolvedLLMValue<LLMMode>,
  overrideTier?: PromptPolicyTier,
): ResolvedLLMValue<PromptPolicyTier> {
  if (overrideTier) {
    return { value: overrideTier, source: 'runtime-override' };
  }

  if (resolvedMode.value && resolvedMode.source === 'runtime-override') {
    return { value: 'balanced', source: 'runtime-override' };
  }

  const projectTier = parsePromptPolicyTier(projectValue);
  if (projectTier) {
    return { value: projectTier, source: 'project-config' };
  }

  if (resolvedMode.value && resolvedMode.source === 'project-config') {
    return { value: 'balanced', source: 'project-config' };
  }

  const globalTier = parsePromptPolicyTier(globalValue);
  if (globalTier) {
    return { value: globalTier, source: 'global-config' };
  }

  if (resolvedMode.value && resolvedMode.source === 'global-config') {
    return { value: 'balanced', source: 'global-config' };
  }

  const envTier = parsePromptPolicyTier(envValue);
  if (envTier) {
    return { value: envTier, source: 'env' };
  }

  if (resolvedMode.value && resolvedMode.source === 'env') {
    return { value: 'balanced', source: 'env' };
  }

  return { source: 'unset' };
}

function resolveModeSetting(input: {
  overrideMode?: LLMMode;
  projectMode?: string;
  globalMode?: string;
  envMode?: string;
}): ResolvedLLMValue<LLMMode> {
  if (input.overrideMode) {
    return { value: input.overrideMode, source: 'runtime-override' };
  }

  const projectMode = parseLLMMode(input.projectMode);
  if (projectMode) {
    return { value: projectMode, source: 'project-config' };
  }

  const globalMode = parseLLMMode(input.globalMode);
  if (globalMode) {
    return { value: globalMode, source: 'global-config' };
  }

  const envMode = parseLLMMode(input.envMode);
  if (envMode) {
    return { value: envMode, source: 'env' };
  }

  return { source: 'unset' };
}

function getResolvedValueForSource<T>(
  resolved: ResolvedLLMValue<T>,
  source: RuntimeConfigSource,
): T | undefined {
  return resolved.source === source ? resolved.value : undefined;
}

function deriveValidatePolicyFromMode(mode: LLMMode | undefined): ValidatePolicy | undefined {
  if (mode === 'heavy') {
    return 'strict';
  }
  if (mode === 'standard') {
    return 'default';
  }
  return undefined;
}

function deriveGenerationFlowFromMode(mode: LLMMode | undefined): GenerationFlow | undefined {
  if (mode === 'heavy') {
    return 'semantic-first';
  }
  if (mode === 'standard') {
    return 'together';
  }
  return undefined;
}

function resolveValidatePolicySetting(
  projectValue: string | undefined,
  globalValue: string | undefined,
  envValue: string | undefined,
  resolvedMode: ResolvedLLMValue<LLMMode>,
): ResolvedLLMValue<ValidatePolicy> {
  const policiesBySource: Partial<
    Record<Exclude<RuntimeConfigSource, 'runtime-override'>, string | undefined>
  > = {
    'project-config': projectValue,
    'global-config': globalValue,
    env: envValue,
  };

  for (const source of RUNTIME_CONFIG_SOURCES) {
    if (source !== 'runtime-override') {
      const explicitPolicy = parseValidatePolicy(policiesBySource[source]);
      if (explicitPolicy) {
        return { value: explicitPolicy, source };
      }
    }

    const derivedFromMode = deriveValidatePolicyFromMode(
      getResolvedValueForSource(resolvedMode, source),
    );
    if (derivedFromMode) {
      return { value: derivedFromMode, source };
    }
  }

  return { source: 'unset' };
}

function resolveGenerationFlowSetting(
  resolvedMode: ResolvedLLMValue<LLMMode>,
  overrideFlow?: GenerationFlow,
): ResolvedLLMValue<GenerationFlow> {
  if (overrideFlow) {
    return { value: overrideFlow, source: 'runtime-override' };
  }

  for (const source of RUNTIME_CONFIG_SOURCES) {
    const derivedFromMode = deriveGenerationFlowFromMode(
      getResolvedValueForSource(resolvedMode, source),
    );
    if (derivedFromMode) {
      return { value: derivedFromMode, source };
    }
  }

  return { source: 'unset' };
}

export function resolveLLMSettings(
  config: Config,
  secrets: Secrets,
  globalConfig: GlobalLLMConfig = new GlobalLLMConfig(),
  globalSecrets: GlobalLLMSecrets = new GlobalLLMSecrets(),
  overrides: LLMRuntimeOverrides = {},
): ResolvedLLMSettings {
  const provider = resolveString(
    config.getLLMProvider(),
    globalConfig.getLLMProvider(),
    process.env.SPINE_PROVIDER,
  );
  const model = resolveString(
    config.getLLMModel(),
    globalConfig.getLLMModel(),
    process.env.SPINE_MODEL,
  );
  const baseURL = resolveString(
    config.getLLMBaseURL(),
    globalConfig.getLLMBaseURL(),
    process.env.SPINE_BASE_URL,
  );
  const projectMode = config.getLLMMode();
  const globalMode = globalConfig.getLLMMode();
  const projectPromptTier = config.getPromptTier();
  const globalPromptTier = globalConfig.getPromptTier();
  const projectValidatePolicy = config.getValidatePolicy();
  const globalValidatePolicy = globalConfig.getValidatePolicy();
  const mode = resolveModeSetting({
    overrideMode: overrides.mode,
    projectMode,
    globalMode,
    envMode: process.env.SPINE_MODE,
  });
  const promptTier = resolvePromptTier(
    projectPromptTier,
    globalPromptTier,
    process.env.SPINE_PROMPT_TIER,
    mode,
    overrides.promptTier,
  );
  const validatePolicy = resolveValidatePolicySetting(
    projectValidatePolicy,
    globalValidatePolicy,
    process.env.SPINE_VALIDATE_POLICY,
    mode,
  );
  const generationFlow = resolveGenerationFlowSetting(mode, overrides.generationFlow);
  const generationStrategy: ResolvedLLMValue<GenerationStrategy> = overrides.generationStrategy
    ? { value: overrides.generationStrategy, source: 'runtime-override' }
    : generationFlow;

  let apiKey: ResolvedLLMValue<string>;
  if (secrets.hasLLMApiKey()) {
    apiKey = {
      value: secrets.getLLMApiKey(),
      source:
        secrets.getLLMApiKeySource() === 'keychain' ? 'project-keychain' : 'project-secrets-file',
    };
  } else if (globalSecrets.hasLLMApiKey()) {
    apiKey = {
      value: globalSecrets.getLLMApiKey(),
      source:
        globalSecrets.getLLMApiKeySource() === 'keychain'
          ? 'global-keychain'
          : 'global-secrets-file',
    };
  } else if (
    typeof process.env.SPINE_API_KEY === 'string' &&
    process.env.SPINE_API_KEY.trim() !== ''
  ) {
    apiKey = { value: process.env.SPINE_API_KEY, source: 'env' };
  } else {
    apiKey = { source: 'unset' };
  }

  return {
    provider,
    model,
    baseURL,
    apiKey,
    mode,
    promptTier,
    promptProfile: promptTier,
    validatePolicy,
    validationProfile: validatePolicy,
    generationFlow,
    generationStrategy,
  };
}

export function createResolvedLLMClient(
  config: Config,
  secrets: Secrets,
  globalConfig: GlobalLLMConfig = new GlobalLLMConfig(),
  globalSecrets: GlobalLLMSecrets = new GlobalLLMSecrets(),
  overrides: LLMRuntimeOverrides = {},
): {
  llmClient?: LLMClient;
  resolved: ResolvedLLMSettings;
  providerConfig?: ProviderConfig;
} {
  const resolved = resolveLLMSettings(config, secrets, globalConfig, globalSecrets, overrides);
  const provider = resolved.provider.value;
  if (!provider) {
    return { resolved };
  }

  if (providerRequiresApiKey(provider) && !resolved.apiKey.value) {
    throw new ArchSpineError(
      ErrorCodes.LlmApiKeyMissing,
      `LLM API key is not configured for provider "${provider}". Configure it with "spine llm --global set api-key <key>" or "spine llm --project set api-key <key>".`,
      {
        exitCode: 1,
        context: {
          command: 'runtime',
          provider,
          providerSource: resolved.provider.source,
        },
      },
    );
  }

  const timeoutEnv = process.env.SPINE_LLM_TIMEOUT;
  const timeoutMs = timeoutEnv ? parseInt(timeoutEnv, 10) : undefined;

  const providerConfig: ProviderConfig = {
    apiKey: resolved.apiKey.value || '',
    model: resolved.model.value,
    baseURL: resolved.baseURL.value,
    generationStrategy: resolved.generationStrategy.value || 'together',
    ...(timeoutMs && !isNaN(timeoutMs) ? { timeoutMs } : {}),
  };

  return {
    llmClient: LLMFactory.createClient(provider, providerConfig),
    resolved,
    providerConfig,
  };
}
