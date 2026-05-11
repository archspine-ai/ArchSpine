import { Config } from '../infra/config.js';
import { Secrets } from '../infra/secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets, getGlobalArchSpineDir } from '../infra/llm.js';
import { RuntimeService } from './runtime-service.js';
type LLMConfigStore = Pick<Config, 'setLLMProvider' | 'setLLMModel' | 'setLLMBaseURL'>;

type LLMSecretsStore = Pick<Secrets, 'setLLMApiKey' | 'clearLLMApiKey'>;

export type LLMScope = 'global' | 'project';

export interface LLMCommandTarget {
  configStore: LLMConfigStore;
  secretsStore: LLMSecretsStore;
  label: string;
}

export interface LLMSetupValues {
  provider: string;
  model?: string;
  baseURL?: string;
  apiKey?: string;
}

export interface LLMStatusViewModel {
  effectiveProvider: { value?: string; source: string };
  effectiveModel: { value?: string; source: string };
  effectiveBaseURL: { value?: string; source: string };
  effectiveApiKey: { configured: boolean; source: string };
  persistedStores: {
    global: {
      path: string;
      provider?: string;
      model?: string;
      baseURL?: string;
      apiKeyConfigured: boolean;
      apiKeyBackend: string;
    };
    project: {
      path: string;
      provider?: string;
      model?: string;
      baseURL?: string;
      apiKeyConfigured: boolean;
      apiKeyBackend: string;
    };
  };
}

export function resolveLLMTarget(options: {
  scope: LLMScope;
  rootDir: string;
  config: Config;
  secrets: Secrets;
  globalLLMConfig: GlobalLLMConfig;
  globalLLMSecrets: GlobalLLMSecrets;
}): LLMCommandTarget {
  const { scope, rootDir, config, secrets, globalLLMConfig, globalLLMSecrets } = options;
  if (scope === 'project') {
    return {
      configStore: config,
      secretsStore: secrets,
      label: `${rootDir}/.spine`,
    };
  }

  return {
    configStore: globalLLMConfig,
    secretsStore: globalLLMSecrets,
    label: getGlobalArchSpineDir(),
  };
}

export function setPersistedLLMValue(
  target: LLMCommandTarget,
  key: 'provider' | 'model' | 'base-url' | 'api-key',
  value: string,
): string {
  switch (key) {
    case 'provider':
      target.configStore.setLLMProvider(String(value));
      return `Updated LLM provider to ${value} in ${target.label}.`;
    case 'model':
      target.configStore.setLLMModel(String(value));
      return `Updated LLM model in ${target.label}.`;
    case 'base-url':
      target.configStore.setLLMBaseURL(String(value));
      return `Updated LLM base URL in ${target.label}.`;
    case 'api-key':
      target.secretsStore.setLLMApiKey(String(value));
      return `Updated LLM API key in ${target.label}.`;
  }
}

export function clearPersistedLLMApiKey(
  target: Pick<LLMCommandTarget, 'secretsStore' | 'label'>,
): string {
  target.secretsStore.clearLLMApiKey();
  return `Cleared persisted LLM API key in ${target.label}.`;
}

export function saveLLMSetup(
  target: LLMCommandTarget,
  values: LLMSetupValues,
): { provider: string } {
  target.configStore.setLLMProvider(values.provider);
  target.configStore.setLLMModel(values.model);
  target.configStore.setLLMBaseURL(values.baseURL);

  if (values.apiKey) {
    target.secretsStore.setLLMApiKey(values.apiKey);
  } else {
    target.secretsStore.clearLLMApiKey();
  }

  return { provider: values.provider };
}

export function buildLLMStatusViewModel(options: {
  runtimeService: RuntimeService;
  globalLLMConfig: GlobalLLMConfig;
  globalLLMSecrets: GlobalLLMSecrets;
  config: Config;
  secrets: Secrets;
  rootDir: string;
}): LLMStatusViewModel {
  const { runtimeService, globalLLMConfig, globalLLMSecrets, config, secrets, rootDir } = options;
  const resolved = runtimeService.getResolvedLLMSettings();

  return {
    effectiveProvider: resolved.provider,
    effectiveModel: resolved.model,
    effectiveBaseURL: resolved.baseURL,
    effectiveApiKey: {
      configured: Boolean(resolved.apiKey.value),
      source: resolved.apiKey.source,
    },
    persistedStores: {
      global: {
        path: getGlobalArchSpineDir(),
        provider: globalLLMConfig.getLLMProvider(),
        model: globalLLMConfig.getLLMModel(),
        baseURL: globalLLMConfig.getLLMBaseURL(),
        apiKeyConfigured: globalLLMSecrets.hasLLMApiKey(),
        apiKeyBackend: globalLLMSecrets.getCredentialBackendName(),
      },
      project: {
        path: `${rootDir}/.spine`,
        provider: config.getLLMProvider(),
        model: config.getLLMModel(),
        baseURL: config.getLLMBaseURL(),
        apiKeyConfigured: secrets.hasLLMApiKey(),
        apiKeyBackend: secrets.getCredentialBackendName(),
      },
    },
  };
}
