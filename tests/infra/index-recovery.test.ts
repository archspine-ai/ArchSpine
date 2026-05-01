import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SummarizationTask } from '../../src/tasks/summarize.js';
import { createTaskTelemetryState, createTaskState } from '../../src/core/task-state.js';
import { CURRENT_SCHEMA_VERSION, SpineUnit } from '../../src/types/protocol.js';

describe('index-based resume recovery', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('recovers from valid local index file to avoid redundant LLM calls', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-index-recovery-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    const filePath = 'src/example.ts';
    fs.writeFileSync(path.join(rootDir, filePath), 'export const value = 1;\n');

    const spineDir = path.join(rootDir, '.spine');
    fs.mkdirSync(path.join(spineDir, 'index', 'src'), { recursive: true });

    // Create a valid index file
    const recoveredUnit: SpineUnit = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      identity: {
        filePath,
        contentHash: 'mock-hash',
        language: 'TypeScript',
        fileKind: 'source',
        scope: 'src',
      },
      semantic: {
        role: 'Recovered role',
        responsibilities: [],
        outOfScope: [],
        invariants: [],
        changeIntent: { architecturalIntent: null, recentChangeIntent: null },
        publicSurface: [],
        driftDetected: false,
        driftReason: null,
      },
      skeleton: {
        imports: [],
        exports: [],
        declaredSymbols: [],
        structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
      },
      graph: { dependsOn: [], dependedBy: [], reverseIndexComplete: false, symbolEdges: [] },
      provenance: {
        indexedAt: new Date().toISOString(),
        generatorVersion: 'test',
        pipelineStages: ['ast', 'llm'],
      },
    };
    fs.writeFileSync(
      path.join(spineDir, 'index', 'src', 'example.ts.json'),
      JSON.stringify(recoveredUnit),
    );

    const generateSummary = vi.fn().mockRejectedValue(new Error('LLM should not be called'));
    const info = vi.fn();

    const task = new SummarizationTask();
    const result = await task.execute(
      {
        rootDir,
        scanner: {
          getBranchName: () => 'main',
          getGitStatusInfo: () => 'clean',
          getFileLastCommit: () => null,
        } as never,
        manifest: {
          calculateHash: () => 'mock-hash',
          needsUpdate: () => true, // simulates that it was not committed to cache.db yet
          getFileDocs: () => undefined,
          clearViolations: vi.fn(),
        } as never,
        aggregator: undefined,
        outputManager: {
          saveIndex: vi.fn(),
          saveDocs: vi.fn(),
          saveDiagnostics: vi.fn(),
          pruneAtlasLocales: vi.fn().mockReturnValue([]),
          readIndex: (relativeFilePath: string) => {
            if (relativeFilePath === filePath) {
              return recoveredUnit;
            }
            return null;
          },
        } as never,
        ruleEngine: {
          getRulesForFile: () => [],
        } as never,
        contextEngine: {} as never,
        extractor: {} as never,
        llmClient: {
          generateSummary,
        } as never,
        promptTier: 'balanced',
        validatePolicy: 'default',
        summarizeConcurrency: 8,
        summarizeRetryLimit: 2,
        generationFlow: 'together',
        targetLocales: ['English'],
        isFullSync: false,
        hookMode: false,
        forcedSyncFiles: new Set([filePath]),
        runtimeIO: {
          info,
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
        runtimeCache: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
          pendingCommits: new Map(),
        },
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
      },
      {
        selection: {
          filteredFiles: [filePath],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
          pendingCommits: new Map(),
        },
      },
    );

    // LLM should NOT be called
    expect(generateSummary).not.toHaveBeenCalled();
    // But pending commits SHOULD reflect the recovered file
    expect(result.artifacts.pendingCommits.has(filePath)).toBe(true);
    expect(result.artifacts.pendingCommits.get(filePath)?.hash).toBe('mock-hash');
    expect(info).toHaveBeenCalledWith(
      `[Task: Summarization] Recovered from local index: ${filePath}...`,
    );
  });

  it('falls back to LLM if index hashing mismatches', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-index-recovery-hash-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    const filePath = 'src/example.ts';
    fs.writeFileSync(path.join(rootDir, filePath), 'export const value = 1;\n');

    const recoveredUnit: any = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      identity: {
        filePath,
        contentHash: 'OLD_HASH',
      },
    };

    const generateSummary = vi.fn().mockResolvedValue({
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      json: {
        semantic: { role: 'New Role' },
      },
      markdown: {},
    });

    const task = new SummarizationTask();

    // Simulate extractor to avoid failure
    const contextEngine = {
      resolveDependencies: () => ({
        contextData: '',
        diagnostics: { selectedDependencies: [], candidates: [], scoring: [], skipped: [] },
        symbolEdges: [],
      }),
    };

    const extractor = {
      extract: vi.fn().mockResolvedValue({
        imports: [],
        exports: [],
        declaredSymbols: [],
        structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
      }),
    };

    await task.execute(
      {
        rootDir,
        scanner: {
          getFileLastCommit: () => null,
          getBranchName: () => 'main',
          getGitStatusInfo: () => 'clean',
        } as never,
        manifest: {
          calculateHash: () => 'NEW_HASH',
          needsUpdate: () => true,
          getFileDocs: () => undefined,
          clearViolations: vi.fn(),
        } as never,
        outputManager: {
          saveIndex: vi.fn(),
          saveDocs: vi.fn(),
          pruneAtlasLocales: vi.fn().mockReturnValue([]),
          readIndex: () => recoveredUnit,
        } as never,
        ruleEngine: { getRulesForFile: () => [] } as never,
        contextEngine: contextEngine as never,
        extractor: extractor as never,
        llmClient: { generateSummary } as never,
        promptTier: 'balanced',
        validatePolicy: 'default',
        summarizeConcurrency: 8,
        summarizeRetryLimit: 2,
        targetLocales: ['English'],
        isFullSync: false,
        hookMode: false,
        forcedSyncFiles: new Set([filePath]),
        runtimeIO: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
        runtimeCache: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
          pendingCommits: new Map(),
        } as never,
        state: createTaskState('off') as never,
      },
      {
        selection: { filteredFiles: [filePath], affectedDirs: new Set() },
        artifacts: { skeletons: new Map(), unsupportedFiles: new Map(), pendingCommits: new Map() },
      },
    );

    expect(generateSummary).toHaveBeenCalled();
  });
});
