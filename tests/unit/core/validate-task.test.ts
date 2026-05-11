import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { normalizeRuleViolations } from '../../../src/tasks/validate.js';
import { ValidationTask } from '../../../src/tasks/validate.js';

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
      ruleEngine: { getRulesForFile: vi.fn(() => []), getAllRuleIds: vi.fn(() => []) },
      manifest: { deleteOrphanViolations: vi.fn(() => 0) },
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
      ruleEngine: { getRulesForFile: vi.fn(() => ['rule-1']), getAllRuleIds: vi.fn(() => []) },
      contextEngine: { resolveDependencies: vi.fn(() => ({ contextData: '', diagnostics: {} })) },
      extractor: { extract: vi.fn(async () => ({ imports: [], exports: [], usages: [] })) },
      manifest: {
        clearViolations: vi.fn(),
        recordViolation: vi.fn(),
        getFileDocs: vi.fn(() => undefined),
        deleteOrphanViolations: vi.fn(() => 0),
      },
      executionCheckpoint: {
        markItemStarted: vi.fn(),
        markItemCompleted: vi.fn(),
        markItemFailed: vi.fn(),
        markItemSkipped: vi.fn(),
      },
      outputManager: { saveDiagnostics: vi.fn() },
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

describe('normalizeRuleViolations', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeRuleViolations(null)).toEqual([]);
    expect(normalizeRuleViolations(undefined)).toEqual([]);
    expect(normalizeRuleViolations('string')).toEqual([]);
    expect(normalizeRuleViolations(42)).toEqual([]);
    expect(normalizeRuleViolations({})).toEqual([]);
  });

  it('returns empty array for empty array input', () => {
    expect(normalizeRuleViolations([])).toEqual([]);
  });

  it('filters out non-object entries', () => {
    const input = ['string', 42, null, { id: 'valid', severity: 'error', reason: 'test' }];
    const result = normalizeRuleViolations(input);
    expect(result).toEqual([{ id: 'valid', severity: 'error', reason: 'test' }]);
  });

  it('trims string fields', () => {
    const result = normalizeRuleViolations([
      { id: '  layer-check  ', severity: 'error', reason: '  bad import  ' },
    ]);
    expect(result).toEqual([{ id: 'layer-check', severity: 'error', reason: 'bad import' }]);
  });

  it('filters out entries with empty id', () => {
    const result = normalizeRuleViolations([
      { id: '', severity: 'error', reason: 'test' },
      { id: '   ', severity: 'error', reason: 'test' },
      { id: 'valid', severity: 'warning', reason: 'test' },
    ]);
    expect(result).toEqual([{ id: 'valid', severity: 'warning', reason: 'test' }]);
  });

  it('filters out placeholder rule-id', () => {
    const result = normalizeRuleViolations([
      { id: 'rule-id', severity: 'error', reason: 'test' },
      { id: 'valid', severity: 'warning', reason: 'test' },
    ]);
    expect(result).toEqual([{ id: 'valid', severity: 'warning', reason: 'test' }]);
  });

  it('defaults severity to warning for unknown values', () => {
    const result = normalizeRuleViolations([
      { id: 'r1', severity: 'critical', reason: 'test' },
      { id: 'r2', severity: 123, reason: 'test' },
      { id: 'r3', reason: 'test' },
    ]);
    expect(result.every((v) => v.severity === 'warning')).toBe(true);
  });

  it('accepts valid severity levels', () => {
    const result = normalizeRuleViolations([
      { id: 'r1', severity: 'advisory', reason: 'a' },
      { id: 'r2', severity: 'warning', reason: 'w' },
      { id: 'r3', severity: 'error', reason: 'e' },
    ]);
    expect(result.map((v) => v.severity)).toEqual(['advisory', 'warning', 'error']);
  });

  it('defaults reason to empty string when missing', () => {
    const result = normalizeRuleViolations([{ id: 'r1', severity: 'error' }]);
    expect(result).toEqual([{ id: 'r1', severity: 'error', reason: '' }]);
  });

  it('deduplicates entries with identical id/severity/reason', () => {
    const result = normalizeRuleViolations([
      { id: 'r1', severity: 'error', reason: 'dup' },
      { id: 'r1', severity: 'error', reason: 'dup' },
      { id: 'r1', severity: 'warning', reason: 'other' },
    ]);
    expect(result).toHaveLength(2);
  });

  it('preserves entries with same id but different severity', () => {
    const result = normalizeRuleViolations([
      { id: 'r1', severity: 'error', reason: 'test' },
      { id: 'r1', severity: 'warning', reason: 'test' },
    ]);
    expect(result).toHaveLength(2);
  });

  it('handles malformed LLM response gracefully', () => {
    const result = normalizeRuleViolations([
      { id: 123, severity: {}, reason: [] },
      null,
      undefined,
      'garbage',
      { id: 'valid', severity: 'error', reason: 'clean' },
    ]);
    expect(result).toEqual([{ id: 'valid', severity: 'error', reason: 'clean' }]);
  });
});
