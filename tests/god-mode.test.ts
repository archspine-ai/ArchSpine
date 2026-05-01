import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { SyncService } from '../src/services/sync-service.js';
import { runGodMode } from '../src/engines/god.js';
import { MockClient } from '../src/infra/__mocks__/llm.js';

describe('God mode dossier', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-god-mode-'));
    fs.mkdirSync(path.join(testDir, 'src', 'nested'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'src', 'index.ts'), 'export const alpha = 1;\n');
    fs.writeFileSync(path.join(testDir, 'src', 'nested', 'beta.ts'), 'export const beta = 2;\n');

    execSync('git init -b main', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Init"', { cwd: testDir });
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('writes a project-wide dossier when god mode is enabled', async () => {
    const synchronizer = new SyncService({
      rootDir: testDir,
      llmClient: new MockClient({ apiKey: '' }),
      targetLocales: ['English'],
    });
    await synchronizer.sync(true);

    const { outputPath } = runGodMode(testDir);
    const godPath = path.join(testDir, '.spine', `${path.basename(testDir)}-god.md`);
    expect(outputPath).toBe(godPath);
    expect(fs.existsSync(godPath)).toBe(true);

    const content = fs.readFileSync(godPath, 'utf-8');
    expect(content).toContain('# God Mode Dossier');
    expect(content).toContain('Human-only, non-production output.');
    expect(content).toContain('Joke mode output');
    expect(content).toContain('## Project Summary');
    expect(content).toContain('## File Ledger');
    expect(content).toContain('src/index.ts');
    expect(content).toContain('src/nested/beta.ts');
  });
});
