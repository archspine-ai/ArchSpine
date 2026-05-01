import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ValidationTask } from '../src/tasks/validate.js';

describe('ValidationTask', () => {
  let rootDir: string;

  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-validate-task-'));
  });

  afterEach(() => {
    if (fs.existsSync(rootDir)) {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it('returns empty summary for empty selection input', async () => {
    const task = new ValidationTask();
    const ctx = {
      llmClient: undefined,
      runtimeIO: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      ruleEngine: { getRulesForFile: vi.fn(() => []) },
      executionCheckpoint: { markItemSkipped: vi.fn() },
    } as any;

    const result = await task.execute(ctx, {
      selection: { filteredFiles: [], affectedDirs: new Set<string>() },
      artifacts: { unsupportedFiles: new Map(), skeletons: new Map() },
    } as any);

    expect(result.summary).toEqual({
      auditedFiles: 0,
      filesWithRules: 0,
      filesWithViolations: 0,
      totalViolations: 0,
      failedFiles: 0,
    });
    expect(result.stage.selection.filteredFiles).toEqual([]);
  });

  it('tracks failed files when LLM validation throws', async () => {
    const file = 'src/a.ts';
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, file), 'export const a = 1;');

    const task = new ValidationTask();
    const ctx = {
      rootDir,
      llmClient: {
        generateSummary: vi.fn(async () => {
          throw new Error('llm-failed');
        }),
      },
      scanner: {
        getBranchName: () => 'main',
        getGitStatusInfo: () => '',
        getFileLastCommit: () => '',
      },
      runtimeIO: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      ruleEngine: { getRulesForFile: vi.fn(() => ['rule-1']) },
      contextEngine: { resolveDependencies: vi.fn(() => ({ contextData: '', diagnostics: {} })) },
      extractor: { extract: vi.fn(async () => ({ imports: [], exports: [], usages: [] })) },
      manifest: {
        clearViolations: vi.fn(),
        recordViolation: vi.fn(),
        getFileDocs: vi.fn(() => undefined),
      },
      executionCheckpoint: {
        markItemStarted: vi.fn(),
        markItemCompleted: vi.fn(),
        markItemFailed: vi.fn(),
        markItemSkipped: vi.fn(),
      },
      outputManager: { saveDiagnostics: vi.fn() },
      promptTier: 'balanced',
      validatePolicy: 'default',
      generationFlow: 'together',
      state: { telemetry: { diagnostics: { mode: 'off', validate: [] } } },
    } as any;

    const result = await task.execute(ctx, {
      selection: { filteredFiles: [file], affectedDirs: new Set(['src']) },
      artifacts: { unsupportedFiles: new Map(), skeletons: new Map() },
    } as any);

    expect(result.summary.filesWithRules).toBe(1);
    expect(result.summary.auditedFiles).toBe(1);
    expect(result.summary.failedFiles).toBe(1);
    expect(result.summary.totalViolations).toBe(0);
  });
});
