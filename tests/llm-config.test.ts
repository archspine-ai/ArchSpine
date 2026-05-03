import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CredentialBackend, MemoryCredentialBackend } from '../src/infra/credentials/backend.js';
import { Config } from '../src/infra/config.js';
import { Secrets } from '../src/infra/secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets, resolveLLMSettings } from '../src/infra/llm.js';

class UnavailableCredentialBackend implements CredentialBackend {
  readonly name = 'keychain';

  isAvailable(): boolean {
    return false;
  }

  get(_secretName: string, _account: string): string | undefined {
    return undefined;
  }

  set(_secretName: string, _account: string, _secret: string): void {}

  delete(_secretName: string, _account: string): void {}
}

describe('LLM configuration resolution', () => {
  let testDir: string;
  let globalDir: string;
  const originalEnv = {
    SPINE_PROVIDER: process.env.SPINE_PROVIDER,
    SPINE_MODEL: process.env.SPINE_MODEL,
    SPINE_BASE_URL: process.env.SPINE_BASE_URL,
    SPINE_API_KEY: process.env.SPINE_API_KEY,
    SPINE_MODE: process.env.SPINE_MODE,
    SPINE_PROMPT_TIER: process.env.SPINE_PROMPT_TIER,
    SPINE_VALIDATE_POLICY: process.env.SPINE_VALIDATE_POLICY,
    SPINE_LITE_MODE: process.env.SPINE_LITE_MODE,
    SPINE_VALIDATE_EXPERIMENTAL_SPLIT_STAGE: process.env.SPINE_VALIDATE_EXPERIMENTAL_SPLIT_STAGE,
    XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME,
  };

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-llm-config-'));
    globalDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-global-config-'));
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    delete process.env.SPINE_PROVIDER;
    delete process.env.SPINE_MODEL;
    delete process.env.SPINE_BASE_URL;
    delete process.env.SPINE_API_KEY;
    delete process.env.SPINE_MODE;
    delete process.env.SPINE_PROMPT_TIER;
    delete process.env.SPINE_VALIDATE_POLICY;
    delete process.env.SPINE_LITE_MODE;
    delete process.env.SPINE_VALIDATE_EXPERIMENTAL_SPLIT_STAGE;
    process.env.XDG_CONFIG_HOME = globalDir;
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    if (globalDir && fs.existsSync(globalDir)) {
      fs.rmSync(globalDir, { recursive: true, force: true });
    }
  });

  it('reads provider metadata from persisted config and api key from secrets', () => {
    const backend = new MemoryCredentialBackend();
    const config = new Config(testDir);
    const secrets = new Secrets(testDir, backend);

    config.setLLMProvider('openai');
    config.setLLMModel('gpt-4o-mini');
    config.setLLMBaseURL('https://example.invalid/v1');
    config.setLLMMode('heavy');
    config.setPromptTier('balanced');
    config.setValidatePolicy('strict');
    secrets.setLLMApiKey('secret-token');

    const resolved = resolveLLMSettings(new Config(testDir), new Secrets(testDir, backend));

    expect(resolved.provider.value).toBe('openai');
    expect(resolved.provider.source).toBe('project-config');
    expect(resolved.model.value).toBe('gpt-4o-mini');
    expect(resolved.baseURL.value).toBe('https://example.invalid/v1');
    expect(resolved.apiKey.value).toBe('secret-token');
    expect(resolved.apiKey.source).toBe('project-keychain');
    expect(resolved.mode.value).toBe('heavy');
    expect(resolved.mode.source).toBe('project-config');
    expect(resolved.promptTier.value).toBe('balanced');
    expect(resolved.promptProfile.value).toBe('balanced');
    expect(resolved.validatePolicy.value).toBe('strict');
    expect(resolved.validationProfile.value).toBe('strict');
    expect(resolved.generationFlow.value).toBe('semantic-first');
    expect(resolved.generationStrategy.value).toBe('semantic-first');
  });

  it('prefers persisted llm settings over environment overrides', () => {
    const config = new Config(testDir);
    const secrets = new Secrets(testDir, new MemoryCredentialBackend());

    config.setLLMProvider('gemini');
    config.setLLMModel('gemini-1.5-pro');
    config.setLLMBaseURL('https://project.example/v1');
    config.setLLMMode('standard');
    config.setPromptTier('balanced');
    config.setValidatePolicy('default');
    secrets.setLLMApiKey('persisted-secret');

    process.env.SPINE_PROVIDER = 'openrouter';
    process.env.SPINE_MODEL = 'meta-llama';
    process.env.SPINE_BASE_URL = 'https://openrouter.ai/api/v1';
    process.env.SPINE_API_KEY = 'env-secret';
    process.env.SPINE_MODE = 'heavy';
    process.env.SPINE_PROMPT_TIER = 'lite';
    process.env.SPINE_VALIDATE_POLICY = 'strict';

    const resolved = resolveLLMSettings(config, secrets);

    expect(resolved.provider.value).toBe('gemini');
    expect(resolved.provider.source).toBe('project-config');
    expect(resolved.model.value).toBe('gemini-1.5-pro');
    expect(resolved.model.source).toBe('project-config');
    expect(resolved.baseURL.value).toBe('https://project.example/v1');
    expect(resolved.baseURL.source).toBe('project-config');
    expect(resolved.apiKey.value).toBe('persisted-secret');
    expect(resolved.apiKey.source).toBe('project-keychain');
    expect(resolved.mode.value).toBe('standard');
    expect(resolved.mode.source).toBe('project-config');
    expect(resolved.promptTier.value).toBe('balanced');
    expect(resolved.promptTier.source).toBe('project-config');
    expect(resolved.validatePolicy.value).toBe('default');
    expect(resolved.validatePolicy.source).toBe('project-config');
    expect(resolved.generationFlow.value).toBe('together');
    expect(resolved.generationFlow.source).toBe('project-config');
    expect(resolved.generationStrategy.value).toBe('together');
    expect(resolved.generationStrategy.source).toBe('project-config');
  });

  it('falls back to environment values when no persisted settings exist', () => {
    process.env.SPINE_PROVIDER = 'openrouter';
    process.env.SPINE_MODEL = 'meta-llama';
    process.env.SPINE_BASE_URL = 'https://openrouter.ai/api/v1';
    process.env.SPINE_API_KEY = 'env-secret';
    process.env.SPINE_MODE = 'heavy';
    process.env.SPINE_PROMPT_TIER = 'balanced';
    process.env.SPINE_VALIDATE_POLICY = 'strict';

    const resolved = resolveLLMSettings(
      new Config(testDir),
      new Secrets(testDir, new UnavailableCredentialBackend()),
    );

    expect(resolved.provider.value).toBe('openrouter');
    expect(resolved.provider.source).toBe('env');
    expect(resolved.model.value).toBe('meta-llama');
    expect(resolved.model.source).toBe('env');
    expect(resolved.baseURL.value).toBe('https://openrouter.ai/api/v1');
    expect(resolved.baseURL.source).toBe('env');
    expect(resolved.apiKey.value).toBe('env-secret');
    expect(resolved.apiKey.source).toBe('env');
    expect(resolved.mode.value).toBe('heavy');
    expect(resolved.mode.source).toBe('env');
    expect(resolved.promptTier.value).toBe('balanced');
    expect(resolved.promptTier.source).toBe('env');
    expect(resolved.validatePolicy.value).toBe('strict');
    expect(resolved.validatePolicy.source).toBe('env');
    expect(resolved.generationFlow.value).toBe('semantic-first');
    expect(resolved.generationFlow.source).toBe('env');
    expect(resolved.generationStrategy.value).toBe('semantic-first');
    expect(resolved.generationStrategy.source).toBe('env');
  });

  it('falls back to global llm settings when the project has no local provider', () => {
    const globalConfig = new GlobalLLMConfig();
    const globalSecrets = new GlobalLLMSecrets(undefined, new MemoryCredentialBackend());

    globalConfig.setLLMProvider('deepseek');
    globalConfig.setLLMModel('deepseek-chat');
    globalConfig.setLLMBaseURL('https://api.deepseek.com');
    globalConfig.setLLMMode('heavy');
    globalConfig.setPromptTier('balanced');
    globalConfig.setValidatePolicy('strict');
    globalSecrets.setLLMApiKey('global-secret');

    const resolved = resolveLLMSettings(
      new Config(testDir),
      new Secrets(testDir, new MemoryCredentialBackend()),
      globalConfig,
      globalSecrets,
    );

    expect(resolved.provider.value).toBe('deepseek');
    expect(resolved.provider.source).toBe('global-config');
    expect(resolved.model.value).toBe('deepseek-chat');
    expect(resolved.baseURL.value).toBe('https://api.deepseek.com');
    expect(resolved.apiKey.value).toBe('global-secret');
    expect(resolved.apiKey.source).toBe('global-keychain');
    expect(resolved.mode.value).toBe('heavy');
    expect(resolved.mode.source).toBe('global-config');
    expect(resolved.promptTier.value).toBe('balanced');
    expect(resolved.promptTier.source).toBe('global-config');
    expect(resolved.validatePolicy.value).toBe('strict');
    expect(resolved.validatePolicy.source).toBe('global-config');
    expect(resolved.generationFlow.value).toBe('semantic-first');
    expect(resolved.generationFlow.source).toBe('global-config');
    expect(resolved.generationStrategy.value).toBe('semantic-first');
    expect(resolved.generationStrategy.source).toBe('global-config');
  });

  it('prefers project settings over global defaults', () => {
    const globalConfig = new GlobalLLMConfig();
    const globalSecrets = new GlobalLLMSecrets(undefined, new MemoryCredentialBackend());
    globalConfig.setLLMProvider('gemini');
    globalSecrets.setLLMApiKey('global-secret');

    const config = new Config(testDir);
    const secrets = new Secrets(testDir, new MemoryCredentialBackend());
    config.setLLMProvider('openrouter');
    secrets.setLLMApiKey('project-secret');

    const resolved = resolveLLMSettings(config, secrets, globalConfig, globalSecrets);

    expect(resolved.provider.value).toBe('openrouter');
    expect(resolved.provider.source).toBe('project-config');
    expect(resolved.apiKey.value).toBe('project-secret');
    expect(resolved.apiKey.source).toBe('project-keychain');
  });

  it('maps explicit standard mode to default validate policy and together flow', () => {
    const config = new Config(testDir);
    config.setLLMMode('standard');

    const resolved = resolveLLMSettings(
      config,
      new Secrets(testDir, new UnavailableCredentialBackend()),
    );

    expect(resolved.mode.value).toBe('standard');
    expect(resolved.mode.source).toBe('project-config');
    expect(resolved.validatePolicy.value).toBe('default');
    expect(resolved.validatePolicy.source).toBe('project-config');
    expect(resolved.validationProfile.value).toBe('default');
    expect(resolved.validationProfile.source).toBe('project-config');
    expect(resolved.generationFlow.value).toBe('together');
    expect(resolved.generationFlow.source).toBe('project-config');
    expect(resolved.generationStrategy.value).toBe('together');
    expect(resolved.generationStrategy.source).toBe('project-config');
  });

  it('prefers explicit validate policy over the mode-derived default', () => {
    const config = new Config(testDir);
    config.setLLMMode('heavy');
    config.setValidatePolicy('default');

    const resolved = resolveLLMSettings(
      config,
      new Secrets(testDir, new UnavailableCredentialBackend()),
    );

    expect(resolved.mode.value).toBe('heavy');
    expect(resolved.validatePolicy.value).toBe('default');
    expect(resolved.validatePolicy.source).toBe('project-config');
    expect(resolved.generationFlow.value).toBe('semantic-first');
    expect(resolved.generationFlow.source).toBe('project-config');
  });
});
