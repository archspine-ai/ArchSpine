import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ASTExtractionTask } from '../src/tasks/ast-extra.js';
import { SummarizationTask } from '../src/tasks/summarize.js';
import { createTaskTelemetryState } from '../src/core/task-state.js';

describe('repair forced processing', () => {
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

  it('forces AST extraction for repair candidates even when manifest says the source file is unchanged', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repair-ast-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'src/example.ts'), 'export const value = 1;\n');

    const extract = vi.fn().mockResolvedValue({
      imports: [],
      exports: [{ name: 'value' }],
      declaredSymbols: [],
      structuralHints: { importCount: 0, exportCount: 1, isBarrel: false, isTypeOnly: false },
    });
    const ensureFileRecord = vi.fn();
    const clearFileExports = vi.fn();
    const registerExports = vi.fn();

    const task = new ASTExtractionTask();
    const result = await task.execute(
      {
        rootDir,
        scanner: {} as never,
        manifest: {
          calculateHash: () => 'same-hash',
          needsUpdate: () => false,
          ensureFileRecord,
          clearFileExports,
          registerExports,
          removeFileState: vi.fn(),
        } as never,
        aggregator: undefined,
        outputManager: {
          deleteFile: vi.fn(),
        } as never,
        ruleEngine: {} as never,
        contextEngine: {} as never,
        extractor: { extract } as never,
        llmClient: undefined,
        promptTier: 'balanced',
        validatePolicy: 'default',
        summarizeConcurrency: 8,
        summarizeRetryLimit: 2,
        generationFlow: 'together',
        targetLocales: ['English'],
        isFullSync: false,
        hookMode: false,
        forcedSyncFiles: new Set(['src/example.ts']),
        runtimeIO: {
          info: vi.fn(),
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
          filteredFiles: ['src/example.ts'],
          affectedDirs: new Set<string>(),
        },
      },
    );

    expect(extract).toHaveBeenCalled();
    expect(ensureFileRecord).toHaveBeenCalledWith('src/example.ts', 'source');
    expect(clearFileExports).toHaveBeenCalledWith('src/example.ts');
    expect(registerExports).toHaveBeenCalledWith('src/example.ts', ['value']);
    expect(result.artifacts.skeletons.has('src/example.ts')).toBe(true);
  });

  it('forces summarization for repair candidates even when manifest says the document is unchanged', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repair-summary-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'docs/guide.md'), '# Guide\n');

    const generateSummary = vi.fn().mockResolvedValueOnce({
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      json: {
        semantic: {
          role: 'Guide',
          responsibilities: [],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [],
          driftDetected: false,
          driftReason: null,
        },
      },
      markdown: {
        English: '# Guide',
      },
    });
    const saveIndex = vi.fn();
    const saveDocs = vi.fn();
    const clearViolations = vi.fn();
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
          calculateHash: () => 'same-hash',
          needsUpdate: () => false,
          getFileDocs: () => undefined,
          clearViolations,
        } as never,
        aggregator: undefined,
        outputManager: {
          saveIndex,
          saveDocs,
          saveDiagnostics: vi.fn(),
          readIndex: () => null,
          pruneAtlasLocales: vi.fn().mockReturnValue([]),
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
        writeAtlasDocs: true,
        forcedSyncFiles: new Set(['docs/guide.md']),
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
          filteredFiles: ['docs/guide.md'],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
        },
      },
    );

    expect(generateSummary).toHaveBeenCalled();
    expect(saveIndex).toHaveBeenCalledWith('docs/guide.md', expect.any(Object));
    expect(saveDocs).toHaveBeenCalledWith('docs/guide.md', 'English', '# Guide');
    expect(clearViolations).toHaveBeenCalledWith('docs/guide.md');
    expect(result.selection.affectedDirs.has('docs')).toBe(true);
    expect(info).toHaveBeenCalledWith('[Task: Summarization] Processing docs/guide.md...');
  });

  it('backfills missing markdown locales before failing a summarized file', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repair-markdown-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'docs/guide.md'), '# Guide\n');

    const generateSummary = vi
      .fn()
      .mockResolvedValue({
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        json: {
          semantic: {
            role: 'Guide',
            responsibilities: [],
            outOfScope: [],
            invariants: [],
            changeIntent: { architecturalIntent: null, recentChangeIntent: null },
            publicSurface: [],
            driftDetected: false,
            driftReason: null,
          },
        },
        markdown: {
          English: '# Guide',
        },
      })
      .mockResolvedValueOnce({
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        json: {
          semantic: {
            role: 'Guide',
            responsibilities: [],
            outOfScope: [],
            invariants: [],
            changeIntent: { architecturalIntent: null, recentChangeIntent: null },
            publicSurface: [],
            driftDetected: false,
            driftReason: null,
          },
        },
        markdown: {
          'Simplified Chinese': '# 指南',
        },
      });
    const saveIndex = vi.fn();
    const saveDocs = vi.fn();
    const clearViolations = vi.fn();

    const task = new SummarizationTask();
    await task.execute(
      {
        rootDir,
        scanner: {
          getBranchName: () => 'main',
          getGitStatusInfo: () => 'clean',
          getFileLastCommit: () => null,
        } as never,
        manifest: {
          calculateHash: () => 'same-hash',
          needsUpdate: () => false,
          getFileDocs: () => undefined,
          clearViolations,
        } as never,
        aggregator: undefined,
        outputManager: {
          saveIndex,
          saveDocs,
          saveDiagnostics: vi.fn(),
          readIndex: () => null,
          pruneAtlasLocales: vi.fn().mockReturnValue([]),
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
        generationFlow: 'semantic-first',
        targetLocales: ['English', 'Simplified Chinese'],
        isFullSync: false,
        hookMode: false,
        writeAtlasDocs: true,
        forcedSyncFiles: new Set(['docs/guide.md']),
        runtimeIO: {
          info: vi.fn(),
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
          filteredFiles: ['docs/guide.md'],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
        },
      },
    );

    expect(generateSummary).toHaveBeenCalledTimes(2);
    expect(saveDocs).toHaveBeenCalledWith('docs/guide.md', 'English', '# Guide');
    expect(saveDocs).toHaveBeenCalledWith('docs/guide.md', 'Simplified Chinese', '# 指南');
    expect(clearViolations).toHaveBeenCalledWith('docs/guide.md');
  });

  it('retries retryable summarization failures up to the configured limit', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repair-summary-retry-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'docs/guide.md'), '# Guide\n');

    const generateSummary = vi
      .fn()
      .mockRejectedValueOnce(new Error('terminated'))
      .mockResolvedValueOnce({
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        json: {
          semantic: {
            role: 'Guide',
            responsibilities: [],
            outOfScope: [],
            invariants: [],
            changeIntent: { architecturalIntent: null, recentChangeIntent: null },
            publicSurface: [],
            driftDetected: false,
            driftReason: null,
          },
        },
        markdown: {
          English: '# Guide',
        },
      });
    const warn = vi.fn();

    const task = new SummarizationTask();
    await task.execute(
      {
        rootDir,
        scanner: {
          getBranchName: () => 'main',
          getGitStatusInfo: () => 'clean',
          getFileLastCommit: () => null,
        } as never,
        manifest: {
          calculateHash: () => 'same-hash',
          needsUpdate: () => true,
          getFileDocs: () => undefined,
          clearViolations: vi.fn(),
        } as never,
        aggregator: undefined,
        outputManager: {
          saveIndex: vi.fn(),
          saveDocs: vi.fn(),
          saveDiagnostics: vi.fn(),
          readIndex: () => null,
          pruneAtlasLocales: vi.fn().mockReturnValue([]),
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
        writeAtlasDocs: true,
        forcedSyncFiles: new Set(),
        runtimeIO: {
          info: vi.fn(),
          warn,
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
          filteredFiles: ['docs/guide.md'],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
        },
      },
    );

    expect(generateSummary).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /\[Task: Summarization\] Attempt 1\/3 failed for docs\/guide\.md\. Retrying in \d+ms\. Error: terminated/,
      ),
    );
  });

  it('applies markdown fallback when requested markdown blocks are missing', async () => {
    const rootDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'archspine-repair-summary-missing-markdown-'),
    );
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'docs/guide.md'), '# Guide\n');

    const saveIndex = vi.fn();
    const saveDocs = vi.fn();
    const markItemStarted = vi.fn();
    const markItemCompleted = vi.fn();
    const markItemFailed = vi.fn();
    const warn = vi.fn();

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
          calculateHash: () => 'same-hash',
          needsUpdate: () => true,
          getFileDocs: () => undefined,
          clearViolations: vi.fn(),
        } as never,
        aggregator: undefined,
        outputManager: {
          saveIndex,
          saveDocs,
          saveDiagnostics: vi.fn(),
          readIndex: () => null,
          pruneAtlasLocales: vi.fn().mockReturnValue([]),
        } as never,
        ruleEngine: {
          getRulesForFile: () => [],
        } as never,
        contextEngine: {} as never,
        extractor: {} as never,
        llmClient: {
          generateSummary: vi.fn().mockResolvedValue({
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            json: {
              semantic: {
                role: 'Guide',
                responsibilities: [],
                outOfScope: [],
                invariants: [],
                changeIntent: { architecturalIntent: null, recentChangeIntent: null },
                publicSurface: [],
                driftDetected: false,
                driftReason: null,
              },
            },
            markdown: {},
          }),
        } as never,
        promptTier: 'balanced',
        validatePolicy: 'default',
        summarizeConcurrency: 8,
        summarizeRetryLimit: 2,
        generationFlow: 'together',
        targetLocales: ['English'],
        isFullSync: false,
        hookMode: false,
        writeAtlasDocs: true,
        forcedSyncFiles: new Set(),
        runtimeIO: {
          info: vi.fn(),
          warn,
          error: vi.fn(),
          confirm: vi.fn(),
        },
        executionCheckpoint: {
          markItemStarted,
          markItemCompleted,
          markItemFailed,
        } as never,
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
          filteredFiles: ['docs/guide.md'],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
        },
      },
    );

    expect(saveIndex).toHaveBeenCalled();
    expect(saveDocs).toHaveBeenCalled();
    expect(markItemStarted).toHaveBeenCalledWith('summarization', 'docs/guide.md');
    expect(markItemCompleted).toHaveBeenCalledWith('summarization', 'docs/guide.md');
    expect(markItemFailed).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      '[Task: Summarization] Markdown missing after backfill for docs/guide.md; applied fallback.',
    );
    expect(result.artifacts.pendingCommits.size).toBe(1);
  });

  it('keeps validate violations persisted through the shared violation recorder', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repair-validate-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'src/example.ts'), 'export const value = 1;\n');

    const recordViolation = vi.fn();
    const clearViolations = vi.fn();
    const taskModule = await import('../src/tasks/validate.js');
    const task = new taskModule.ValidationTask();

    const result = await task.execute(
      {
        rootDir,
        scanner: {
          getBranchName: () => 'main',
          getGitStatusInfo: () => 'clean',
          getFileLastCommit: () => null,
        } as never,
        manifest: {
          clearViolations,
          getFileDocs: () => undefined,
          recordViolation,
        } as never,
        outputManager: {
          saveDiagnostics: vi.fn(),
        } as never,
        ruleEngine: {
          getRulesForFile: () => ['mock rule'],
        } as never,
        contextEngine: {
          resolveDependencies: () => ({
            contextData: '',
            diagnostics: { selectedDependencies: [], candidates: [], scoring: [], skipped: [] },
          }),
        } as never,
        extractor: {
          extract: vi.fn().mockResolvedValue({
            imports: [],
            exports: [],
            declaredSymbols: [],
            structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
          }),
        } as never,
        llmClient: {
          generateSummary: vi.fn().mockResolvedValue({
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            json: {
              semantic: {
                ruleViolations: [
                  { id: 'mock-rule', severity: 'error', reason: 'violation detected' },
                ],
              },
            },
          }),
        } as never,
        promptTier: 'balanced',
        validatePolicy: 'strict',
        generationFlow: 'together',
        runtimeIO: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
        executionCheckpoint: undefined,
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
      },
      {
        selection: {
          filteredFiles: ['src/example.ts'],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
        },
      },
    );

    expect(clearViolations).toHaveBeenCalledWith('src/example.ts');
    expect(recordViolation).toHaveBeenCalledWith(
      'src/example.ts',
      'mock-rule',
      'error',
      'violation detected',
    );
    expect(result.summary.totalViolations).toBe(1);
    expect(result.summary.filesWithViolations).toBe(1);
  });

  it('marks files as skipped with explicit reasons when validation runs without an LLM client', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repair-validate-no-llm-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'src/example.ts'), 'export const value = 1;\n');

    const markItemSkipped = vi.fn();
    const taskModule = await import('../src/tasks/validate.js');
    const task = new taskModule.ValidationTask();

    const result = await task.execute(
      {
        rootDir,
        scanner: {} as never,
        manifest: {
          clearViolations: vi.fn(),
          getFileDocs: () => undefined,
          recordViolation: vi.fn(),
        } as never,
        outputManager: { saveDiagnostics: vi.fn() } as never,
        ruleEngine: {
          getRulesForFile: () => ['mock rule'],
        } as never,
        contextEngine: {} as never,
        extractor: {} as never,
        llmClient: undefined,
        promptTier: 'balanced',
        validatePolicy: 'strict',
        generationFlow: 'together',
        runtimeIO: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
        executionCheckpoint: {
          markItemSkipped,
        } as never,
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
      },
      {
        selection: {
          filteredFiles: ['src/example.ts'],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
        },
      },
    );

    expect(markItemSkipped).toHaveBeenCalledWith('validation', 'src/example.ts', {
      reason: 'llm-unavailable',
    });
    expect(result.summary.filesWithRules).toBe(1);
    expect(result.summary.auditedFiles).toBe(0);
  });

  it('normalizes invalid validate severities to warning and de-duplicates violations', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repair-validate-severity-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'src/example.ts'), 'export const value = 1;\n');

    const recordViolation = vi.fn();
    const taskModule = await import('../src/tasks/validate.js');
    const task = new taskModule.ValidationTask();

    await task.execute(
      {
        rootDir,
        scanner: {
          getBranchName: () => 'main',
          getGitStatusInfo: () => 'clean',
          getFileLastCommit: () => null,
        } as never,
        manifest: {
          clearViolations: vi.fn(),
          getFileDocs: () => undefined,
          recordViolation,
        } as never,
        outputManager: { saveDiagnostics: vi.fn() } as never,
        ruleEngine: {
          getRulesForFile: () => ['mock rule'],
        } as never,
        contextEngine: {
          resolveDependencies: () => ({
            contextData: '',
            diagnostics: {
              retainedDependencyCandidates: [],
              truncatedDependencyCandidates: [],
              symbolTargets: [],
            },
          }),
        } as never,
        extractor: {
          extract: vi.fn().mockResolvedValue({
            imports: [],
            exports: [],
            declaredSymbols: [],
            structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
          }),
        } as never,
        llmClient: {
          generateSummary: vi.fn().mockResolvedValue({
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            json: {
              semantic: {
                ruleViolations: [
                  { id: 'dup-rule', severity: 'fatal', reason: 'first' },
                  { id: 'dup-rule', severity: 'fatal', reason: 'first' },
                ],
              },
            },
          }),
        } as never,
        promptTier: 'balanced',
        validatePolicy: 'strict',
        generationFlow: 'together',
        runtimeIO: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          confirm: vi.fn(),
        },
        executionCheckpoint: undefined,
        state: {
          telemetry: createTaskTelemetryState('off'),
        },
      },
      {
        selection: {
          filteredFiles: ['src/example.ts'],
          affectedDirs: new Set<string>(),
        },
        artifacts: {
          skeletons: new Map(),
          unsupportedFiles: new Map(),
        },
      },
    );

    expect(recordViolation).toHaveBeenCalledTimes(1);
    expect(recordViolation).toHaveBeenCalledWith('src/example.ts', 'dup-rule', 'warning', 'first');
  });
});
