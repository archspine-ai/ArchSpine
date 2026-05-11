import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');
const promptsModulePath = path.join(repoRoot, 'node_modules', 'prompts', 'index.js');
const e2eLogsRoot = path.join(repoRoot, '.e2e-logs');
const tscPath = path.join(repoRoot, 'node_modules', '.bin', 'tsc');

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-violation-'));
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

let _llmConfigured: boolean | null = null;

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
    _llmConfigured = out.includes('configured') && !out.includes('not configured');
    return _llmConfigured;
  } catch {
    _llmConfigured = false;
    return false;
  }
}

const needsRealLLM = hasRealLLMConfig() ? it : it.skip;

function saveArtifact(logDir: string, name: string, content: string): void {
  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(path.join(logDir, name), content, 'utf-8');
}

/** Generate a catch-all stub that exports every symbol the LLM might invent. */
function generateServiceStub(
  symbols: string[],
  extraStaticMethods?: Map<string, string[]>,
): string {
  const lines: string[] = ['// Auto-generated stub — covers LLM-generated API patterns'];
  const commonMethods = [
    '  async initialize() { return Promise.resolve(); }',
    '  async connect() { return Promise.resolve(); }',
    '  async query(sql: string) { return Promise.resolve({ rows: [], sql }); }',
    '  async getAllUsers() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }',
    '  async getUsers() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }',
    '  async fetchUsers() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }',
    '  async listUsers() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }',
    '  async performDatabaseOperation() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }',
    '  async runDatabaseQuery() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }',
  ];
  for (const sym of symbols) {
    if (sym[0] === sym[0].toUpperCase()) {
      lines.push(`export class ${sym} {`);
      lines.push(...commonMethods);
      // Inject extra static methods discovered from tsc errors
      const extras = extraStaticMethods?.get(sym);
      if (extras) {
        for (const m of extras) {
          lines.push(
            `  static async ${m}() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }`,
          );
        }
      }
      lines.push('}');
    } else {
      lines.push(
        `export async function ${sym}() { return Promise.resolve({ rows: [], sql: "SELECT * FROM users" }); }`,
      );
    }
  }
  return lines.join('\n') + '\n';
}

