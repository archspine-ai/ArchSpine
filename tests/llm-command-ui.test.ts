import { describe, expect, it, vi } from 'vitest';
import { executeLlmCommand, printLLMStatus } from '../src/cli/commands/llm.js';

describe('LLM command UI surface', () => {
  it('hides internal generation-flow details in status output', () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((message?: any) => {
      logs.push(String(message ?? ''));
    });

    printLLMStatus({
      runtimeService: {
        getResolvedLLMSettings: () => ({
          provider: { value: 'openai', source: 'project-config' },
          model: { value: 'gpt-4o-mini', source: 'project-config' },
          baseURL: { value: undefined, source: 'unset' },
          apiKey: { value: 'secret', source: 'project-keychain' },
          mode: { value: 'heavy', source: 'project-config' },
          promptTier: { value: 'balanced', source: 'project-config' },
          validatePolicy: { value: 'strict', source: 'project-config' },
          generationFlow: { value: 'semantic-first', source: 'project-config' },
        }),
        getResolvedExecutionProfile: (command: string) => ({
          mode: command === 'sync' ? 'standard' : 'heavy',
          modeSource: 'project-config',
        }),
      } as any,
      globalLLMConfig: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => undefined,
        getLLMMode: () => undefined,
      } as any,
      globalLLMSecrets: {
        hasLLMApiKey: () => false,
        getCredentialBackendName: () => 'memory',
      } as any,
      config: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => undefined,
        getLLMMode: () => undefined,
      } as any,
      secrets: {
        hasLLMApiKey: () => false,
        getCredentialBackendName: () => 'memory',
      } as any,
      rootDir: '/tmp/project',
      verbose: true,
    });

    spy.mockRestore();

    expect(logs.some((line) => line.includes('Generation Flow'))).toBe(false);
    expect(logs.some((line) => line.includes('Validate Split Stage'))).toBe(false);
    expect(logs.some((line) => line.includes('Sync Runtime Detail'))).toBe(true);
  });

  it('redacts base-url credentials in status output', () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((message?: any) => {
      logs.push(String(message ?? ''));
    });

    printLLMStatus({
      runtimeService: {
        getResolvedLLMSettings: () => ({
          provider: { value: 'openai', source: 'project-config' },
          model: { value: 'gpt-4o-mini', source: 'project-config' },
          baseURL: { value: 'https://user:secret@example.com/v1', source: 'project-config' },
          apiKey: { value: 'secret', source: 'project-keychain' },
          mode: { value: 'heavy', source: 'project-config' },
          promptTier: { value: 'balanced', source: 'project-config' },
          validatePolicy: { value: 'strict', source: 'project-config' },
          generationFlow: { value: 'semantic-first', source: 'project-config' },
        }),
        getResolvedExecutionProfile: () => ({
          mode: 'heavy',
          modeSource: 'project-config',
        }),
      } as any,
      globalLLMConfig: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => 'https://user:secret@example.com/v1',
        getLLMMode: () => undefined,
      } as any,
      globalLLMSecrets: {
        hasLLMApiKey: () => false,
        getCredentialBackendName: () => 'memory',
      } as any,
      config: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => 'https://user:secret@example.com/v1',
        getLLMMode: () => undefined,
      } as any,
      secrets: {
        hasLLMApiKey: () => false,
        getCredentialBackendName: () => 'memory',
      } as any,
      rootDir: '/tmp/project',
      verbose: true,
    });

    spy.mockRestore();

    expect(logs.join('\n')).toContain('https://***:***@example.com/v1');
    expect(logs.join('\n')).not.toContain('user:secret');
  });

  it('routes set mode through the shared set-command handler', async () => {
    const setLLMMode = vi.fn();

    await executeLlmCommand({
      args: ['--project', 'set', 'mode', 'heavy'],
      rootDir: '/tmp/project',
      config: {
        setLLMProvider: vi.fn(),
        setLLMModel: vi.fn(),
        setLLMBaseURL: vi.fn(),
        setLLMMode,
        setPromptTier: vi.fn(),
        setValidatePolicy: vi.fn(),
      } as any,
      secrets: { setLLMApiKey: vi.fn(), clearLLMApiKey: vi.fn() } as any,
      globalLLMConfig: {} as any,
      globalLLMSecrets: {} as any,
      runtimeService: {
        getResolvedLLMSettings: vi.fn(),
        getResolvedExecutionProfile: vi.fn(),
      } as any,
    });

    expect(setLLMMode).toHaveBeenCalledWith('heavy');
  });

  it('fails llm test when the provider requires an API key but none is configured', async () => {
    await expect(
      executeLlmCommand({
        args: ['test'],
        rootDir: '/tmp/project',
        config: {} as any,
        secrets: {} as any,
        globalLLMConfig: {} as any,
        globalLLMSecrets: {} as any,
        runtimeService: {
          getResolvedLLMSettings: () => ({
            provider: { value: 'deepseek', source: 'global-config' },
            model: { value: 'deepseek-chat', source: 'global-config' },
            baseURL: { value: 'https://api.deepseek.com/', source: 'global-config' },
            apiKey: { source: 'unset' },
            mode: { value: 'standard', source: 'global-config' },
            promptTier: { value: 'balanced', source: 'global-config' },
            validatePolicy: { value: 'default', source: 'global-config' },
            generationFlow: { value: 'together', source: 'global-config' },
            generationStrategy: { value: 'together', source: 'global-config' },
          }),
          getResolvedExecutionProfile: vi.fn(),
        } as any,
      }),
    ).rejects.toThrow(/LLM API key is not configured/);
  });
});
