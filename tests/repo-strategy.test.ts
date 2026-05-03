import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Config } from '../src/infra/config.js';
import { runRepoCheck } from '../src/cli/repo/strategy.js';

describe('repo strategy drift checks', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('fails closed when the managed gitattributes block is missing linguist-generated markers', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-repo-check-'));
    tempDirs.push(rootDir);

    const config = new Config(rootDir);
    config.setArtifactStrategy('distributable');
    fs.writeFileSync(
      path.join(rootDir, '.gitignore'),
      [
        '# >>> ArchSpine managed >>>',
        '.spine/cache.db*',
        '.spine/.lock',
        '.spine/protected-output-baseline.json',
        '.spineignore.local',
        '# <<< ArchSpine managed <<<',
        '',
      ].join('\n'),
      'utf-8',
    );
    fs.writeFileSync(
      path.join(rootDir, '.gitattributes'),
      ['# >>> ArchSpine managed >>>', '# <<< ArchSpine managed <<<', ''].join('\n'),
      'utf-8',
    );

    const warnings: string[] = [];
    vi.spyOn(console, 'warn').mockImplementation((message?: unknown) => {
      warnings.push(String(message ?? ''));
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => runRepoCheck(rootDir, config)).toThrow(
      '[Repo Check] Repository Git file drift detected.',
    );
    expect(warnings.join('\n')).toContain(
      '.gitattributes is missing linguist-generated markers for .spine snapshot paths',
    );
  });
});
