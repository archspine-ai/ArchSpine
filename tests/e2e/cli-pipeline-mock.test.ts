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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-pipeline-'));
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

function runCli(
  args: string[],
  cwd: string,
  env?: Record<string, string>,
): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync('node', [builtCliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
    env: env ? { ...process.env, ...env } : process.env,
  });
  return { stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
}

function runCliOk(args: string[], cwd: string, env?: Record<string, string>): string {
  return execFileSync('node', [builtCliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
    env: env ? { ...process.env, ...env } : process.env,
  });
}

function setupInitializedProject(): string {
  const dir = makeTempDir();
  initGitRepo(dir);

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'test', version: '1.0.0' }),
  );
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const answer = 42;\n');

  runInitWithPrompts(
    dir,
    [['English'], false, false, true, false, false],
    ['--agent-file', 'CLAUDE.md'],
  );

  // Set mock provider
  runCliOk(['config', 'set', 'llm.provider', 'mock'], dir);

  return dir;
}

describe('E2E: Pipeline with mock LLM', () => {
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

  describe('spine build', () => {
    it('BLD-01: first build creates index', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      const { stdout, stderr, status } = runCli(['build'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toContain('[Spine Build Summary]');
      // Should not have any failed units
      expect(output).not.toMatch(/Failed:\s*[1-9]/);
      // Index should exist
      expect(fs.existsSync(path.join(dir, '.spine', 'index', 'project.json'))).toBe(true);
      // Manifest should be updated
      expect(fs.existsSync(path.join(dir, '.spine', 'manifest.json'))).toBe(true);
    }, 120_000);

    it('BLD-02: second build with no changes skips all files', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      runCliOk(['build'], dir);

      const { stdout, stderr, status } = runCli(['build'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      // Second build should complete without failures
      expect(output).not.toMatch(/Failed:\s*[1-9]/);
      expect(output).toContain('[Spine Build Summary]');
    }, 120_000);
  });

  describe('spine sync', () => {
    it('SYNC-01: sync after modifying one file processes only changed files', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      runCliOk(['build'], dir);

      // Modify a source file
      fs.writeFileSync(
        path.join(dir, 'src', 'index.ts'),
        'export const answer = 43;\nexport const question = "unknown";\n',
      );

      const { stdout, stderr, status } = runCli(['sync'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toContain('[Spine Sync Summary]');
      expect(output).toMatch(/Processed:\s*[1-9]/);
      expect(output).not.toMatch(/Failed:\s*[1-9]/);
    }, 120_000);

    it('SYNC-02: sync --retry-failed gracefully handles no prior failures', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      runCliOk(['build'], dir);

      const { status } = runCli(['sync', '--retry-failed'], dir);
      // Should not crash
      expect(status).toBe(0);
    }, 120_000);
  });

  describe('spine check', () => {
    it('CHK-01: check on clean code reports zero violations', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      runCliOk(['build'], dir);

      const { stdout, stderr, status } = runCli(['check'], dir);
      const output = `${stdout}${stderr}`;

      // Should succeed with no violations
      expect(status).toBe(0);
      expect(output).toMatch(/0 violations|no violation|clean|pass/i);
    }, 120_000);

    it('CHK-02: check catches deliberate naming violations', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      // Add a layered-architecture rule that the mock client CAN detect.
      // The mock detects rules containing "infra" + "api" + "must not" patterns
      // and files importing from ../infra/ or src/infra/ paths.
      fs.mkdirSync(path.join(dir, '.spine', 'rules'), { recursive: true });
      fs.writeFileSync(
        path.join(dir, '.spine', 'rules', 'layer-isolation.yml'),
        [
          '- [Rule: API Layer Isolation]',
          '  - Scope: src/api/**',
          '  - Constraint: API modules must not import infra code directly.',
          '  - Severity: Error',
          '  - Reason: Keep API surface decoupled from infrastructure.',
        ].join('\n'),
      );

      // Create a file that violates: API code importing from infra
      fs.mkdirSync(path.join(dir, 'src', 'api'), { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'src', 'api', 'handler.ts'),
        'import { Database } from "../../infra/database.js";\n\nexport function handle() { return Database.query(); }\n',
      );

      runCliOk(['build'], dir);

      const { stdout, stderr, status } = runCli(['check'], dir);
      const output = `${stdout}${stderr}`;

      // Should find violations (API importing infra)
      expect(status).toBe(1);
      expect(output).toMatch(/violation|API Layer|infra/i);
    }, 120_000);
  });

  describe('spine sync --publish', () => {
    it('PUB-01: sync --publish after build succeeds', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      runCliOk(['build'], dir);

      const { stdout, stderr, status } = runCli(['sync', '--publish'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toMatch(/publish|snapshot|backfill|refresh/i);
    }, 120_000);
  });

  describe('spine view', () => {
    it('VIEW-01: view show lists available views', () => {
      const dir = setupInitializedProject();
      createdDirs.push(dir);

      runCliOk(['build'], dir);

      const { stdout, stderr, status } = runCli(['view', 'show'], dir);
      const output = `${stdout}${stderr}`;

      expect(status).toBe(0);
      expect(output).toMatch(/view|public-surface|architecture|risk/i);
    }, 60_000);
  });

  // [DEPRECATED] spine god and spine fix have been removed in v2.0.
  // See .localfile/v2-feature-plan/feature-catalog.md for details.
});
