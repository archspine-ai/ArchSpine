import * as fs from 'fs';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  detectProtectedOutputMutations,
  formatProtectedOutputMutationWarning,
  writeProtectedOutputBaseline,
} from '../src/infra/spine-gate.js';

describe('spine gate', () => {
  const testDir = path.join(process.cwd(), 'tmp', 'spine-gate-test');

  beforeEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(testDir, '.spine', 'index'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.spine', 'atlas', 'en-US'), { recursive: true });
    fs.writeFileSync(path.join(testDir, '.spine', 'index', 'project.json'), '{"ok":true}\n');
    fs.writeFileSync(path.join(testDir, '.spine', 'atlas', 'en-US', 'project.md'), '# Project\n');
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db'), 'cache-v1');
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db-wal'), 'cache-wal-v1');
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db-shm'), 'cache-shm-v1');
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('reports no mutations immediately after writing a baseline', () => {
    writeProtectedOutputBaseline(testDir);

    const report = detectProtectedOutputMutations(testDir);
    expect(report.hasBaseline).toBe(true);
    expect(report.addedPaths).toEqual([]);
    expect(report.changedPaths).toEqual([]);
    expect(report.removedPaths).toEqual([]);
    expect(formatProtectedOutputMutationWarning(report)).toBeNull();
  });

  it('detects changed protected outputs after the baseline', () => {
    writeProtectedOutputBaseline(testDir);
    fs.writeFileSync(path.join(testDir, '.spine', 'index', 'project.json'), '{"ok":false}\n');

    const report = detectProtectedOutputMutations(testDir);
    expect(report.changedPaths).toContain('.spine/index/project.json');
    expect(formatProtectedOutputMutationWarning(report)).toContain(
      'Protected output violation detected',
    );
  });

  it('ignores runtime-only changes such as locks and sqlite sidecars', () => {
    writeProtectedOutputBaseline(testDir);
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db'), 'cache-v2');
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db-wal'), 'cache-wal-v2');
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db-shm'), 'cache-shm-v2');

    const report = detectProtectedOutputMutations(testDir);
    expect(report.changedPaths).toEqual([]);
    expect(report.addedPaths).toEqual([]);
    expect(report.removedPaths).toEqual([]);
    expect(formatProtectedOutputMutationWarning(report)).toBeNull();
  });

  it('ignores legacy baseline entries for runtime-only files', () => {
    fs.writeFileSync(
      path.join(testDir, '.spine', 'protected-output-baseline.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          files: {
            '.spine/index/project.json': 'hash-index',
            '.spine/atlas/en-US/project.md': 'hash-atlas',
            '.spine/cache.db': 'legacy-runtime-hash',
            '.spine/.lock': 'legacy-lock-hash',
          },
        },
        null,
        2,
      ),
    );

    const report = detectProtectedOutputMutations(testDir);
    expect(report.addedPaths).toEqual([]);
    expect(report.changedPaths).toEqual([
      '.spine/atlas/en-US/project.md',
      '.spine/index/project.json',
    ]);
    expect(report.removedPaths).toEqual([]);
    expect(formatProtectedOutputMutationWarning(report)).not.toContain('.spine/cache.db');
    expect(formatProtectedOutputMutationWarning(report)).not.toContain('.spine/.lock');
  });
});
