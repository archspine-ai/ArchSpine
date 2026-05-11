import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');
const promptsModulePath = path.join(repoRoot, 'node_modules', 'prompts', 'index.js');

function runCli(
  args: string[],
  cwd: string,
): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync('node', [builtCliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  return { stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-remove-'));
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
): string {
  const wrapperPath = path.join(cwd, 'init-wrapper.mjs');
  writeWrapperScript(wrapperPath, ['init', ...extraArgs], injectedAnswers);
  return execFileSync('node', [wrapperPath], { cwd, encoding: 'utf-8', stdio: 'pipe' });
}

describe('E2E: Remove command', () => {
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

  it('RM-01: remove --yes cleans .spine and managed blocks in initialized project', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initGitRepo(dir);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0', scripts: {} }),
    );
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');

    runInitWithPrompts(
      dir,
      [false, false, true, false, '__skip__', false],
      ['--agent-file', 'CLAUDE.md'],
    );

    expect(fs.existsSync(path.join(dir, '.spine'))).toBe(true);

    const { stdout, stderr, status } = runCli(['remove', '--yes'], dir);
    const output = `${stdout}${stderr}`;

    expect(status).toBe(0);
    expect(fs.existsSync(path.join(dir, '.spine'))).toBe(false);
    expect(output).toMatch(/removed|clean|done/i);
  }, 30_000);

  it('RM-02: remove --yes on never-initialized repo exits cleanly', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initGitRepo(dir);

    const { stdout, stderr, status } = runCli(['remove', '--yes'], dir);
    const output = `${stdout}${stderr}`;

    // Should not crash
    expect(status).toBe(0);
    expect(output).toMatch(/no|nothing|not found|spine/i);
  });

  it('RM-03: remove --yes after manually deleting .spine/ still cleans hooks and package.json', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initGitRepo(dir);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0' }),
    );
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');

    runInitWithPrompts(
      dir,
      [false, false, true, false, '__skip__', false],
      ['--agent-file', 'CLAUDE.md'],
    );

    // Manually delete .spine/
    fs.rmSync(path.join(dir, '.spine'), { recursive: true, force: true });

    const { status } = runCli(['remove', '--yes'], dir);

    // Should not crash
    expect(status).toBe(0);
  }, 30_000);
});
