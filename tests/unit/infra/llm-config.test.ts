import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  CredentialBackend,
  MemoryCredentialBackend,
} from '../../../src/infra/credentials/backend.js';
import { Config } from '../../../src/infra/config.js';
import { Secrets } from '../../../src/infra/secrets.js';
import { GlobalLLMConfig, GlobalLLMSecrets, resolveLLMSettings } from '../../../src/infra/llm.js';

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
    secrets.setLLMApiKey('secret-token');

    const resolved = resolveLLMSettings(new Config(testDir), new Secrets(testDir, backend));

    expect(resolved.provider.value).toBe('openai');
    expect(resolved.provider.source).toBe('project-config');
    expect(resolved.model.value).toBe('gpt-4o-mini');
    expect(resolved.baseURL.value).toBe('https://example.invalid/v1');
    expect(resolved.apiKey.value).toBe('secret-token');
    expect(resolved.apiKey.source).toBe('project-keychain');
    expect(resolved.generationStrategy.value).toBe('together');
    expect(resolved.generationStrategy.source).toBe('default');
  });

  it('prefers persisted llm settings over environment overrides', () => {
    const config = new Config(testDir);
    const secrets = new Secrets(testDir, new MemoryCredentialBackend());

    config.setLLMProvider('gemini');
    config.setLLMModel('gemini-1.5-pro');
    config.setLLMBaseURL('https://project.example/v1');
    secrets.setLLMApiKey('persisted-secret');

    process.env.SPINE_PROVIDER = 'openrouter';
    process.env.SPINE_MODEL = 'meta-llama';
    process.env.SPINE_BASE_URL = 'https://openrouter.ai/api/v1';
    process.env.SPINE_API_KEY = 'env-secret';

    const resolved = resolveLLMSettings(config, secrets);

    expect(resolved.provider.value).toBe('gemini');
    expect(resolved.provider.source).toBe('project-config');
    expect(resolved.model.value).toBe('gemini-1.5-pro');
    expect(resolved.model.source).toBe('project-config');
    expect(resolved.baseURL.value).toBe('https://project.example/v1');
    expect(resolved.baseURL.source).toBe('project-config');
    expect(resolved.apiKey.value).toBe('persisted-secret');
    expect(resolved.apiKey.source).toBe('project-keychain');
    expect(resolved.generationStrategy.value).toBe('together');
    expect(resolved.generationStrategy.source).toBe('default');
  });

  it('falls back to environment values when no persisted settings exist', () => {
    process.env.SPINE_PROVIDER = 'openrouter';
    process.env.SPINE_MODEL = 'meta-llama';
    process.env.SPINE_BASE_URL = 'https://openrouter.ai/api/v1';
    process.env.SPINE_API_KEY = 'env-secret';

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
    expect(resolved.generationStrategy.value).toBe('together');
    expect(resolved.generationStrategy.source).toBe('default');
  });

  it('falls back to global llm settings when the project has no local provider', () => {
    const globalConfig = new GlobalLLMConfig();
    const globalSecrets = new GlobalLLMSecrets(undefined, new MemoryCredentialBackend());

    globalConfig.setLLMProvider('deepseek');
    globalConfig.setLLMModel('deepseek-chat');
    globalConfig.setLLMBaseURL('https://api.deepseek.com');
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
    expect(resolved.generationStrategy.value).toBe('together');
    expect(resolved.generationStrategy.source).toBe('default');
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

  it('maps validate policy from config with default generation strategy', () => {
    const config = new Config(testDir);

    const resolved = resolveLLMSettings(
      config,
      new Secrets(testDir, new UnavailableCredentialBackend()),
    );

    expect(resolved.generationStrategy.value).toBe('together');
    expect(resolved.generationStrategy.source).toBe('default');
  });

  it('allows runtime overrides to take precedence over config', () => {
    const config = new Config(testDir);

    const resolved = resolveLLMSettings(
      config,
      new Secrets(testDir, new UnavailableCredentialBackend()),
      new GlobalLLMConfig(),
      new GlobalLLMSecrets(),
      { generationStrategy: 'json-only' },
    );

    expect(resolved.generationStrategy.value).toBe('json-only');
    expect(resolved.generationStrategy.source).toBe('runtime-override');
  });
});
