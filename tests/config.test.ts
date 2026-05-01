import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Config } from '../src/infra/config.js';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('Config', () => {
  let tmpDir: string;
  let configPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-config-test-'));
    const spineDir = path.join(tmpDir, '.spine');
    fs.mkdirSync(spineDir, { recursive: true });
    configPath = path.join(spineDir, 'config.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.unstubAllEnvs();
  });

  it('Main Path: should load default config if file is missing and allow setting values', () => {
    const config = new Config(tmpDir);
    expect(config.hasPersistedConfig()).toBe(false);

    config.setLLMProvider('openai');
    config.setLLMModel('gpt-4');

    expect(config.getLLMProvider()).toBe('openai');
    expect(config.getLLMModel()).toBe('gpt-4');

    expect(fs.existsSync(configPath)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    expect(saved.llm.provider).toBe('openai');
  });

  it('Main Path: should load existing config correctly', () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        schemaVersion: '1.0.0',
        project: { name: 'test-project', locales: ['en-US'] },
        llm: { provider: 'anthropic', model: 'claude-3' },
      }),
    );

    const config = new Config(tmpDir);
    expect(config.hasPersistedConfig()).toBe(true);
    expect(config.getLLMProvider()).toBe('anthropic');
  });

  it('Boundary/Exception: should fallback gracefully when config is broken JSON', () => {
    fs.writeFileSync(configPath, '{ broken-json');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const config = new Config(tmpDir);
    expect(config.hasPersistedConfig()).toBe(true);
    // Should fallback to default project name 'unnamed-project' from createDefaultConfig
    expect(config.getLanguages()).toEqual(['en-US']);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('Boundary/Exception: parseBooleanEnv edge cases', () => {
    expect(Config.parseBooleanEnv('1')).toBe(true);
    expect(Config.parseBooleanEnv(' true   ')).toBe(true);
    expect(Config.parseBooleanEnv('yes')).toBe(true);
    expect(Config.parseBooleanEnv('0')).toBe(false);
    expect(Config.parseBooleanEnv('OFF')).toBe(false);
    expect(Config.parseBooleanEnv('invalid_str')).toBe(undefined);
    expect(Config.parseBooleanEnv(undefined)).toBe(undefined);
  });

  it('Boundary/Exception: resolvePreCommitSetting with env priority', () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        schemaVersion: '1.0.0',
        project: { name: 'test-project', locales: ['en-US'] },
        hooks: { preCommit: false },
      }),
    );

    vi.stubEnv('SPINE_PRECOMMIT', '1');
    const config = new Config(tmpDir);

    const resolution = config.getPreCommitResolution();
    expect(resolution.value).toBe(true);
    expect(resolution.source).toBe('env');
    expect(resolution.envVar).toBe('SPINE_PRECOMMIT');
  });

  it('persists config facade mutations across llm, artifact, hook, and init-state settings', () => {
    const config = new Config(tmpDir);

    config.setLLMProvider('openai');
    config.setLLMModel('gpt-5');
    config.setLLMBaseURL('https://api.example.com');
    config.setLLMMode('heavy');
    config.setPromptTier('balanced');
    config.setValidatePolicy('strict');
    config.setArtifactStrategy('distributable');
    config.setExperimentalViewLayer(true);
    config.setEnabledViews(['risk-hotspots', 'risk-hotspots', 'public-surface']);
    config.setPreCommitEnabled(true);
    config.setHookSyncMode('heavy');
    config.setInitArtifactStrategy('local');
    config.setAgentInstructionsFile('AGENTS.md');
    config.setAgentInstructionsCreatedByArchSpine(true);
    config.setGitIgnoreManaged(true);
    config.setGitIgnoreCreatedByArchSpine(true);
    config.setGitAttributesManaged(true);
    config.setGitAttributesCreatedByArchSpine(true);
    config.setSpineIgnoreManaged(true);
    config.setSpineIgnoreCreatedByArchSpine(true);
    config.setSearchIgnoreManaged(true);
    config.setSearchIgnoreCreatedByArchSpine(true);
    config.setInjectedPackageScripts(['spine:check', 'spine:check', 'spine:sync']);

    const reloaded = new Config(tmpDir);

    expect(reloaded.getLLMProvider()).toBe('openai');
    expect(reloaded.getLLMModel()).toBe('gpt-5');
    expect(reloaded.getLLMBaseURL()).toBe('https://api.example.com');
    expect(reloaded.getLLMMode()).toBe('heavy');
    expect(reloaded.getPromptTier()).toBe('balanced');
    expect(reloaded.getValidatePolicy()).toBe('strict');
    expect(reloaded.getArtifactStrategy()).toBe('distributable');
    expect(reloaded.getExperimentalViewLayer()).toBe(true);
    expect(reloaded.getConfiguredEnabledViews()).toEqual(['risk-hotspots', 'public-surface']);
    expect(reloaded.isPreCommitEnabled()).toBe(true);
    expect(reloaded.getHookSyncMode()).toBe('heavy');
    expect(reloaded.getInitArtifactStrategy()).toBe('local');
    expect(reloaded.getAgentInstructionsFile()).toBe('AGENTS.md');
    expect(reloaded.isAgentInstructionsCreatedByArchSpine()).toBe(true);
    expect(reloaded.isGitIgnoreManaged()).toBe(true);
    expect(reloaded.isGitIgnoreCreatedByArchSpine()).toBe(true);
    expect(reloaded.isGitAttributesManaged()).toBe(true);
    expect(reloaded.isGitAttributesCreatedByArchSpine()).toBe(true);
    expect(reloaded.isSpineIgnoreManaged()).toBe(true);
    expect(reloaded.isSpineIgnoreCreatedByArchSpine()).toBe(true);
    expect(reloaded.isSearchIgnoreManaged()).toBe(true);
    expect(reloaded.isSearchIgnoreCreatedByArchSpine()).toBe(true);
    expect(reloaded.getInjectedPackageScripts()).toEqual(['spine:check', 'spine:sync']);
  });

  it('falls back to defaults when persisted config payload fails schema validation', () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        schemaVersion: '1.0.0',
        project: { name: 'broken', locales: 'en-US' },
        llm: { provider: 'openai' },
      }),
    );

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = new Config(tmpDir);

    expect(config.getLanguages()).toEqual(['en-US']);
    expect(config.getLLMProvider()).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
  it('supports delegated config accessors and clearing persisted values', () => {
    const config = new Config(tmpDir);

    config.setSupportedValue('llm.provider', 'openai');
    config.setSupportedValue('hooks.syncMode', 'standard');
    config.setSupportedValue('artifacts.enabledViews', [
      'public-surface',
      'risk-hotspots',
      'public-surface',
    ]);
    config.setSupportedValue('initState.injectedPackageScripts', [
      'spine:sync',
      42,
      'spine:sync',
    ] as unknown[]);

    expect(config.getSupportedValue('llm.provider')).toBe('openai');
    expect(config.getSupportedValue('hooks.syncMode')).toBe('standard');
    expect(config.getSupportedValue('artifacts.enabledViews')).toEqual([
      'public-surface',
      'risk-hotspots',
    ]);
    expect(config.getSupportedValue('initState.injectedPackageScripts')).toEqual(['spine:sync']);

    config.setSupportedValue('llm.provider', undefined);
    config.setArtifactStrategy(undefined);
    config.setEnabledViews(undefined);
    config.setAgentInstructionsFile(undefined);

    const reloaded = new Config(tmpDir);
    expect(reloaded.getLLMProvider()).toBeUndefined();
    expect(reloaded.getArtifactStrategy()).toBeUndefined();
    expect(reloaded.getConfiguredEnabledViews()).toBeUndefined();
    expect(reloaded.getAgentInstructionsFile()).toBeUndefined();
  });
});
