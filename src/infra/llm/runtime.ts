import { Config } from '../config.js';
import { Secrets } from '../secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets } from './global.js';
import { LLMClient, ProviderConfig } from './base.js';
import { LLMFactory } from './factory.js';
import { LLMOrchestrator } from './orchestrator.js';
import { MockClient } from './providers/mock.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';
import type { GenerationStrategy } from '../prompt-policy.js';

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
  generationStrategy?: GenerationStrategy;
}

export interface ResolvedLLMSettings {
  provider: ResolvedLLMValue<string>;
  model: ResolvedLLMValue<string>;
  baseURL: ResolvedLLMValue<string>;
  apiKey: ResolvedLLMValue<string>;
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
  const generationStrategy: ResolvedLLMValue<GenerationStrategy> = overrides.generationStrategy
    ? { value: overrides.generationStrategy, source: 'runtime-override' }
    : { value: 'together', source: 'default' };

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

  let llmClient: LLMClient;
  if (provider === 'mock') {
    llmClient = new MockClient(providerConfig);
  } else {
    const transport = LLMFactory.createTransport(provider, providerConfig);
    llmClient = new LLMOrchestrator(transport, providerConfig.generationStrategy || 'together');
  }

  return {
    llmClient,
    resolved,
    providerConfig,
  };
}
