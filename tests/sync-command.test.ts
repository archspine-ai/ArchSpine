import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('sync command repair mode', () => {
  function createRuntimeService(syncImpl: any) {
    return {
      getSyncService: vi.fn(() => ({
        sync: syncImpl,
      })),
      getResolvedLLMSettings: vi.fn(() => ({
        provider: { value: 'mock', source: 'project-config' },
        model: { value: 'mock-default', source: 'default' },
      })),
    };
  }

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('rejects unsupported sync flags', async () => {
    const { executeSyncCommand } = await import('../src/cli/commands/sync.js');

    await expect(
      executeSyncCommand({
        args: ['--bogus'],
        rootDir: process.cwd(),
        config: {} as never,
        runtimeService: {} as never,
        displayUIBanner: vi.fn(),
      }),
    ).rejects.toThrow('Usage: spine sync [--hook] [--repair-violations] [--retry-failed]');
  });

  it('rejects legacy full-sync flag and keeps build as the heavy path', async () => {
    const { executeSyncCommand } = await import('../src/cli/commands/sync.js');

    await expect(
      executeSyncCommand({
        args: ['--full'],
        rootDir: process.cwd(),
        config: {} as never,
        runtimeService: {} as never,
        displayUIBanner: vi.fn(),
      }),
    ).rejects.toThrow('Usage: spine sync [--hook] [--repair-violations] [--retry-failed]');
  });

  it('rejects retry-failed when combined with hook mode', async () => {
    const { executeSyncCommand } = await import('../src/cli/commands/sync.js');

    await expect(
      executeSyncCommand({
        args: ['--hook', '--retry-failed'],
        rootDir: process.cwd(),
        config: {} as never,
        runtimeService: {} as never,
        displayUIBanner: vi.fn(),
      }),
    ).rejects.toThrow('Usage: spine sync [--hook] [--repair-violations] [--retry-failed]');
  });

  it('rejects retry-failed when combined with repair mode', async () => {
    const { executeSyncCommand } = await import('../src/cli/commands/sync.js');

    await expect(
      executeSyncCommand({
        args: ['--repair-violations', '--retry-failed'],
        rootDir: process.cwd(),
        config: {} as never,
        runtimeService: {} as never,
        displayUIBanner: vi.fn(),
      }),
    ).rejects.toThrow('Usage: spine sync [--hook] [--repair-violations] [--retry-failed]');
  });

  it('retries failed sync files from the latest checkpoint', async () => {
    const syncMock = vi.fn().mockResolvedValue({
      processed: 2,
      skipped: 0,
      failed: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    });

    vi.doMock('../src/infra/manifest.js', () => ({
      Manifest: {
        open: () => ({
          isVirginState() {
            return false;
          },
          loadLanguageSnapshot() {
            return null;
          },
          saveLanguageSnapshot() {
            return undefined;
          },
          markAtlasStale: vi.fn(),
          clearAtlasStale: vi.fn(),
        }),
      },
    }));

    vi.doMock('../src/engines/scanner.js', () => ({
      Scanner: class {
        getAllTrackedFiles() {
          return ['src/example.ts', 'src/other.ts'];
        }
      },
    }));

    vi.doMock('../src/ast/lang-discovery.js', () => ({
      discoverLanguages: vi.fn(async () => ({
        languages: {},
        detectedExtensions: [],
        schemaVersion: 'test',
      })),
      diffLanguages: vi.fn(() => ({ newExtensions: [], statusChanges: [] })),
    }));

    vi.doMock('../src/infra/ui.js', () => ({
      runWithFoldableOutput: async <T>(operation: () => Promise<T>) => operation(),
    }));

    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));

    vi.doMock('../src/infra/execution-checkpoint.js', async () => {
      const actual = await vi.importActual<typeof import('../src/infra/execution-checkpoint.js')>(
        '../src/infra/execution-checkpoint.js',
      );
      return {
        ...actual,
        ExecutionCheckpointStore: class {
          load() {
            return {
              status: 'completed',
              stages: {
                summarization: {
                  items: {
                    'src/example.ts': { status: 'failed', updatedAt: '2026-04-24T00:00:00.000Z' },
                    'src/other.ts': { status: 'completed', updatedAt: '2026-04-24T00:00:00.000Z' },
                  },
                },
                'state-commit': {
                  items: {
                    'src/example.ts': { status: 'failed', updatedAt: '2026-04-24T00:00:00.000Z' },
                  },
                },
              },
            };
          }
          getLastLoadWarning() {
            return null;
          }
        },
      };
    });

    const { runSyncWorkflow } = await import('../src/cli/commands/sync.js');
    const runtimeService = createRuntimeService(syncMock);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runSyncWorkflow({
      rootDir: process.cwd(),
      config: { getScanPolicy: () => ({}) } as never,
      runtimeService: runtimeService as never,
      full: false,
      hookMode: false,
      repairViolations: false,
      retryFailed: true,
      origin: 'user',
    });

    expect(syncMock).toHaveBeenCalledWith(false, false, {
      candidateFiles: ['src/example.ts'],
      forceCandidateFiles: ['src/example.ts'],
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Retry Failed] Re-running 1 failed file(s): src/example.ts',
    );
  });

  it('does not start sync when no sync checkpoint is available for retry-failed', async () => {
    const syncMock = vi.fn();

    vi.doMock('../src/infra/manifest.js', () => ({
      Manifest: {
        open: () => ({
          isVirginState() {
            return false;
          },
          loadLanguageSnapshot() {
            return null;
          },
          saveLanguageSnapshot() {
            return undefined;
          },
          markAtlasStale: vi.fn(),
          clearAtlasStale: vi.fn(),
        }),
      },
    }));

    vi.doMock('../src/engines/scanner.js', () => ({
      Scanner: class {
        getAllTrackedFiles() {
          return ['src/example.ts'];
        }
      },
    }));

    vi.doMock('../src/ast/lang-discovery.js', () => ({
      discoverLanguages: vi.fn(async () => ({
        languages: {},
        detectedExtensions: [],
        schemaVersion: 'test',
      })),
      diffLanguages: vi.fn(() => ({ newExtensions: [], statusChanges: [] })),
    }));

    vi.doMock('../src/infra/ui.js', () => ({
      runWithFoldableOutput: async <T>(operation: () => Promise<T>) => operation(),
    }));

    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));

    vi.doMock('../src/infra/execution-checkpoint.js', async () => {
      const actual = await vi.importActual<typeof import('../src/infra/execution-checkpoint.js')>(
        '../src/infra/execution-checkpoint.js',
      );
      return {
        ...actual,
        ExecutionCheckpointStore: class {
          load() {
            return null;
          }
          getLastLoadWarning() {
            return null;
          }
        },
      };
    });

    const { runSyncWorkflow } = await import('../src/cli/commands/sync.js');
    const runtimeService = createRuntimeService(syncMock);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runSyncWorkflow({
      rootDir: process.cwd(),
      config: { getScanPolicy: () => ({}) } as never,
      runtimeService: runtimeService as never,
      full: false,
      hookMode: false,
      repairViolations: false,
      retryFailed: true,
      origin: 'user',
    });

    expect(syncMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Retry Failed] No prior sync checkpoint found. Nothing to retry.',
    );
  });

  it('does not start sync when the latest sync checkpoint has no failed retry candidates', async () => {
    const syncMock = vi.fn();

    vi.doMock('../src/infra/manifest.js', () => ({
      Manifest: {
        open: () => ({
          isVirginState() {
            return false;
          },
          loadLanguageSnapshot() {
            return null;
          },
          saveLanguageSnapshot() {
            return undefined;
          },
          markAtlasStale: vi.fn(),
          clearAtlasStale: vi.fn(),
        }),
      },
    }));

    vi.doMock('../src/engines/scanner.js', () => ({
      Scanner: class {
        getAllTrackedFiles() {
          return ['src/example.ts'];
        }
      },
    }));

    vi.doMock('../src/ast/lang-discovery.js', () => ({
      discoverLanguages: vi.fn(async () => ({
        languages: {},
        detectedExtensions: [],
        schemaVersion: 'test',
      })),
      diffLanguages: vi.fn(() => ({ newExtensions: [], statusChanges: [] })),
    }));

    vi.doMock('../src/infra/ui.js', () => ({
      runWithFoldableOutput: async <T>(operation: () => Promise<T>) => operation(),
    }));

    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));

    vi.doMock('../src/infra/execution-checkpoint.js', async () => {
      const actual = await vi.importActual<typeof import('../src/infra/execution-checkpoint.js')>(
        '../src/infra/execution-checkpoint.js',
      );
      return {
        ...actual,
        ExecutionCheckpointStore: class {
          load() {
            return {
              status: 'completed',
              stages: {
                summarization: {
                  items: {
                    'src/example.ts': {
                      status: 'completed',
                      updatedAt: '2026-04-24T00:00:00.000Z',
                    },
                  },
                },
                'state-commit': {
                  items: {
                    'src/example.ts': {
                      status: 'completed',
                      updatedAt: '2026-04-24T00:00:00.000Z',
                    },
                  },
                },
              },
            };
          }
          getLastLoadWarning() {
            return null;
          }
        },
      };
    });

    const { runSyncWorkflow } = await import('../src/cli/commands/sync.js');
    const runtimeService = createRuntimeService(syncMock);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runSyncWorkflow({
      rootDir: process.cwd(),
      config: { getScanPolicy: () => ({}) } as never,
      runtimeService: runtimeService as never,
      full: false,
      hookMode: false,
      repairViolations: false,
      retryFailed: true,
      origin: 'user',
    });

    expect(syncMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Retry Failed] No failed summarization or state-commit items found in the latest sync checkpoint.',
    );
  });

  it('runs targeted repair when repair mode sees file-level protected output violations', async () => {
    const syncMock = vi.fn().mockResolvedValue({
      processed: 0,
      skipped: 0,
      failed: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    });

    vi.doMock('../src/infra/manifest.js', () => ({
      Manifest: {
        open: () => ({
          isVirginState() {
            return false;
          },
          loadLanguageSnapshot() {
            return null;
          },
          saveLanguageSnapshot() {
            return undefined;
          },
          markAtlasStale: vi.fn(),
          clearAtlasStale: vi.fn(),
        }),
      },
    }));

    vi.doMock('../src/engines/scanner.js', () => ({
      Scanner: class {
        getAllTrackedFiles() {
          return ['src/example.ts'];
        }
      },
    }));

    vi.doMock('../src/ast/lang-discovery.js', () => ({
      discoverLanguages: vi.fn(async () => ({
        languages: {},
        detectedExtensions: [],
        schemaVersion: 'test',
      })),
      diffLanguages: vi.fn(() => ({ newExtensions: [], statusChanges: [] })),
    }));

    vi.doMock('../src/infra/ui.js', () => ({
      runWithFoldableOutput: async <T>(operation: () => Promise<T>) => operation(),
    }));

    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));

    vi.doMock('../src/infra/spine-gate.js', async () => {
      const actual = await vi.importActual<typeof import('../src/infra/spine-gate.js')>(
        '../src/infra/spine-gate.js',
      );
      return {
        ...actual,
        detectProtectedOutputMutations: () => ({
          hasBaseline: true,
          addedPaths: ['.spine/index/src/example.ts.json'],
          changedPaths: [],
          removedPaths: [],
        }),
      };
    });

    const { runSyncWorkflow } = await import('../src/cli/commands/sync.js');
    const runtimeService = createRuntimeService(syncMock);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runSyncWorkflow({
      rootDir: process.cwd(),
      config: { getScanPolicy: () => ({}) } as never,
      runtimeService: runtimeService as never,
      full: false,
      hookMode: false,
      repairViolations: true,
      origin: 'user',
    });

    expect(syncMock).toHaveBeenCalledWith(false, false, {
      candidateFiles: ['src/example.ts'],
      forceCandidateFiles: ['src/example.ts'],
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Spine Gate] Repair mode enabled. Running targeted repair for 1 source file(s): src/example.ts',
    );
  });

  it('uses the safe non-interactive downgrade when aggregate violations are covered by file-level repairs', async () => {
    const syncMock = vi.fn().mockResolvedValue({
      processed: 0,
      skipped: 0,
      failed: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    });

    vi.doMock('../src/infra/manifest.js', () => ({
      Manifest: {
        open: () => ({
          isVirginState() {
            return false;
          },
          loadLanguageSnapshot() {
            return null;
          },
          saveLanguageSnapshot() {
            return undefined;
          },
          markAtlasStale: vi.fn(),
          clearAtlasStale: vi.fn(),
        }),
      },
    }));

    vi.doMock('../src/engines/scanner.js', () => ({
      Scanner: class {
        getAllTrackedFiles() {
          return ['src/example.ts'];
        }
      },
    }));

    vi.doMock('../src/ast/lang-discovery.js', () => ({
      discoverLanguages: vi.fn(async () => ({
        languages: {},
        detectedExtensions: [],
        schemaVersion: 'test',
      })),
      diffLanguages: vi.fn(() => ({ newExtensions: [], statusChanges: [] })),
    }));

    vi.doMock('../src/infra/ui.js', () => ({
      runWithFoldableOutput: async <T>(operation: () => Promise<T>) => operation(),
    }));

    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));

    vi.doMock('../src/infra/spine-gate.js', async () => {
      const actual = await vi.importActual<typeof import('../src/infra/spine-gate.js')>(
        '../src/infra/spine-gate.js',
      );
      return {
        ...actual,
        detectProtectedOutputMutations: () => ({
          hasBaseline: true,
          addedPaths: ['.spine/index/src/example.ts.json', '.spine/index/src/folder.json'],
          changedPaths: ['.spine/atlas/English/project.md'],
          removedPaths: [],
        }),
      };
    });

    const { runSyncWorkflow } = await import('../src/cli/commands/sync.js');
    const runtimeService = createRuntimeService(syncMock);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runSyncWorkflow({
      rootDir: process.cwd(),
      config: { getScanPolicy: () => ({}) } as never,
      runtimeService: runtimeService as never,
      full: false,
      hookMode: false,
      repairViolations: true,
      origin: 'user',
    });

    expect(syncMock).toHaveBeenCalledWith(false, false, {
      candidateFiles: ['src/example.ts'],
      forceCandidateFiles: ['src/example.ts'],
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Spine Gate] Non-interactive repair downgraded safely to targeted repair for 1 source file(s): src/example.ts',
    );
  });

  it('fails closed in non-interactive mode when repair policy recommends full rebuild', async () => {
    const syncMock = vi.fn();

    vi.doMock('../src/infra/manifest.js', () => ({
      Manifest: {
        open: () => ({
          isVirginState() {
            return false;
          },
          loadLanguageSnapshot() {
            return null;
          },
          saveLanguageSnapshot() {
            return undefined;
          },
          markAtlasStale: vi.fn(),
          clearAtlasStale: vi.fn(),
        }),
      },
    }));

    vi.doMock('../src/engines/scanner.js', () => ({
      Scanner: class {
        getAllTrackedFiles() {
          return ['src/example.ts'];
        }
      },
    }));

    vi.doMock('../src/ast/lang-discovery.js', () => ({
      discoverLanguages: vi.fn(async () => ({
        languages: {},
        detectedExtensions: [],
        schemaVersion: 'test',
      })),
      diffLanguages: vi.fn(() => ({ newExtensions: [], statusChanges: [] })),
    }));

    vi.doMock('../src/infra/ui.js', () => ({
      runWithFoldableOutput: async <T>(operation: () => Promise<T>) => operation(),
    }));

    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));

    vi.doMock('../src/infra/spine-gate.js', async () => {
      const actual = await vi.importActual<typeof import('../src/infra/spine-gate.js')>(
        '../src/infra/spine-gate.js',
      );
      return {
        ...actual,
        detectProtectedOutputMutations: () => ({
          hasBaseline: true,
          addedPaths: ['.spine/index/project.json'],
          changedPaths: [],
          removedPaths: [],
        }),
      };
    });

    const { runSyncWorkflow } = await import('../src/cli/commands/sync.js');
    const runtimeService = createRuntimeService(syncMock);

    await expect(
      runSyncWorkflow({
        rootDir: process.cwd(),
        config: { getScanPolicy: () => ({}) } as never,
        runtimeService: runtimeService as never,
        full: false,
        hookMode: false,
        repairViolations: true,
        origin: 'user',
      }),
    ).rejects.toThrow(
      "Protected output violations exceed targeted repair safety bounds. Run 'spine build' explicitly.",
    );

    expect(syncMock).not.toHaveBeenCalled();
  });

  it('prints the resolved llm provider and model in the sync summary', async () => {
    const syncMock = vi.fn().mockResolvedValue({
      processed: 2,
      skipped: 1,
      failed: 0,
      inputTokens: 11,
      outputTokens: 7,
      totalTokens: 18,
    });

    vi.doMock('../src/infra/manifest.js', () => ({
      Manifest: {
        open: () => ({
          isVirginState() {
            return false;
          },
          loadLanguageSnapshot() {
            return null;
          },
          saveLanguageSnapshot() {
            return undefined;
          },
          markAtlasStale: vi.fn(),
          clearAtlasStale: vi.fn(),
        }),
      },
    }));

    vi.doMock('../src/engines/scanner.js', () => ({
      Scanner: class {
        getAllTrackedFiles() {
          return ['src/example.ts'];
        }
      },
    }));

    vi.doMock('../src/ast/lang-discovery.js', () => ({
      discoverLanguages: vi.fn(async () => ({
        languages: {},
        detectedExtensions: [],
        schemaVersion: 'test',
      })),
      diffLanguages: vi.fn(() => ({ newExtensions: [], statusChanges: [] })),
    }));

    vi.doMock('../src/infra/ui.js', () => ({
      runWithFoldableOutput: async <T>(operation: () => Promise<T>) => operation(),
    }));

    vi.doMock('../src/infra/writer-boundary.js', () => ({
      withProtectedOutputsWriteAccess: async <T>(_rootDir: string, operation: () => Promise<T>) =>
        operation(),
    }));

    const { runSyncWorkflow } = await import('../src/cli/commands/sync.js');
    const runtimeService = {
      getSyncService: vi.fn(() => ({
        sync: syncMock,
      })),
      getResolvedLLMSettings: vi.fn(() => ({
        provider: { value: 'openai', source: 'project-config' },
        model: { value: 'gpt-4o-mini', source: 'project-config' },
      })),
    };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runSyncWorkflow({
      rootDir: process.cwd(),
      config: { getScanPolicy: () => ({}) } as never,
      runtimeService: runtimeService as never,
      full: false,
      hookMode: false,
      repairViolations: false,
      origin: 'user',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[LLM Summary] Provider: openai (project-config) | Model: gpt-4o-mini (project-config)',
    );
  });
});
