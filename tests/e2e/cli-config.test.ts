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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-config-'));
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

describe('E2E: Config commands', () => {
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

  it('CFG-01: config set and get hooks.preCommit', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initProject(dir);

    runCliOk(['config', 'set', 'hooks.preCommit', 'true'], dir);
    const output = runCliOk(['config', 'get', 'hooks.preCommit'], dir);

    expect(output).toContain('true');
  });

  it('CFG-02: config get artifacts.strategy shows default local', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initProject(dir);

    const output = runCliOk(['config', 'get', 'artifacts.strategy'], dir);

    expect(output).toMatch(/local|distributable/);
  });

  it('CFG-03: config set llm.provider persists to config file', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initProject(dir);

    runCliOk(['config', 'set', 'llm.provider', 'openai'], dir);
    const raw = JSON.parse(
      fs.readFileSync(path.join(dir, '.spine', 'config.json'), 'utf-8'),
    ) as Record<string, unknown>;

    const llm = raw.llm as Record<string, unknown>;
    expect(llm.provider).toBe('openai');
  });

  it('CFG-04: config get unknown key returns error', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);
    initProject(dir);

    const { stdout, stderr, status } = runCli(['config', 'get', 'nonexistent.key'], dir);
    const output = `${stdout}${stderr}`;

    expect(status).not.toBe(0);
    expect(output).toMatch(/not found|unknown|missing|no/i);
  });
});