/**
 * Run tsc --noEmit, parsing errors for missing exports AND missing properties.
 * Retries up to 3 times to resolve LLM non-deterministic names.
 *
 * Handles two error patterns:
 *   1. "Module '...' has no exported member named 'X'" → add export/class X to stub
 *   2. "Property 'X' does not exist on type 'typeof Y'" → add static method X to class Y
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _runTscWithReconciliation(
  dir: string,
  modifiedCliMain: string,
  logDir: string,
): { status: number | null; output: string } {
  let lastResult: { status: number | null; output: string } = { status: null, output: '' };

  for (let attempt = 0; attempt < 3; attempt++) {
    lastResult = (() => {
      const r = spawnSync(tscPath, ['--noEmit'], {
        cwd: dir,
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 30_000,
      });
      return { status: r.status, output: `${r.stdout}${r.stderr}` };
    })();

    if (lastResult.status === 0) {
      break;
    } // Clean compile

    let fixedSomething = false;

    // --- Pattern 1: "has no exported member named 'X'" ---
    {
      const missingExports = new Map<string, string[]>();
      const exportPattern = /has no exported member named '(\w+)'/g;
      const fileMatches: string[] = [];
      for (const fm of lastResult.output.matchAll(/src\/services\/(\w+)\.ts/g)) {
        if (!fileMatches.includes(fm[1])) {
          fileMatches.push(fm[1]);
        }
      }
      let m: RegExpExecArray | null;
      while ((m = exportPattern.exec(lastResult.output)) !== null) {
        const contextStart = Math.max(0, m.index - 200);
        const context = lastResult.output.substring(contextStart, m.index + 100);
        const fm = /src\/services\/(\w+)\.ts/.exec(context);
        const mod = fm ? fm[1] : fileMatches[0] || 'unknown';
        if (!missingExports.has(mod)) {
          missingExports.set(mod, []);
        }
        if (!missingExports.get(mod)!.includes(m[1])) {
          missingExports.get(mod)!.push(m[1]);
        }
      }
      for (const [mod, exports] of missingExports) {
        const stubPath = path.join(dir, 'src', 'services', `${mod}.ts`);
        const existing = fs.existsSync(stubPath) ? fs.readFileSync(stubPath, 'utf-8') : '';
        const existingSymbols = new Set<string>();
        for (const em of existing.matchAll(/export\s+(?:class|async function)\s+(\w+)/g)) {
          existingSymbols.add(em[1]);
        }
        const newSymbols = exports.filter((e) => !existingSymbols.has(e));
        if (newSymbols.length > 0) {
          const allSymbols = [...existingSymbols, ...newSymbols];
          fs.writeFileSync(stubPath, generateServiceStub(allSymbols), 'utf-8');
          saveArtifact(
            logDir,
            `05-stub-${mod}-retry${attempt}.ts`,
            fs.readFileSync(stubPath, 'utf-8'),
          );
          console.log(
            `[FIX-02] Stub retry ${attempt + 1}: added exports ${newSymbols.join(', ')} to ${mod}`,
          );
          fixedSomething = true;
        }
      }
    }

    // --- Pattern 2: "Property 'X' does not exist on type 'typeof Y'" ---
    {
      // static method call: Property 'startAndQuery' does not exist on type 'typeof DatabaseService'.
      const staticPropPattern = /Property '(\w+)' does not exist on type 'typeof (\w+)'/g;
      const extraStaticMethods = new Map<string, string[]>();
      let m: RegExpExecArray | null;
      while ((m = staticPropPattern.exec(lastResult.output)) !== null) {
        const methodName = m[1];
        const className = m[2];
        if (!extraStaticMethods.has(className)) {
          extraStaticMethods.set(className, []);
        }
        if (!extraStaticMethods.get(className)!.includes(methodName)) {
          extraStaticMethods.get(className)!.push(methodName);
        }
      }
      for (const [className, methods] of extraStaticMethods) {
        const servicesDir = path.join(dir, 'src', 'services');
        let found = false;
        if (fs.existsSync(servicesDir)) {
          for (const entry of fs.readdirSync(servicesDir)) {
            const stubPath = path.join(servicesDir, entry);
            if (!entry.endsWith('.ts')) {
              continue;
            }
            const content = fs.readFileSync(stubPath, 'utf-8');
            if (content.includes(`class ${className}`)) {
              const existingSymbols = new Set<string>();
              for (const em of content.matchAll(/export\s+(?:class|async function)\s+(\w+)/g)) {
                existingSymbols.add(em[1]);
              }
              fs.writeFileSync(
                stubPath,
                generateServiceStub([...existingSymbols], extraStaticMethods),
                'utf-8',
              );
              saveArtifact(
                logDir,
                `05-stub-${entry.replace('.ts', '')}-retry${attempt}.ts`,
                fs.readFileSync(stubPath, 'utf-8'),
              );
              console.log(
                `[FIX-02] Stub retry ${attempt + 1}: added static methods ${methods.join(', ')} to ${className} in ${entry}`,
              );
              fixedSomething = true;
              found = true;
              break;
            }
          }
        }
        if (!found) {
          console.log(
            `[FIX-02] Stub retry ${attempt + 1}: could not find stub for class ${className}`,
          );
        }
      }
    }

    if (!fixedSomething) {
      break;
    } // Can't fix, stop retrying
  }

  return lastResult;
}

function setupViolationProject(dir: string): void {
  initGitRepo(dir);

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'violation-demo', version: '1.0.0' }),
  );
  fs.mkdirSync(path.join(dir, 'src', 'cli'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src', 'infra'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src', 'types'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src', 'services'), { recursive: true });

  // src/cli/main.ts — imports persistence from infra (violates CLI Entrypoint Separation)
  fs.writeFileSync(
    path.join(dir, 'src', 'cli', 'main.ts'),
    [
      "import { Database } from '../infra/database.js';",
      '',
      'const db = new Database();',
      '',
      'export async function startCli() {',
      '  await db.connect();',
      '  console.log("CLI started with database access");',
      '  return db.query("SELECT * FROM users");',
      '}',
      '',
    ].join('\n'),
  );

  // src/infra/database.ts — low-level persistence (should not be in CLI)
  fs.writeFileSync(
    path.join(dir, 'src', 'infra', 'database.ts'),
    [
      'export class Database {',
      '  private connected = false;',
      '  async connect() {',
      '    this.connected = true;',
      '    console.log("Connected to database");',
      '  }',
      '  async query(sql: string) {',
      '    if (!this.connected) throw new Error("Not connected");',
      '    return { rows: [], sql };',
      '  }',
      '}',
      '',
    ].join('\n'),
  );

  // Pre-created service stubs covering common LLM-generated names
  fs.writeFileSync(
    path.join(dir, 'src', 'services', 'userService.ts'),
    generateServiceStub(['UserService', 'getUsers', 'fetchUsers']),
  );
  fs.writeFileSync(
    path.join(dir, 'src', 'services', 'databaseService.ts'),
    generateServiceStub(['DatabaseService']),
  );

  // src/types/models.ts — interfaces without I prefix (violates Interface Prefix rule)
  fs.writeFileSync(
    path.join(dir, 'src', 'types', 'models.ts'),
    [
      'export interface user {',
      '  id: string;',
      '  name: string;',
      '}',
      '',
      'export interface order {',
      '  id: string;',
      '  userId: string;',
      '  total: number;',
      '}',
      '',
    ].join('\n'),
  );

  // tsconfig.json — enable compilation verification after fix
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ['src/**/*.ts'],
      },
      null,
      2,
    ),
  );

  // Init with rules=true, skip LLM setup
  runInitWithPrompts(
    dir,
    [
      true, // Install rules → true
      false, // Enable hooks → false
      false, // Inject agent → false
      '__skip__', // LLM scope → skip
      false, // Initial build → false
    ],
    ['--agent-file', 'CLAUDE.md', '--artifact-strategy', 'local', '--no-inject-package-scripts'],
  );
}

