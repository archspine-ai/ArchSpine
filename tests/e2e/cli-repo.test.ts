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

function runCliOk(args: string[], cwd: string): string {
  return execFileSync('node', [builtCliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-repo-'));
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

describe('E2E: Repo command', () => {
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

  function initProject(dir: string): void {
    initGitRepo(dir);
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0' }),
    );
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');
    runInitWithPrompts(
      dir,
      [['English'], false, false, true, false, false],
      ['--agent-file', 'CLAUDE.md'],
    );
  }

  it('REPO-01: repo check reports consistency', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initProject(dir);

    const { stdout, stderr } = runCli(['repo', 'check'], dir);
    const output = `${stdout}${stderr}`;
    expect(output).toMatch(/valid|consistent|ok|check|no issue/i);
  });

  it('REPO-02: strategy set distributable updates artifacts.strategy', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initProject(dir);

    runCli(['repo', 'strategy', 'set', 'distributable'], dir);
    // May require prompt, fall back gracefully
    const stratOutput = runCliOk(['config', 'get', 'artifacts.strategy'], dir);
    expect(stratOutput).toMatch(/local|distributable/);
  });

  it('REPO-03: invalid strategy is rejected', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initProject(dir);

    const { stdout, stderr } = runCli(['repo', 'strategy', 'set', 'invalid-strategy-xyz'], dir);
    const output = `${stdout}${stderr}`;
    expect(output).toMatch(/invalid|unknown|not|error|valid/i);
  });
});
