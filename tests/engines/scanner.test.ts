import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Scanner } from '../../src/engines/scanner.js';
import { resolveScanPolicy } from '../../src/core/scan-policy.js';

describe('engines/scanner smoke', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it('scans filesystem and applies project ignore rules', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-engine-scanner-'));
    tempDirs.push(rootDir);

    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, 'ignored'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'src', 'keep.ts'), 'export const keep = true;\n');
    fs.writeFileSync(path.join(rootDir, 'ignored', 'drop.ts'), 'export const drop = true;\n');
    fs.writeFileSync(path.join(rootDir, '.spineignore'), 'ignored/\n');

    const scanner = new Scanner(rootDir, resolveScanPolicy({ fileSource: 'filesystem' }));
    const files = scanner.getAllFiles();

    expect(files).toContain('src/keep.ts');
    expect(files).not.toContain('ignored/drop.ts');
  });
});
