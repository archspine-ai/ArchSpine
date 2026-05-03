import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');
const promptsModulePath = path.join(repoRoot, 'node_modules', 'prompts', 'index.js');

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-init-cli-'));
}

function writeWrapperScript(
  wrapperPath: string,
  cliArgs: string[],
  injectedAnswers: unknown[],
): void {
  const script = `
import prompts from ${JSON.stringify(promptsModulePath)};

prompts.inject(${JSON.stringify(injectedAnswers)});
process.argv = ['node', ${JSON.stringify(builtCliPath)}, ...${JSON.stringify(cliArgs)}];
await import(${JSON.stringify(builtCliPath)});
`;
  fs.writeFileSync(wrapperPath, script, 'utf-8');
}

function runBuiltCliWithInjectedPrompts(
  args: string[],
  cwd: string,
  injectedAnswers: unknown[],
): string {
  const wrapperPath = path.join(cwd, 'run-init-wrapper.mjs');
  writeWrapperScript(wrapperPath, args, injectedAnswers);
  return execFileSync('node', [wrapperPath], {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
}

describe('init CLI integration', () => {
  const createdDirs: string[] = [];

  beforeAll(() => {
    if (!fs.existsSync(builtCliPath)) {
      throw new Error(
        `Built CLI missing at ${builtCliPath}. Run 'npm run build' before this suite.`,
      );
    }
  });

  afterEach(() => {
    for (const dir of createdDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('initializes distributable Git strategy and remove rolls back managed Git blocks', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    execFileSync('git', ['init', '-b', 'main'], { cwd: rootDir, stdio: 'pipe' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: rootDir,
      stdio: 'pipe',
    });
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: rootDir, stdio: 'pipe' });
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify({ name: 'demo', version: '1.0.0' }, null, 2),
    );

    runBuiltCliWithInjectedPrompts(['init', '--artifact-strategy', 'distributable'], rootDir, [
      ['English'],
      false,
      false,
      false,
      false,
      false,
      '__skip__',
      false,
    ]);

    const configRaw = fs.readFileSync(path.join(rootDir, '.spine', 'config.json'), 'utf-8');
    const config = JSON.parse(configRaw) as {
      artifacts?: { strategy?: string };
      initState?: { artifactStrategy?: string };
    };
    const gitIgnore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');
    const gitAttributes = fs.readFileSync(path.join(rootDir, '.gitattributes'), 'utf-8');
    const spineIgnore = fs.readFileSync(path.join(rootDir, '.spineignore'), 'utf-8');

    expect(config.artifacts?.strategy).toBe('distributable');
    expect(config.initState?.artifactStrategy).toBe('distributable');
    expect(config.initState?.spineIgnoreManaged).toBe(true);
    expect(gitIgnore).toContain('.spine/cache.db*');
    expect(gitIgnore).not.toContain('.spine/index/');
    expect(gitAttributes).toContain('.spine/index/** linguist-generated=true');
    expect(spineIgnore).toContain('.env');
    expect(spineIgnore).toContain('docs/');
    expect(spineIgnore).toContain('README.md');
    expect(spineIgnore).toContain('CONTRIBUTING.md');
    expect(spineIgnore).toContain('docs/.vitepress/dist/');
    expect(spineIgnore).toContain('!.github/workflows/');

    const removeOutput = execFileSync('node', [builtCliPath, 'remove', '--yes'], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    expect(removeOutput).toContain('Removed ArchSpine-managed .spineignore state.');
    expect(removeOutput).toContain('Removed ArchSpine-managed .gitignore state.');
    expect(removeOutput).toContain('Removed ArchSpine-managed .gitattributes state.');
    expect(fs.existsSync(path.join(rootDir, '.spine'))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, '.spineignore'))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, '.gitignore'))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, '.gitattributes'))).toBe(false);
  });

  it('remove still clears managed Git blocks when .spine has already been deleted manually', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    execFileSync('git', ['init', '-b', 'main'], { cwd: rootDir, stdio: 'pipe' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: rootDir,
      stdio: 'pipe',
    });
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: rootDir, stdio: 'pipe' });
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify({ name: 'demo', version: '1.0.0' }, null, 2),
    );

    runBuiltCliWithInjectedPrompts(['init', '--artifact-strategy', 'distributable'], rootDir, [
      ['English'],
      false,
      false,
      false,
      false,
      false,
      '__skip__',
      false,
    ]);

    fs.rmSync(path.join(rootDir, '.spine'), { recursive: true, force: true });

    const removeOutput = execFileSync('node', [builtCliPath, 'remove', '--yes'], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    expect(removeOutput).toContain('Removed ArchSpine-managed .spineignore state.');
    expect(removeOutput).toContain('Removed ArchSpine-managed .gitignore state.');
    expect(removeOutput).toContain('Removed ArchSpine-managed .gitattributes state.');
    expect(removeOutput).toContain('.spine/ directory was already absent.');
    expect(fs.existsSync(path.join(rootDir, '.spineignore'))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, '.gitignore'))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, '.gitattributes'))).toBe(false);
  });

  it('repo strategy set migrates local repositories to distributable without rerunning init', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    execFileSync('git', ['init', '-b', 'main'], { cwd: rootDir, stdio: 'pipe' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: rootDir,
      stdio: 'pipe',
    });
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: rootDir, stdio: 'pipe' });
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify({ name: 'demo', version: '1.0.0' }, null, 2),
    );

    runBuiltCliWithInjectedPrompts(['init', '--artifact-strategy', 'local'], rootDir, [
      ['English'],
      false,
      false,
      false,
      false,
      false,
      '__skip__',
      false,
    ]);

    const output = execFileSync(
      'node',
      [builtCliPath, 'repo', 'strategy', 'set', 'distributable'],
      {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: 'pipe',
      },
    );

    const configRaw = fs.readFileSync(path.join(rootDir, '.spine', 'config.json'), 'utf-8');
    const config = JSON.parse(configRaw) as {
      artifacts?: { strategy?: string };
      initState?: { artifactStrategy?: string };
    };
    const gitIgnore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');
    const gitAttributes = fs.readFileSync(path.join(rootDir, '.gitattributes'), 'utf-8');

    expect(output).toContain('[Repo Strategy] Target strategy: distributable');
    expect(output).toContain('Strategy migration completed: local -> distributable.');
    expect(config.artifacts?.strategy).toBe('distributable');
    expect(config.initState?.artifactStrategy).toBe('distributable');
    expect(gitIgnore).not.toContain('.spine/index/');
    expect(gitIgnore).not.toContain('.spine/atlas/');
    expect(gitAttributes).toContain('.spine/index/** linguist-generated=true');
  });

  it('repo strategy set warns but does not untrack snapshot files when downgrading to local', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    execFileSync('git', ['init', '-b', 'main'], { cwd: rootDir, stdio: 'pipe' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: rootDir,
      stdio: 'pipe',
    });
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: rootDir, stdio: 'pipe' });
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify({ name: 'demo', version: '1.0.0' }, null, 2),
    );

    runBuiltCliWithInjectedPrompts(['init', '--artifact-strategy', 'distributable'], rootDir, [
      ['English'],
      false,
      false,
      false,
      false,
      false,
      '__skip__',
      false,
    ]);

    fs.mkdirSync(path.join(rootDir, '.spine', 'index'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, '.spine', 'atlas', 'en-US'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, '.spine', 'index', 'project.json'), '{}');
    fs.writeFileSync(path.join(rootDir, '.spine', 'manifest.json'), '{}');
    fs.writeFileSync(path.join(rootDir, '.spine', 'languages.json'), '{}');
    execFileSync('git', ['add', '.spine/index/project.json', '.spine/manifest.json'], {
      cwd: rootDir,
      stdio: 'pipe',
    });

    const result = spawnSync('node', [builtCliPath, 'repo', 'strategy', 'set', 'local'], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const output = `${result.stdout || ''}${result.stderr || ''}`;

    const configRaw = fs.readFileSync(path.join(rootDir, '.spine', 'config.json'), 'utf-8');
    const config = JSON.parse(configRaw) as { artifacts?: { strategy?: string } };
    const gitIgnore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');

    expect(result.status).toBe(0);
    expect(output).toContain('[Repo Strategy] Tracked snapshot files are still present in Git.');
    expect(output).toContain(
      'Switching to local changes ignore rules, but it does not untrack existing files.',
    );
    expect(config.artifacts?.strategy).toBe('local');
    expect(gitIgnore).toContain('.spine/index/');
    expect(gitIgnore).toContain('.spine/atlas/');
    expect(fs.existsSync(path.join(rootDir, '.gitattributes'))).toBe(false);
  });

  it('does not inject package scripts by default during init', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    execFileSync('git', ['init', '-b', 'main'], { cwd: rootDir, stdio: 'pipe' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: rootDir,
      stdio: 'pipe',
    });
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: rootDir, stdio: 'pipe' });
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify({ name: 'demo', version: '1.0.0' }, null, 2),
    );

    runBuiltCliWithInjectedPrompts(['init', '--artifact-strategy', 'distributable'], rootDir, [
      ['English'],
      false,
      false,
      false,
      false,
      false,
      '__skip__',
      false,
    ]);

    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.['spine:init']).toBeUndefined();
    expect(pkg.scripts?.['spine:sync']).toBeUndefined();
  });

  it('try reports distributable snapshot posture without mutating repository state', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    fs.mkdirSync(path.join(rootDir, '.spine', 'rules'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, '.spine', 'index'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, '.spine', 'atlas', 'en-US'), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, '.spine', 'config.json'),
      JSON.stringify(
        {
          schemaVersion: '1.0.0',
          project: { name: 'demo', locales: ['English'] },
          artifacts: { strategy: 'distributable' },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(path.join(rootDir, '.spine', 'rules', 'layered.yml'), 'rules');
    fs.writeFileSync(
      path.join(rootDir, '.spine', 'manifest.json'),
      JSON.stringify({ sync: { lastSyncAt: new Date().toISOString() } }),
    );
    fs.writeFileSync(path.join(rootDir, '.spine', 'index', 'project.json'), '{}');
    fs.writeFileSync(path.join(rootDir, '.spine', 'atlas', 'en-US', 'project.md'), '# Demo');

    const beforeFiles = fs.readdirSync(path.join(rootDir, '.spine')).sort();
    const output = execFileSync('node', [builtCliPath, 'try'], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const afterFiles = fs.readdirSync(path.join(rootDir, '.spine')).sort();

    expect(output).toContain('ArchSpine is already available in this repository.');
    expect(output).toContain(
      'This preview is read-only and will not modify files, hooks, or package.json.',
    );
    expect(output).toContain('Available now:');
    expect(output).toContain('Recommended next step:');
    expect(output).toContain('npx --yes archspine@latest info');
    expect(output).toContain('Detected repository posture:');
    expect(output).toContain('- distributable snapshot: present');
    expect(beforeFiles).toEqual(afterFiles);
  });

  it('try recommends build when ArchSpine is adopted but distributable snapshot is incomplete', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    fs.mkdirSync(path.join(rootDir, '.spine', 'rules'), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, '.spine', 'config.json'),
      JSON.stringify(
        {
          schemaVersion: '1.0.0',
          project: { name: 'demo', locales: ['English'] },
          artifacts: { strategy: 'distributable' },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(path.join(rootDir, '.spine', 'rules', 'layered.yml'), 'rules');

    const output = execFileSync('node', [builtCliPath, 'try'], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    expect(output).toContain(
      'This repository uses ArchSpine, but the local semantic snapshot is not fully available yet.',
    );
    expect(output).toContain('Recommended next step:');
    expect(output).toContain('npx --yes archspine@latest build');
    expect(output).toContain('Detected repository posture:');
    expect(output).toContain('- distributable snapshot: missing');
  });

  it('try recommends init when repository is not using ArchSpine yet', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    const output = execFileSync('node', [builtCliPath, 'try'], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    expect(output).toContain('This repository is not using ArchSpine yet.');
    expect(output).toContain(
      'ArchSpine will ask before changing repository files, hooks, or package scripts.',
    );
    expect(output).toContain('Recommended next step:');
    expect(output).toContain('npx --yes archspine@latest init');
    expect(output).toContain('- archspine adopted: no');
  });

  it('prints top-level help without touching broken runtime config', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    fs.mkdirSync(path.join(rootDir, '.spine'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, '.spine', 'config.json'), '{ broken json', 'utf-8');

    const result = spawnSync('node', [builtCliPath, '--help'], {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const output = `${result.stdout || ''}${result.stderr || ''}`;

    expect(result.status).toBe(0);
    expect(output).toContain('Usage:');
    expect(output).not.toContain('ConfigParseFailed');
    expect(output).not.toContain('Failed to parse');
  });
});
