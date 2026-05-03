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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-real-'));
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

let _llmConfigured: boolean | null = null;

/** Only run real LLM tests when explicitly opted in via SPINE_E2E_REAL_LLM=1 */
function hasRealLLMConfig(): boolean {
  if (_llmConfigured !== null) {
    return _llmConfigured;
  }

  if (process.env.SPINE_E2E_REAL_LLM !== '1') {
    _llmConfigured = false;
    return false;
  }

  if (process.env.SPINE_PROVIDER && process.env.SPINE_API_KEY) {
    _llmConfigured = true;
    return true;
  }

  try {
    const out = execFileSync('node', [builtCliPath, 'llm', 'show'], {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const configured = out.includes('configured') && !out.includes('not configured');
    _llmConfigured = configured;
    return configured;
  } catch {
    _llmConfigured = false;
    return false;
  }
}

const needsRealLLM = hasRealLLMConfig() ? it : it.skip;

describe('E2E: Real LLM integration', () => {
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
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const hello = "world";\n');
    runInitWithPrompts(
      dir,
      [['English'], false, false, true, false, false],
      ['--agent-file', 'CLAUDE.md'],
    );
  }

  describe('LLM connectivity', () => {
    needsRealLLM(
      'LLM-01: spine llm test succeeds with valid config',
      () => {
        const dir = makeTempDir();
        createdDirs.push(dir);
        initProject(dir);

        const { stdout, stderr, status } = runCli(['llm', 'test'], dir);
        const output = `${stdout}${stderr}`;

        expect(status).toBe(0);
        expect(output).toMatch(/success|ok|connected|valid|passed/i);
      },
      60_000,
    );

    needsRealLLM(
      'LLM-02: spine build with real LLM completes successfully',
      () => {
        const dir = makeTempDir();
        createdDirs.push(dir);
        initProject(dir);

        const { stdout, stderr, status } = runCli(['build'], dir);
        const output = `${stdout}${stderr}`;

        expect(status).toBe(0);
        expect(output).toContain('[Spine Build Summary]');
        expect(output).not.toMatch(/Failed:\s*[1-9]/);
        expect(fs.existsSync(path.join(dir, '.spine', 'atlas', 'English', 'project.md'))).toBe(
          true,
        );
      },
      300_000,
    );

    needsRealLLM(
      'LLM-03: spine sync with real LLM after file change',
      () => {
        const dir = makeTempDir();
        createdDirs.push(dir);
        initProject(dir);

        runCliOk(['build'], dir);

        fs.writeFileSync(
          path.join(dir, 'src', 'index.ts'),
          'export const hello = "world";\nexport const version = "2.0";\n',
        );

        const { stdout, stderr, status } = runCli(['sync'], dir);
        const output = `${stdout}${stderr}`;

        expect(status).toBe(0);
        expect(output).toContain('[Spine Sync Summary]');
        expect(output).toMatch(/Processed:\s*[1-9]/);
      },
      300_000,
    );

    needsRealLLM(
      'LLM-04: spine fix reports experimental status with real LLM',
      () => {
        const dir = makeTempDir();
        createdDirs.push(dir);
        initProject(dir);

        runCliOk(['build'], dir);

        const { stdout, stderr, status } = runCli(['fix'], dir);
        const output = `${stdout}${stderr}`;

        expect(status).toBe(0);
        expect(output).toMatch(/no|nothing|none|experimental|fix/i);
      },
      120_000,
    );
  });

  describe('Security: API key handling', () => {
    it('SEC-01: config.json does not contain plaintext api-key after llm set', () => {
      const dir = makeTempDir();
      createdDirs.push(dir);
      initProject(dir);

      // Set a fake API key via project config
      runCli(['llm', '--project', 'set', 'api-key', 'sk-test-plaintext-secret-12345'], dir);

      const configRaw = fs.readFileSync(path.join(dir, '.spine', 'config.json'), 'utf-8');
      // Plaintext key should never appear in config.json
      expect(configRaw).not.toContain('sk-test-plaintext-secret-12345');
    });
  });
});
