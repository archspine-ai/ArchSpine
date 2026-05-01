import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  assertPublishRuntimeBaseline,
  assertPublishSnapshotReady,
} from '../src/services/publish-preflight.js';
import { ArchSpineError, ErrorCodes } from '../src/core/errors.js';
import { serializeLockPayload } from '../src/utils/lock.js';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-publish-preflight-'));
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');

function makeRuntimeBaseline(rootDir: string): void {
  const spineDir = path.join(rootDir, '.spine');
  fs.mkdirSync(spineDir, { recursive: true });
  fs.writeFileSync(
    path.join(spineDir, 'manifest.json'),
    JSON.stringify({ sync: { mode: 'full', lastSyncAt: new Date().toISOString() } }),
  );
  fs.writeFileSync(
    path.join(spineDir, 'protected-output-baseline.json'),
    JSON.stringify({ generatedAt: Date.now(), entries: [] }),
  );
}

function writeRuntimeLock(rootDir: string, pid: number, token: string = 'runtime-token'): void {
  const spineDir = path.join(rootDir, '.spine');
  fs.mkdirSync(spineDir, { recursive: true });
  fs.writeFileSync(
    path.join(spineDir, '.lock'),
    serializeLockPayload({ pid, timestamp: Date.now(), token }),
  );
}

