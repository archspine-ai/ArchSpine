import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { OutputManager } from '../src/infra/output.js';

describe('output manager', () => {
  let testDir = '';

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('prunes atlas locale directories that are no longer configured', () => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-output-manager-'));
    fs.mkdirSync(path.join(testDir, '.spine', 'atlas', 'English', 'src'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.spine', 'atlas', 'Simplified Chinese', 'src'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(testDir, '.spine', 'atlas', 'English', 'src', 'example.md'),
      '# English\n',
    );
    fs.writeFileSync(
      path.join(testDir, '.spine', 'atlas', 'Simplified Chinese', 'src', 'example.md'),
      '# 中文\n',
    );

    const outputManager = new OutputManager({ rootDir: testDir });
    const removed = outputManager.pruneAtlasLocales(['Simplified Chinese']);

    expect(removed).toEqual(['English']);
    expect(fs.existsSync(path.join(testDir, '.spine', 'atlas', 'English'))).toBe(false);
    expect(fs.existsSync(path.join(testDir, '.spine', 'atlas', 'Simplified Chinese'))).toBe(true);
  });
});
