import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync, spawnSync } from 'child_process';
import prompts from 'prompts';
import { SyncService } from '../../../src/services/sync-service.js';
import { runCheck } from '../../../src/engines/check.js';
import { runFix } from '../../../src/engines/fix.js';
import { MockClient } from '../../../src/infra/__mocks__/llm.js';
import { Manifest } from '../../../src/infra/manifest.js';
import { fileURLToPath } from 'url';

describe('demo governance acceptance', () => {
  let testDir: string;
  const demoRoot = path.join(process.cwd(), 'examples', 'demo-project');
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');

  function runBuiltCli(command: string, args: string[] = []) {
    return spawnSync('node', [builtCliPath, command, ...args], {
      cwd: testDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  }

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-demo-'));
    fs.mkdirSync(path.join(testDir, 'src', 'api'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'src', 'domain'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'src', 'infra'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.spine', 'rules'), { recursive: true });

    fs.copyFileSync(path.join(demoRoot, '.gitignore'), path.join(testDir, '.gitignore'));
    fs.copyFileSync(path.join(demoRoot, '.gitattributes'), path.join(testDir, '.gitattributes'));
    fs.copyFileSync(path.join(demoRoot, 'README.md'), path.join(testDir, 'README.md'));
    fs.copyFileSync(
      path.join(demoRoot, 'src', 'api', 'handler.ts'),
      path.join(testDir, 'src', 'api', 'handler.ts'),
    );
    fs.copyFileSync(
      path.join(demoRoot, 'src', 'domain', 'user-service.ts'),
      path.join(testDir, 'src', 'domain', 'user-service.ts'),
    );
    fs.copyFileSync(
      path.join(demoRoot, 'src', 'infra', 'database.ts'),
      path.join(testDir, 'src', 'infra', 'database.ts'),
    );
    fs.copyFileSync(
      path.join(demoRoot, '.spine', 'config.json'),
      path.join(testDir, '.spine', 'config.json'),
    );
    fs.copyFileSync(
      path.join(demoRoot, '.spine', 'rules', 'arch.yml'),
      path.join(testDir, '.spine', 'rules', 'arch.yml'),
    );

    execSync('git init -b main', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Init governance demo fixture"', { cwd: testDir });

    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('keeps the documented CLI demo path free of readonly database failures', () => {
    if (!fs.existsSync(builtCliPath)) {
      throw new Error(
        `Built CLI missing at ${builtCliPath}. Run 'npm run build' before this test.`,
      );
    }

    const llmResult = runBuiltCli('llm', ['--project', 'set', 'provider', 'mock']);
    expect(llmResult.status).toBe(0);

    const buildResult = runBuiltCli('build');
    const buildOutput = `${buildResult.stdout || ''}${buildResult.stderr || ''}`;
    expect(buildResult.status).toBe(0);
    expect(buildOutput).toContain('[Spine Build Summary]');
    expect(buildOutput).not.toContain('readonly database');
    expect(buildOutput).not.toContain('SQLITE_READONLY');
    expect(fs.existsSync(path.join(testDir, '.spine', 'manifest.json'))).toBe(true);

    const syncResult = runBuiltCli('sync');
    const syncOutput = `${syncResult.stdout || ''}${syncResult.stderr || ''}`;
    expect(syncResult.status).toBe(0);
    expect(syncOutput).toContain('[Spine Sync Summary]');
    expect(syncOutput).not.toContain('Semantic mirror baseline missing');
    expect(syncOutput).not.toContain('readonly database');
    expect(syncOutput).not.toContain('SQLITE_READONLY');

    // View directory may be created during sync even when empty.
    // The important thing is no database errors occurred during the workflow.

    const checkResult = runBuiltCli('check');
    const checkOutput = `${checkResult.stdout || ''}${checkResult.stderr || ''}`;
    expect(checkResult.status).toBe(1);
    expect(checkOutput).toContain('layer-isolation');
    expect(checkOutput).not.toContain('readonly database');
    expect(checkOutput).not.toContain('SQLITE_READONLY');
  }, 120_000);

  it('keeps the governance demo build -> sync -> check -> fix path working', async () => {
    const mockClient = new MockClient({ apiKey: '' });
    const synchronizer = new SyncService({
      rootDir: testDir,
      llmClient: mockClient,
      targetLocales: ['English'],
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const buildStats = await synchronizer.sync(true);
    expect(buildStats.processed).toBeGreaterThan(0);

    const syncStats = await synchronizer.sync(false);
    expect(syncStats.processed).toBeGreaterThanOrEqual(0);
    expect(fs.existsSync(path.join(testDir, '.spine', 'cache.db'))).toBe(true);

    const checkSummary = await runCheck(testDir, mockClient);
    expect(checkSummary.totalViolations).toBe(1);
    expect(checkSummary.filesWithViolations).toBe(1);

    const manifest = Manifest.open(testDir);
    const activeAfterCheck = manifest.getActiveViolations();
    expect(activeAfterCheck).toHaveLength(1);
    expect(activeAfterCheck[0].rule_id).toBe('layer-isolation');

    prompts.inject([true]);
    const fixSummary = await runFix(testDir, mockClient);
    expect(fixSummary.initialViolations).toBe(1);
    expect(fixSummary.remainingViolations).toBe(0);
    expect(fixSummary.fixed).toBe(1);

    const activeAfterFix = manifest.getActiveViolations();
    expect(activeAfterFix).toHaveLength(0);

    const finalSource = fs.readFileSync(path.join(testDir, 'src', 'api', 'handler.ts'), 'utf-8');
    expect(finalSource).not.toContain('../infra/database.js');

    const transcript = [
      ...logSpy.mock.calls.flat(),
      ...errorSpy.mock.calls.flat(),
      ...warnSpy.mock.calls.flat(),
    ]
      .map((value) => String(value))
      .join('\n');

    expect(transcript).toContain('layer-isolation');
    expect(transcript).toContain('[Task: Fix] Found 1 violations across 1 file(s).');
    expect(transcript).toContain('[Fix Summary] Active violations: 1 -> 0');
  });
});