function runBuiltCli(args: string[], cwd: string): string {
  return execFileSync('node', [builtCliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
}

function runBuiltCliFailure(args: string[], cwd: string): { status?: number; output: string } {
  try {
    runBuiltCli(args, cwd);
    throw new Error(`Expected CLI command to fail: ${args.join(' ')}`);
  } catch (error) {
    const commandError = error as { status?: number; stdout?: string; stderr?: string };
    return {
      status: commandError.status,
      output: `${commandError.stdout || ''}${commandError.stderr || ''}`,
    };
  }
}

describe('publish preflight checks', () => {
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

  it('fails with a structured error when .spine runtime layer is missing', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    expect(() => assertPublishRuntimeBaseline(rootDir)).toThrowError(ArchSpineError);
    expect(() => assertPublishRuntimeBaseline(rootDir)).toThrowError(/runtime layer is missing/i);

    try {
      assertPublishRuntimeBaseline(rootDir);
    } catch (error) {
      const wrapped = error as ArchSpineError;
      expect(wrapped.code).toBe(ErrorCodes.PublishRuntimeMissing);
    }
  });

  it('fails with a structured error when runtime baseline state files are missing', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, '.spine'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, '.spine', 'manifest.json'), '{}');

    expect(() => assertPublishRuntimeBaseline(rootDir)).toThrowError(
      /runtime baseline is incomplete/i,
    );

    try {
      assertPublishRuntimeBaseline(rootDir);
    } catch (error) {
      const wrapped = error as ArchSpineError;
      expect(wrapped.code).toBe(ErrorCodes.PublishRuntimeBaselineIncomplete);
      expect(wrapped.context?.baselineExists).toBe(false);
    }
  });

  it('fails with a structured lock error when .spine/.lock is present', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    writeRuntimeLock(rootDir, process.pid);

    try {
      assertPublishRuntimeBaseline(rootDir);
      throw new Error('Expected lock preflight to fail.');
    } catch (error) {
      const wrapped = error as ArchSpineError;
      expect(wrapped.code).toBe(ErrorCodes.PublishLockActive);
      expect(String(wrapped.message)).toContain('Runtime lock detected');
      expect(wrapped.context?.ownerKnown).toBe(true);
      expect(wrapped.context?.lockValid).toBe(true);
    }
  });

  it('fails with stale-lock guidance when lock owner process is gone', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    writeRuntimeLock(rootDir, 999999);

    try {
      assertPublishRuntimeBaseline(rootDir);
      throw new Error('Expected stale lock preflight to fail.');
    } catch (error) {
      const wrapped = error as ArchSpineError;
      expect(wrapped.code).toBe(ErrorCodes.PublishLockActive);
      expect(String(wrapped.message)).toContain('stale runtime lock');
      expect(wrapped.context?.stale).toBe(true);
      expect(wrapped.context?.lockValid).toBe(true);
    }
  });

  it('fails closed with explicit guidance when lock owner cannot be verified', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    writeRuntimeLock(rootDir, 424242);
    const killSpy = vi
      .spyOn(process, 'kill')
      .mockImplementation((pid: number, signal?: number | NodeJS.Signals) => {
        if (pid === 424242 && signal === 0) {
          const error = Object.assign(new Error('operation not permitted'), { code: 'EPERM' });
          throw error;
        }
        return true;
      });

    try {
      assertPublishRuntimeBaseline(rootDir);
      throw new Error('Expected unverifiable lock preflight to fail.');
    } catch (error) {
      const wrapped = error as ArchSpineError;
      expect(wrapped.code).toBe(ErrorCodes.PublishLockActive);
      expect(String(wrapped.message)).toContain('owner could not be verified');
      expect(wrapped.context?.ownerKnown).toBe(true);
      expect(wrapped.context?.ownerVerifiable).toBe(false);
      expect(wrapped.context?.lockValid).toBe(true);
    } finally {
      killSpy.mockRestore();
    }
  });

  it('passes runtime preflight and fails snapshot preflight when distributable files are incomplete', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);

    expect(() => assertPublishRuntimeBaseline(rootDir)).not.toThrow();
    try {
      assertPublishSnapshotReady(rootDir);
      throw new Error('Expected snapshot preflight to fail.');
    } catch (error) {
      const wrapped = error as ArchSpineError;
      expect(wrapped.code).toBe(ErrorCodes.PublishSnapshotIncomplete);
      expect(String(wrapped.message)).toMatch(/distributable snapshot is incomplete/i);
    }
  });

  it('passes both preflight checks when runtime and snapshot state exist', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);

    fs.mkdirSync(path.join(rootDir, '.spine', 'index'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, '.spine', 'atlas', 'en-US'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, '.spine', 'index', 'project.json'), '{}');

    expect(() => assertPublishRuntimeBaseline(rootDir)).not.toThrow();
    expect(() => assertPublishSnapshotReady(rootDir)).not.toThrow();
  });

  it('prints publish help with runtime baseline guidance', () => {
    const output = runBuiltCli(['publish', '--help'], repoRoot);

    expect(output).toContain('Usage:');
    expect(output).toContain('spine publish');
    expect(output).toContain('requires an existing .spine runtime baseline');
    expect(output).toContain('fails closed if .spine/.lock is present');
  });

  it('surfaces a clear CLI error when publish is run without runtime baseline', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);

    const result = runBuiltCliFailure(['publish'], rootDir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('[PUBLISH_RUNTIME_MISSING]');
    expect(result.output).toContain('.spine runtime layer is missing');
    expect(result.output).toContain("Run 'spine init' and 'spine build' before publishing.");
  });

  it('surfaces a clear CLI error when publish is run with an incomplete runtime baseline', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, '.spine'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, '.spine', 'manifest.json'), '{}');

    const result = runBuiltCliFailure(['publish'], rootDir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('[PUBLISH_RUNTIME_BASELINE_INCOMPLETE]');
    expect(result.output).toContain('Runtime baseline is incomplete');
    expect(result.output).toContain("Run 'spine build' first.");
  });

  it('surfaces a clear CLI error when publish is blocked by an active runtime lock', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    writeRuntimeLock(rootDir, process.pid);

    const result = runBuiltCliFailure(['publish'], rootDir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('[PUBLISH_LOCK_ACTIVE]');
    expect(result.output).toContain('Runtime lock detected');
    expect(result.output).toContain(
      'Finish ongoing local sync/check/fix or clear stale lock before publishing.',
    );
  });

  it('surfaces stale-lock guidance when publish is blocked by a stale runtime lock', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    writeRuntimeLock(rootDir, 999999);

    const result = runBuiltCliFailure(['publish'], rootDir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('[PUBLISH_LOCK_ACTIVE]');
    expect(result.output).toContain('Found a stale runtime lock');
    expect(result.output).toContain(
      "Run 'spine build' to rebuild runtime state before publishing.",
    );
  });

  it('fails closed when publish sees an unreadable runtime lock file', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    fs.writeFileSync(path.join(rootDir, '.spine', '.lock'), '{broken-json');

    const result = runBuiltCliFailure(['publish'], rootDir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('[PUBLISH_LOCK_ACTIVE]');
    expect(result.output).toContain('Runtime lock file is invalid or uses an unsupported format');
  });

  it('fails closed when publish sees a runtime lock file without a token', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    fs.writeFileSync(
      path.join(rootDir, '.spine', '.lock'),
      JSON.stringify({ pid: process.pid, timestamp: Date.now() }),
    );

    const result = runBuiltCliFailure(['publish'], rootDir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('[PUBLISH_LOCK_ACTIVE]');
    expect(result.output).toContain('unsupported format');
  });

  it('surfaces a clear CLI error when publish completes sync but snapshot stays incomplete', () => {
    const rootDir = makeTempDir();
    createdDirs.push(rootDir);
    makeRuntimeBaseline(rootDir);
    fs.writeFileSync(path.join(rootDir, '.spineignore'), '*\n');

    const result = runBuiltCliFailure(['publish'], rootDir);

    expect(result.status).toBe(1);
    expect(result.output).toContain('[PUBLISH_SNAPSHOT_INCOMPLETE]');
    expect(result.output).toContain('Preparing canonical distributable .spine snapshot');
    expect(result.output).toContain('Preflight passed');
    expect(result.output).toContain('Distributable snapshot is incomplete');
    expect(result.output).toContain("Re-run 'spine build' and then 'spine publish'.");
  });
});
