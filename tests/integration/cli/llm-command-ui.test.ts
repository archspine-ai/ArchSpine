import { describe, expect, it, vi } from 'vitest';
import { executeLlmCommand, printLLMStatus } from '../../../src/cli/commands/llm.js';

describe('LLM command UI surface', () => {
  it('hides internal generation details in status output', () => {
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
          generationStrategy: { value: 'together', source: 'default' },
        }),
        getResolvedExecutionProfile: (_command: string) => ({
          generationStrategy: 'together',
          generationStrategySource: 'default',
        }),
      } as any,
      globalLLMConfig: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => undefined,
      } as any,
      globalLLMSecrets: {
        hasLLMApiKey: () => false,
        getCredentialBackendName: () => 'memory',
      } as any,
      config: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => undefined,
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
    expect(logs.some((line) => line.includes('Effective Provider'))).toBe(true);
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
          generationStrategy: { value: 'together', source: 'default' },
        }),
        getResolvedExecutionProfile: () => ({
          generationStrategy: 'together',
          generationStrategySource: 'default',
        }),
      } as any,
      globalLLMConfig: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => 'https://user:secret@example.com/v1',
      } as any,
      globalLLMSecrets: {
        hasLLMApiKey: () => false,
        getCredentialBackendName: () => 'memory',
      } as any,
      config: {
        getLLMProvider: () => undefined,
        getLLMModel: () => undefined,
        getLLMBaseURL: () => 'https://user:secret@example.com/v1',
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

  it('rejects unknown set subcommand gracefully', async () => {
    await expect(
      executeLlmCommand({
        args: ['--project', 'set', 'generation-flow', 'together'],
        rootDir: '/tmp/project',
        config: {
          setLLMProvider: vi.fn(),
          setLLMModel: vi.fn(),
          setLLMBaseURL: vi.fn(),
        } as any,
        secrets: { setLLMApiKey: vi.fn(), clearLLMApiKey: vi.fn() } as any,
        globalLLMConfig: {} as any,
        globalLLMSecrets: {} as any,
        runtimeService: {
          getResolvedLLMSettings: vi.fn(),
          getResolvedExecutionProfile: vi.fn(),
        } as any,
      }),
    ).rejects.toThrow(/Usage:/);
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
            generationStrategy: { value: 'together', source: 'default' },
          }),
          getResolvedExecutionProfile: vi.fn(),
        } as any,
      }),
    ).rejects.toThrow(/LLM API key is not configured/);
  });
});