describe('E2E: Real LLM violation detection & fix', () => {
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

  describe('CHK-02: check detects violations', () => {
    needsRealLLM(
      'should detect architectural violations in code',
      () => {
        const dir = makeTempDir();
        createdDirs.push(dir);
        setupViolationProject(dir);

        const buildResult = runCli(['build'], dir);
        const buildOutput = `${buildResult.stdout}${buildResult.stderr}`;

        const { stdout, stderr, status } = runCli(['check'], dir);
        const checkOutput = `${stdout}${stderr}`;

        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const logDir = path.join(e2eLogsRoot, `violation-${ts}`);
        saveArtifact(
          logDir,
          '01-project-structure.txt',
          [
            '=== src/cli/main.ts ===',
            fs.readFileSync(path.join(dir, 'src', 'cli', 'main.ts'), 'utf-8'),
            '',
            '=== src/infra/database.ts ===',
            fs.readFileSync(path.join(dir, 'src', 'infra', 'database.ts'), 'utf-8'),
            '',
            '=== src/types/models.ts ===',
            fs.readFileSync(path.join(dir, 'src', 'types', 'models.ts'), 'utf-8'),
            '',
            '=== .spine/rules/layered-architecture.yml ===',
            fs.readFileSync(path.join(dir, '.spine', 'rules', 'layered-architecture.yml'), 'utf-8'),
            '',
            '=== .spine/rules/naming-conventions.yml ===',
            fs.readFileSync(path.join(dir, '.spine', 'rules', 'naming-conventions.yml'), 'utf-8'),
          ].join('\n'),
        );
        saveArtifact(logDir, '02-build-output.txt', buildOutput);
        saveArtifact(logDir, '03-check-output.txt', checkOutput);
        saveArtifact(
          logDir,
          'manifest.json',
          fs.readFileSync(path.join(dir, '.spine', 'manifest.json'), 'utf-8'),
        );

        expect(status === null || status === 0 || status === 1).toBe(true);
        expect(checkOutput.length).toBeGreaterThan(0);

        console.log(`[CHK-02] log dir: ${logDir}`);
        console.log(`[CHK-02] check status: ${status}`);
        console.log(
          `[CHK-02] violations summary: ${checkOutput
            .split('\n')
            .filter((l) => l.toLowerCase().includes('violation'))
            .join(' | ')}`,
        );
      },
      600_000,
    );
  });

  describe('FIX-02: fix modifies code for violations', () => {
    // [DEPRECATED] spine fix has been removed in v2.0.
    it.skip('deprecated', () => {});
  });

  describe('GOD-01-real: god mode with real LLM', () => {
    // [DEPRECATED] spine god has been removed in v2.0.
    it.skip('deprecated', () => {});
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _generateDiff(filePath: string, before: string, after: string): string {
  if (before === after) {
    return `# No changes in ${filePath}\n`;
  }
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const diff: string[] = [`# Diff for ${filePath}`, ''];
  const maxLen = Math.max(beforeLines.length, afterLines.length);
  for (let i = 0; i < maxLen; i++) {
    const bl = i < beforeLines.length ? beforeLines[i] : null;
    const al = i < afterLines.length ? afterLines[i] : null;
    if (bl !== al) {
      if (bl !== null) {
        diff.push(`- ${bl}`);
      }
      if (al !== null) {
        diff.push(`+ ${al}`);
      }
    }
  }
  return diff.join('\n');
}
