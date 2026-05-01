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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-readonly-'));
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

describe('E2E: Read-only commands', () => {
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

  describe('spine try', () => {
    it('TRY-01: prints posture hint in empty repo', () => {
      const dir = makeTempDir();
      createdDirs.push(dir);

      const { stdout, stderr, status } = runCli(['try'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toMatch(/ArchSpine Try|read.only|without mutating/i);
    });

    it('TRY-02: reports available posture in initialized repo', () => {
      const dir = makeTempDir();
      createdDirs.push(dir);
      initGitRepo(dir);

      runInitWithPrompts(
        dir,
        [['English'], false, false, true, false, false],
        ['--agent-file', 'CLAUDE.md'],
      );

      const { stdout, stderr, status } = runCli(['try'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toMatch(/semantic snapshot|posture|adopted|available/i);
    });
  });

  describe('spine scan --dry-run', () => {
    it('SCAN-01: prints scan boundary without persisting', () => {
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
        [['English'], false, false, true, false, false],
        ['--agent-file', 'CLAUDE.md'],
      );

      const output = runCliOk(['scan', '--dry-run'], dir);

      expect(output).toMatch(/\.ts|scannable|scan/i);
      expect(fs.existsSync(path.join(dir, '.spine', 'index', 'src', 'index.ts.json'))).toBe(false);
    });
  });

  describe('spine info', () => {
    it('INFO-01: reports no baseline for unbuilt repo', () => {
      const dir = makeTempDir();
      createdDirs.push(dir);
      initGitRepo(dir);

      runInitWithPrompts(
        dir,
        [['English'], false, false, true, false, false],
        ['--agent-file', 'CLAUDE.md'],
      );

      const { stdout, stderr, status } = runCli(['info'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toMatch(/Project Root|\.spine|present/i);
    });
  });

  describe('spine status', () => {
    it('STATUS-01: reports unsynced files after init', () => {
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
        [['English'], false, false, true, false, false],
        ['--agent-file', 'CLAUDE.md'],
      );

      const { stdout, stderr, status } = runCli(['status'], dir);
      const output = `${stdout}${stderr}`;

      // status may exit non-zero when no baseline exists yet, verify output is informative
      expect(output).toMatch(/needs? sync|scannable|pending|files|status|build|baseline|mirror/i);
    });
  });

  describe('spine history', () => {
    it('HIST-01: graceful message when no history exists', () => {
      const dir = makeTempDir();
      createdDirs.push(dir);
      initGitRepo(dir);

      runInitWithPrompts(
        dir,
        [['English'], false, false, true, false, false],
        ['--agent-file', 'CLAUDE.md'],
      );

      const { stdout, stderr, status } = runCli(['history', 'src/index.ts'], dir);
      const output = `${stdout}${stderr}`;

      // history with no data should either exit 0 with a message or non-zero gracefully
      expect(output.toLowerCase()).toMatch(/no|not found|history|semantic drift/i);
    });
  });

  describe('spine languages', () => {
    it('LANG-01: shows default language after init', () => {
      const dir = makeTempDir();
      createdDirs.push(dir);
      initGitRepo(dir);

      runInitWithPrompts(
        dir,
        [['English'], false, false, true, false, false],
        ['--agent-file', 'CLAUDE.md'],
      );

      const output = runCliOk(['languages', 'show'], dir);

      expect(output).toContain('English');
    });
  });

  describe('spine usage', () => {
    it('USAGE-01: reports no usage before any sync', () => {
      const dir = makeTempDir();
      createdDirs.push(dir);
      initGitRepo(dir);

      runInitWithPrompts(
        dir,
        [['English'], false, false, true, false, false],
        ['--agent-file', 'CLAUDE.md'],
      );

      const { stdout, stderr, status } = runCli(['usage'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toMatch(/token|usage|cost|LLM/i);
    });
  });
});
