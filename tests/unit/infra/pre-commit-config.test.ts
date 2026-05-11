import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { Config } from '../../../src/infra/config.js';
import { installGitHook } from '../../../src/utils/git-hook.js';
import { CURRENT_CONFIG_SCHEMA_VERSION } from '../../../src/types/protocol.js';

describe('Pre-commit configuration', () => {
  let testDir: string;
  const originalEnv = process.env.SPINE_PRECOMMIT;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-pre-commit-'));
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, '.spine', 'config.json'),
      JSON.stringify(
        {
          schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
          project: {
            name: 'test-project',
            locales: ['English'],
          },
          llm: {
            provider: 'mock',
          },
          hooks: {
            preCommit: false,
          },
        },
        null,
        2,
      ),
    );

    execSync('git init -b main', { cwd: testDir });
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.SPINE_PRECOMMIT;
    } else {
      process.env.SPINE_PRECOMMIT = originalEnv;
    }

    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('prefers SPINE_PRECOMMIT over persisted config', () => {
    process.env.SPINE_PRECOMMIT = 'true';

    const config = new Config(testDir);
    const resolution = config.getPreCommitResolution();

    expect(resolution.value).toBe(true);
    expect(resolution.source).toBe('env');
  });

  it('defaults hook sync mode to hook and allows explicit override', () => {
    const config = new Config(testDir);

    expect(config.getHookSyncMode()).toBe('hook');

    config.setHookSyncMode('hook');
    expect(config.getHookSyncMode()).toBe('hook');
  });

  it('writes a managed hook block that delegates to the CLI', () => {
    const previousCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = installGitHook();
      expect(result.status).toBe('installed');
    } finally {
      process.chdir(previousCwd);
    }

    const hookPath = path.join(testDir, '.git', 'hooks', 'pre-commit');
    const hook = fs.readFileSync(hookPath, 'utf-8');

    expect(hook).toContain('# >>> ArchSpine pre-commit >>>');
    expect(hook).toContain('SPINE_CMD="./node_modules/.bin/spine"');
    expect(hook).toContain('elif command -v spine >/dev/null 2>&1; then');
    expect(hook).toContain('PRE_COMMIT_ENABLED=$($SPINE_CMD hook should-run 2>/dev/null)');
    expect(hook).toContain('$SPINE_CMD hook run');
    expect(hook).not.toContain('enablePreCommit');
    expect(hook).not.toContain('node -e');
  });

  it('returns a recovery hint instead of exiting when not run at a git repository root', () => {
    const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-non-git-'));
    const previousCwd = process.cwd();
    process.chdir(nonGitDir);

    try {
      const result = installGitHook();
      expect(result.status).toBe('skipped-no-git-root');
      if (result.status === 'skipped-no-git-root') {
        expect(result.message).toContain('Git repository root');
        expect(result.message).toContain('git init');
        expect(result.message).toContain("rerun 'spine init'");
      }
    } finally {
      process.chdir(previousCwd);
      fs.rmSync(nonGitDir, { recursive: true, force: true });
    }
  });
});
