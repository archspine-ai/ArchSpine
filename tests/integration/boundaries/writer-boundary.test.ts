import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  SpineWriterBoundary,
  withProtectedOutputsWriteAccess,
} from '../../../src/infra/writer-boundary.js';

function isWritable(filePath: string): boolean {
  const mode = fs.statSync(filePath).mode & 0o777;
  return (mode & 0o222) !== 0;
}

describe('spine writer boundary', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-writer-boundary-'));
    fs.mkdirSync(path.join(testDir, '.spine', 'index'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.spine', 'view', 'data'), { recursive: true });
    fs.writeFileSync(path.join(testDir, '.spine', 'index', 'project.json'), '{"ok":true}\n');
    fs.writeFileSync(
      path.join(testDir, '.spine', 'view', 'data', 'public-surface.json'),
      '{"ok":true}\n',
    );
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db'), 'cache');
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db-wal'), 'wal');
    fs.writeFileSync(path.join(testDir, '.spine', 'cache.db-shm'), 'shm');
    fs.writeFileSync(path.join(testDir, '.spine', '.lock'), '{"pid":1}');
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('locks protected outputs to readonly mode', () => {
    const boundary = new SpineWriterBoundary(testDir);
    boundary.lockProtectedOutputs();

    expect(isWritable(path.join(testDir, '.spine', 'index', 'project.json'))).toBe(false);
    expect(isWritable(path.join(testDir, '.spine', 'view', 'data', 'public-surface.json'))).toBe(
      false,
    );
    expect(isWritable(path.join(testDir, '.spine', 'cache.db'))).toBe(true);
    expect(isWritable(path.join(testDir, '.spine', 'cache.db-wal'))).toBe(true);
    expect(isWritable(path.join(testDir, '.spine', 'cache.db-shm'))).toBe(true);
    expect(isWritable(path.join(testDir, '.spine', '.lock'))).toBe(true);
  });

  it('temporarily unlocks protected outputs for trusted write paths', async () => {
    const protectedFile = path.join(testDir, '.spine', 'index', 'project.json');
    const boundary = new SpineWriterBoundary(testDir);
    boundary.lockProtectedOutputs();
    expect(isWritable(protectedFile)).toBe(false);

    await withProtectedOutputsWriteAccess(testDir, async () => {
      expect(isWritable(protectedFile)).toBe(true);
      fs.writeFileSync(protectedFile, '{"ok":false}\n');
    });

    expect(fs.readFileSync(protectedFile, 'utf8')).toContain('"ok":false');
    expect(isWritable(protectedFile)).toBe(false);
  });
});
