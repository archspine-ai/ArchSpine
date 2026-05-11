import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Scanner } from '../../../src/engines/scanner.js';
import { Config } from '../../../src/infra/config.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

describe('Scanner', () => {
  let tmpDir: string;
  let config: Config;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-scanner-test-'));
    fs.mkdirSync(path.join(tmpDir, '.spine'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n');
    config = new Config(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('Main Path: should return files tracking via git by default', async () => {
    const gitClient = {
      run: vi.fn((args: readonly string[]) => {
        if (args[0] === 'ls-files') {
          return 'src/index.ts\nsrc/utils.ts\n';
        }
        return '';
      }),
    };

    const scanner = new Scanner(tmpDir, config.getScanPolicy(), gitClient as any);
    const files = scanner.getAllFiles();
    expect(files).toContain('src/index.ts');
    expect(files).toContain('src/utils.ts');
  });

  it('Main Path: getDryRunReport should aggregate file info correctly', () => {
    const gitClient = {
      run: vi.fn((args: readonly string[]) =>
        args[0] === 'ls-files' ? 'src/a.ts\nsrc/b.ts\n' : '',
      ),
    };

    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src/a.ts'), 'content');
    fs.writeFileSync(path.join(tmpDir, 'src/b.ts'), 'content');

    const scanner = new Scanner(tmpDir, config.getScanPolicy(), gitClient as any);
    const report = scanner.getDryRunReport();

    expect(report.wouldScan.length).toBe(2);
    expect(report.wouldScan).toContain('src/a.ts');
    expect(report.wouldScan).toContain('src/b.ts');
  });

  it('Boundary/Exception: fallback to bootstrap untracked files when tracked is empty', () => {
    const gitClient = {
      run: vi.fn((args: readonly string[]) => {
        if (args[0] === 'ls-files' && args.includes('--others')) {
          return 'src/new-file.ts\n';
        }
        if (args[0] === 'ls-files') {
          return '';
        }
        return '';
      }),
    };

    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src/new-file.ts'), 'content');

    const scanner = new Scanner(tmpDir, config.getScanPolicy(), gitClient as any);
    const files = scanner.getAllFiles();
    // In fallback mode it should pick up the file
    expect(files).toContain('src/new-file.ts');
  });

  it('Boundary/Exception: hard exclusions bypass git inclusions', () => {
    const gitClient = {
      run: vi.fn((args: readonly string[]) =>
        args[0] === 'ls-files' ? 'src/index.ts\nnode_modules/pkg/index.js\n' : '',
      ),
    };

    const scanner = new Scanner(tmpDir, config.getScanPolicy(), gitClient as any);
    const files = scanner.getAllFiles();
    expect(files).toContain('src/index.ts');
    expect(files).not.toContain('node_modules/pkg/index.js');
  });

  it('Boundary/Exception: broken git commands yield empty safely', () => {
    const gitClient = {
      run: vi.fn((args: readonly string[]) => {
        if (args[0] === 'ls-files') {
          throw new Error('git not found');
        }
        return '';
      }),
    };

    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src/a.ts'), 'content');

    const scanner = new Scanner(tmpDir, config.getScanPolicy(), gitClient as any);
    const files = scanner.getAllFiles();
    expect(files).toContain('src/a.ts');
  });

  it('Boundary/Exception: protocol inclusion survives hard-excluded directory traversal in filesystem mode', () => {
    fs.mkdirSync(path.join(tmpDir, 'node_modules', 'keep'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'node_modules', 'drop'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'node_modules', 'keep', 'safe.ts'),
      'export const safe = true;',
    );
    fs.writeFileSync(
      path.join(tmpDir, 'node_modules', 'drop', 'ignored.ts'),
      'export const ignored = true;',
    );

    const scanner = new Scanner(tmpDir, {
      ...config.getScanPolicy(),
      fileSource: 'filesystem',
      protocolInclusions: ['node_modules/keep/**'],
      protocolExclusions: ['node_modules/**'],
    });

    const files = scanner.getAllFiles();
    expect(files).toContain('node_modules/keep/safe.ts');
    expect(files).not.toContain('node_modules/drop/ignored.ts');
  });

  it('normalizes git prefix and de-duplicates files for git-tracked-plus-untracked source', () => {
    const gitClient = {
      run: vi.fn((args: readonly string[]) => {
        if (args[0] === 'rev-parse') {
          return 'packages/app/\n';
        }
        if (args[0] === 'ls-files' && !args.includes('--others')) {
          return 'packages/app/src/a.ts\npackages/app/src/a.ts\n';
        }
        if (args[0] === 'ls-files' && args.includes('--others')) {
          return 'packages/app/src/new.ts\n';
        }
        return '';
      }),
    };

    const scanner = new Scanner(
      tmpDir,
      {
        ...config.getScanPolicy(),
        fileSource: 'git-tracked-plus-untracked',
      },
      gitClient as any,
    );
    const files = scanner.getAllFiles();
    expect(files).toEqual(['src/a.ts', 'src/new.ts']);
  });

  it('passes git arguments without shell interpolation for malicious-looking filenames', () => {
    const suspiciousName = 'src/feature$(touch hacked).ts';
    const gitClient = {
      run: vi.fn((args: readonly string[]) => {
        if (args[0] === 'diff') {
          return `${suspiciousName}\n`;
        }
        if (args[0] === 'ls-files') {
          return `${suspiciousName}\n`;
        }
        return '';
      }),
    };

    const scanner = new Scanner(tmpDir, config.getScanPolicy(), gitClient as any);
    const changedFiles = scanner.getChangedFiles();
    expect(changedFiles).toContain(suspiciousName);
    expect(gitClient.run).toHaveBeenCalledWith(
      ['diff', 'HEAD', '--name-only', '--', '.'],
      expect.objectContaining({ cwd: tmpDir }),
    );
  });

  it('drops tracked directory entries returned by git-backed scans', () => {
    const gitClient = {
      run: vi.fn((args: readonly string[]) => {
        if (args[0] === 'ls-files') {
          return 'src/index.ts\nvibe-coding-cn\n';
        }
        return '';
      }),
    };

    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'vibe-coding-cn'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src/index.ts'), 'export const tracked = true;\n');

    const scanner = new Scanner(tmpDir, config.getScanPolicy(), gitClient as any);
    const files = scanner.getAllFiles();

    expect(files).toContain('src/index.ts');
    expect(files).not.toContain('vibe-coding-cn');
  });

  it('does not execute shell payloads when querying git metadata for a tracked filename', () => {
    const suspiciousName = 'src/feature$(touch hacked).ts';
    const injectedOutputPath = path.join(tmpDir, 'hacked');

    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, suspiciousName), 'export const tracked = true;\n');

    execSync('git init -b main', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git config user.name "Test User"', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git add .', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git commit -m "Track suspicious filename"', { cwd: tmpDir, stdio: 'ignore' });

    const scanner = new Scanner(tmpDir, config.getScanPolicy());
    const lastCommit = scanner.getFileLastCommit(suspiciousName);

    expect(lastCommit).toContain('Track suspicious filename');
    expect(fs.existsSync(injectedOutputPath)).toBe(false);
  });
});
