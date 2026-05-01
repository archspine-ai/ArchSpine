import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Config } from '../src/infra/config.js';
import { Secrets } from '../src/infra/secrets.js';
import { MemoryCredentialBackend } from '../src/infra/credentials/backend.js';
import { GlobalLLMConfig, GlobalLLMSecrets } from '../src/infra/llm.js';
import { RuntimeService } from '../src/services/runtime-service.js';
import { resolveExecutionProfileFromSettings } from '../src/services/runtime-execution-profile.js';
import { ErrorCodes } from '../src/core/errors.js';

describe('RuntimeService', () => {
  let testDir: string;
  let globalDir: string;
  let config: Config;
  let secrets: Secrets;
  let globalConfig: GlobalLLMConfig;
  let globalSecrets: GlobalLLMSecrets;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-runtime-service-'));
    globalDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-runtime-service-global-'));
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    config = new Config(testDir);
    secrets = new Secrets(testDir, new MemoryCredentialBackend());
    globalConfig = new GlobalLLMConfig(globalDir);
    globalSecrets = new GlobalLLMSecrets(globalDir, new MemoryCredentialBackend());
    delete process.env.SPINE_PROVIDER;
    delete process.env.SPINE_MODEL;
    delete process.env.SPINE_BASE_URL;
    delete process.env.SPINE_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.SPINE_EXPERIMENTAL_VIEW_LAYER;
  });

  afterEach(() => {
    delete process.env.SPINE_PROVIDER;
    delete process.env.SPINE_MODEL;
    delete process.env.SPINE_BASE_URL;
    delete process.env.SPINE_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.SPINE_SUMMARIZE_CONCURRENCY;
    delete process.env.SPINE_SUMMARIZE_RETRIES;
    delete process.env.SPINE_EXPERIMENTAL_VIEW_LAYER;
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    if (globalDir && fs.existsSync(globalDir)) {
      fs.rmSync(globalDir, { recursive: true, force: true });
    }
  });

  it('re-resolves llm settings from the current config state', () => {
    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );

    expect(runtimeService.getResolvedLLMSettings().provider.source).toBe('unset');

    config.setLLMProvider('openai');
    config.setLLMMode('heavy');
    config.setPromptTier('balanced');
    config.setValidatePolicy('strict');
    secrets.setLLMApiKey('secret-token');

    const resolved = runtimeService.getResolvedLLMSettings();
    expect(resolved.provider.value).toBe('openai');
    expect(resolved.provider.source).toBe('project-config');
    expect(resolved.promptTier.value).toBe('balanced');
    expect(resolved.promptProfile.value).toBe('balanced');
    expect(resolved.validatePolicy.value).toBe('strict');
    expect(resolved.validationProfile.value).toBe('strict');
    expect(resolved.generationStrategy.value).toBe('semantic-first');
    expect(resolved.apiKey.value).toBe('secret-token');
  });

  it('honors runtime overrides above persisted config for sync flows', () => {
    config.setLLMMode('standard');

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );
    const profile = runtimeService.getResolvedExecutionProfile('sync', { mode: 'heavy' });

    expect(profile.mode).toBe('heavy');
    expect(profile.modeSource).toBe('runtime-override');
    expect(profile.validatePolicy).toBe('strict');
    expect(profile.validatePolicySource).toBe('runtime-override');
    expect(profile.generationFlow).toBe('semantic-first');
    expect(profile.generationFlowSource).toBe('runtime-override');
  });

  it('applies standard/heavy command defaults when no mode is configured', () => {
    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );

    expect(runtimeService.getResolvedExecutionProfile('sync')).toMatchObject({
      mode: 'standard',
      promptTier: 'balanced',
      promptProfile: 'balanced',
      validatePolicy: 'default',
      validationProfile: 'default',
      generationFlow: 'together',
      generationStrategy: 'together',
    });
    expect(runtimeService.getResolvedExecutionProfile('check')).toMatchObject({
      mode: 'heavy',
      promptTier: 'balanced',
      promptProfile: 'balanced',
      validatePolicy: 'strict',
      validationProfile: 'strict',
      generationFlow: 'semantic-first',
      generationStrategy: 'semantic-first',
    });
  });

  it('reuses shared service option assembly for sync, check, and fix entrypoints', () => {
    config.setLLMProvider('openai');
    config.setLLMMode('heavy');
    config.setPromptTier('balanced');
    config.setValidatePolicy('strict');
    config.setExperimentalViewLayer(true);
    config.setEnabledViews(['public-surface', 'risk-hotspots']);
    secrets.setLLMApiKey('secret-token');

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );

    const syncOptions = (runtimeService.getSyncService() as any).options;
    const checkOptions = (runtimeService.getCheckService() as any).options;
    const fixOptions = (runtimeService.getFixService() as any).options;

    expect(syncOptions.rootDir).toBe(testDir);
    expect(syncOptions.targetLocales).toEqual(['en-US']);
    expect(syncOptions.promptTier).toBe('balanced');
    expect(syncOptions.summarizeConcurrency).toBe(10);
    expect(syncOptions.summarizeRetryLimit).toBe(2);
    expect(syncOptions.experimentalViewLayer).toBe(true);
    expect(syncOptions.enabledViews).toEqual(['public-surface', 'risk-hotspots']);
    expect(syncOptions.resolvedLLMSettings.provider.value).toBe('openai');
    expect(checkOptions.promptTier).toBe('balanced');
    expect(checkOptions.validatePolicy).toBe('strict');
    expect(checkOptions.generationFlow).toBe('semantic-first');
    expect(fixOptions.promptTier).toBe('balanced');
    expect(fixOptions.validatePolicy).toBe('strict');
    expect(fixOptions.generationFlow).toBe('semantic-first');
  });

  it('reads summarization concurrency and retry limits from environment', () => {
    process.env.SPINE_SUMMARIZE_CONCURRENCY = '12';
    process.env.SPINE_SUMMARIZE_RETRIES = '4';

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );
    const syncOptions = (runtimeService.getSyncService() as any).options;

    expect(syncOptions.summarizeConcurrency).toBe(12);
    expect(syncOptions.summarizeRetryLimit).toBe(4);
  });

  it('falls back to default summarization settings when environment values are invalid', () => {
    process.env.SPINE_SUMMARIZE_CONCURRENCY = '0';
    process.env.SPINE_SUMMARIZE_RETRIES = 'not-a-number';

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );
    const syncOptions = (runtimeService.getSyncService() as any).options;

    expect(syncOptions.summarizeConcurrency).toBe(10);
    expect(syncOptions.summarizeRetryLimit).toBe(2);
  });

  it('separates valid and invalid configured views while honoring experimental view fallbacks', () => {
    process.env.SPINE_EXPERIMENTAL_VIEW_LAYER = 'true';
    config.setEnabledViews(['risk-hotspots', 'unknown-view', 'risk-hotspots']);

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );
    const syncOptions = (runtimeService.getSyncService() as any).options;

    expect(syncOptions.experimentalViewLayer).toBe(true);
    expect(syncOptions.enabledViews).toEqual(['risk-hotspots']);
    expect(syncOptions.invalidEnabledViews).toEqual(['unknown-view']);
  });

  it('exposes resolved llm clients without leaking config stores', () => {
    config.setLLMProvider('openai');
    secrets.setLLMApiKey('secret-token');

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );
    const runtime = runtimeService.getResolvedLLMClient();

    expect(runtime.llmClient).toBeDefined();
    expect(runtime.resolvedLLMSettings.provider.value).toBe('openai');
  });

  it('fails fast when a configured provider is missing its API key', () => {
    config.setLLMProvider('deepseek');

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );

    expect(() => runtimeService.getResolvedLLMClient()).toThrowError(
      expect.objectContaining({ code: ErrorCodes.LlmApiKeyMissing }),
    );
  });

  it('safely falls back to runtime configurations for partial overrides', () => {
    config.setLLMMode('standard');
    config.setPromptTier('lite');

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );

    const profile = runtimeService.getResolvedExecutionProfile('fix', {
      mode: undefined,
      promptTier: undefined,
    });
    expect(profile.mode).toBe('standard');
    expect(profile.modeSource).toBe('project-config');
    expect(profile.promptTier).toBe('lite');

    const profilePartial = runtimeService.getResolvedExecutionProfile('check', {
      promptTier: 'balanced',
    });
    expect(profilePartial.mode).toBe('standard');
    expect(profilePartial.promptTier).toBe('balanced');
  });

  it('resolves execution profiles from settings without constructing runtime services', () => {
    config.setLLMMode('heavy');
    config.setPromptTier('balanced');
    config.setValidatePolicy('strict');

    const runtimeService = new RuntimeService(
      testDir,
      config,
      secrets,
      globalConfig,
      globalSecrets,
    );
    const profile = resolveExecutionProfileFromSettings(
      runtimeService.getResolvedLLMSettings(),
      'fix',
    );

    expect(profile.mode).toBe('heavy');
    expect(profile.promptProfile).toBe('balanced');
    expect(profile.validationProfile).toBe('strict');
    expect(profile.generationFlow).toBe('semantic-first');
  });
});
