import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');
const promptsModulePath = path.join(repoRoot, 'node_modules', 'prompts', 'index.js');

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-init-adv-'));
}

function initGitRepo(dir: string): void {
  execFileSync('git', ['init', '-b', 'main'], { cwd: dir, stdio: 'pipe' });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir, stdio: 'pipe' });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: dir, stdio: 'pipe' });
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

function runInitWithPrompts(
  cwd: string,
  injectedAnswers: unknown[],
  extraArgs: string[] = [],
): { stdout: string; stderr: string; status: number | null } {
  const wrapperPath = path.join(cwd, 'init-wrapper.mjs');
  writeWrapperScript(wrapperPath, ['init', ...extraArgs], injectedAnswers);
  const result = spawnSync('node', [wrapperPath], { cwd, encoding: 'utf-8', stdio: 'pipe' });
  return { stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
}

describe('E2E: Init advanced scenarios', () => {
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

  it('INIT-01: init with --agent-file CLAUDE.md creates agent file without touching package.json', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initGitRepo(dir);

    const originalPkg = JSON.stringify({
      name: 'test',
      version: '1.0.0',
      scripts: { build: 'echo ok' },
    });
    fs.writeFileSync(path.join(dir, 'package.json'), originalPkg);
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');

    runInitWithPrompts(
      dir,
      [false, false, true, '__skip__', false],
      ['--agent-file', 'CLAUDE.md', '--artifact-strategy', 'local', '--no-inject-package-scripts'],
    );

    // Agent file created
    expect(fs.existsSync(path.join(dir, 'CLAUDE.md'))).toBe(true);
    // .spine directory tree created
    expect(fs.existsSync(path.join(dir, '.spine', 'config.json'))).toBe(true);
    // package.json not modified
    const pkgAfter = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8');
    const parsed = JSON.parse(pkgAfter) as Record<string, unknown>;
    expect(parsed.scripts).toEqual({ build: 'echo ok' });
  }, 30_000);

  it('INIT-02: duplicate init without --yes warns about existing config', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initGitRepo(dir);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0' }),
    );
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');

    // First init
    runInitWithPrompts(
      dir,
      [false, false, true, '__skip__', false],
      ['--agent-file', 'CLAUDE.md', '--artifact-strategy', 'local', '--no-inject-package-scripts'],
    );

    const configBefore = fs.readFileSync(path.join(dir, '.spine', 'config.json'), 'utf-8');

    // Second init with same strategy — config should be overwritten with same values
    const { stdout, stderr } = runInitWithPrompts(
      dir,
      [false, false, true, '__skip__', false],
      ['--agent-file', 'CLAUDE.md', '--artifact-strategy', 'local'],
    );

    const output = `${stdout}${stderr}`;
    // Should not have overwritten config
    const configAfter = fs.readFileSync(path.join(dir, '.spine', 'config.json'), 'utf-8');
    expect(configAfter).toBe(configBefore);
    expect(output.toLowerCase()).toMatch(/already|cancelled|exist|skip/i);
  }, 30_000);

  it('INIT-03: --inject-package-scripts adds spine scripts to package.json', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initGitRepo(dir);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0', scripts: { build: 'echo ok' } }),
    );
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');

    runInitWithPrompts(
      dir,
      [false, false, true, '__skip__', false],
      ['--agent-file', 'CLAUDE.md', '--artifact-strategy', 'local', '--inject-package-scripts'],
    );

    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')) as Record<
      string,
      unknown
    >;
    const scripts = pkg.scripts as Record<string, string>;

    expect(scripts['build']).toBe('echo ok');
    expect(Object.keys(scripts).some((k) => k.includes('spine'))).toBe(true);
  }, 30_000);
});
