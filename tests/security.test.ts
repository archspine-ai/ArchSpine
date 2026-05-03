import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');
const promptsModulePath = path.join(repoRoot, 'node_modules', 'prompts', 'index.js');

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-sec-'));
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

const createdDirs: string[] = [];

afterEach(() => {
  for (const dir of createdDirs.splice(0)) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('SEC-01: LLM API key not leaked to config.json', () => {
  it('spine llm --project set api-key does not write plaintext to config.json', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);

    execFileSync('git', ['init', '-b', 'main'], { cwd: dir, stdio: 'pipe' });
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'sec-test', version: '1.0.0' }),
    );
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');

    const initWrapper = path.join(dir, 'init-wrapper.mjs');
    writeWrapperScript(
      initWrapper,
      ['init', '--agent-file', 'CLAUDE.md'],
      [['English'], false, false, true, false, false],
    );
    execFileSync('node', [initWrapper], { cwd: dir, encoding: 'utf-8', stdio: 'pipe' });

    const testApiKey = 'sk-test-secret-key-' + Date.now();
    execFileSync('node', [builtCliPath, 'llm', '--project', 'set', 'api-key', testApiKey], {
      cwd: dir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    const configPath = path.join(dir, '.spine', 'config.json');
    expect(fs.existsSync(configPath)).toBe(true);
    const configContent = fs.readFileSync(configPath, 'utf-8');
    expect(configContent).not.toContain(testApiKey);
    expect(configContent).not.toContain('sk-test-secret');
    expect(() => JSON.parse(configContent)).not.toThrow();
  }, 60_000);
});

describe('SEC-02: managed .gitignore block is created on init', () => {
  it('spine init produces a managed .gitignore block', () => {
    const dir = makeTempDir();
    createdDirs.push(dir);

    execFileSync('git', ['init', '-b', 'main'], { cwd: dir, stdio: 'pipe' });
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'sec-test2', version: '1.0.0' }),
    );
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'export const x = 1;\n');

    const initWrapper = path.join(dir, 'init-wrapper.mjs');
    writeWrapperScript(
      initWrapper,
      ['init', '--agent-file', 'CLAUDE.md'],
      [['English'], false, false, true, false, false],
    );
    execFileSync('node', [initWrapper], { cwd: dir, encoding: 'utf-8', stdio: 'pipe' });

    const gitignorePath = path.join(dir, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    // Managed block is present and covers the runtime DB and lock file.
    expect(gitignoreContent).toContain('# >>> ArchSpine managed >>>');
    expect(gitignoreContent).toContain('.spine/cache.db*');
    expect(gitignoreContent).toContain('.spine/.lock');
    // Credentials are stored via the system keychain, not in files.
    expect(gitignoreContent).not.toContain('api-key');
  }, 60_000);
});
