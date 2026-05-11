import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';
import { once } from 'events';
import { FileSystemManager } from '../../../src/utils/fs.js';
import { ErrorCodes } from '../../../src/core/errors.js';
import { parseLockPayload, serializeLockPayload } from '../../../src/utils/lock.js';

const workerPath = path.join(process.cwd(), 'tests/helpers/lock-worker.mjs');

type WorkerMode = 'acquire-release' | 'acquire-hold' | 'acquire-release-rewrite';

type WorkerResult = {
  status: string;
  pid: number;
  code?: string | null;
  message?: string;
};

function spawnLockWorker(rootDir: string, mode: WorkerMode, holdMs: number = 0): ChildProcess {
  return spawn(process.execPath, [workerPath, rootDir, mode, String(holdMs)], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function waitForFirstWorkerMessage(child: ChildProcess): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
      const newlineIndex = stdout.indexOf('\n');
      if (newlineIndex === -1) {
        return;
      }

      const line = stdout.slice(0, newlineIndex).trim();
      if (!line) {
        return;
      }

      try {
        resolve(JSON.parse(line) as WorkerResult);
      } catch (error) {
        reject(error);
      }
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (stdout.trim().length === 0) {
        reject(
          new Error(`Lock worker exited before emitting output (code ${code}). stderr: ${stderr}`),
        );
      }
    });
  });
}

async function runLockWorker(
  rootDir: string,
  mode: WorkerMode,
  holdMs: number = 0,
): Promise<WorkerResult> {
  const child = spawnLockWorker(rootDir, mode, holdMs);
  const result = await waitForFirstWorkerMessage(child);
  await once(child, 'exit');
  return result;
}

describe('ArchSpine Robustness Stress Test', () => {
  let rootDir: string;
  let spineDir: string;

  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-robustness-'));
    spineDir = path.join(rootDir, '.spine');
    fs.mkdirSync(spineDir, { recursive: true });
  });

  afterEach(() => {
    if (rootDir && fs.existsSync(rootDir)) {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it('recovers from a stale lock left by a dead process', async () => {
    fs.writeFileSync(
      path.join(spineDir, '.lock'),
      serializeLockPayload({ pid: 999999, timestamp: Date.now(), token: 'stale-token' }),
    );

    await expect(runLockWorker(rootDir, 'acquire-release')).resolves.toMatchObject({
      status: 'acquired-and-released',
    } satisfies Partial<WorkerResult>);
    expect(fs.existsSync(path.join(spineDir, '.lock'))).toBe(false);
  });

  it('allows only one process to hold the runtime lock during real contention', async () => {
    const holder = spawnLockWorker(rootDir, 'acquire-hold', 60000);
    const holderMessage = await waitForFirstWorkerMessage(holder);
    expect(holderMessage).toMatchObject({ status: 'acquired' } satisfies Partial<WorkerResult>);

    let ownerPidVerifiable = true;
    try {
      process.kill(holderMessage.pid, 0);
    } catch {
      ownerPidVerifiable = false;
    }

    const attempts = 6;
    const contenders = await Promise.all(
      Array.from({ length: attempts }, () => runLockWorker(rootDir, 'acquire-release')),
    );

    if (ownerPidVerifiable) {
      expect(contenders.filter((result) => result.status === 'acquired-and-released')).toHaveLength(
        0,
      );
      expect(
        contenders.filter((result) => result.code === ErrorCodes.RuntimeLockActive),
      ).toHaveLength(attempts);
    } else {
      expect(contenders.length).toBe(attempts);
    }

    holder.kill('SIGTERM');
    await once(holder, 'exit');
    expect(fs.existsSync(path.join(spineDir, '.lock'))).toBe(false);
  });

  it('releases the runtime lock when a holding process receives SIGTERM', async () => {
    const holder = spawnLockWorker(rootDir, 'acquire-hold', 10000);
    const holderMessage = await waitForFirstWorkerMessage(holder);
    expect(holderMessage).toMatchObject({ status: 'acquired' } satisfies Partial<WorkerResult>);
    expect(fs.existsSync(path.join(spineDir, '.lock'))).toBe(true);

    holder.kill('SIGTERM');
    await once(holder, 'exit');

    expect(fs.existsSync(path.join(spineDir, '.lock'))).toBe(false);
    await expect(runLockWorker(rootDir, 'acquire-release')).resolves.toMatchObject({
      status: 'acquired-and-released',
    } satisfies Partial<WorkerResult>);
  });

  it('does not release a lock rewritten with the same pid but a different token', async () => {
    const holder = spawnLockWorker(rootDir, 'acquire-release-rewrite');
    const holderMessage = await waitForFirstWorkerMessage(holder);
    expect(holderMessage).toMatchObject({ status: 'acquired' } satisfies Partial<WorkerResult>);

    const lockPath = path.join(spineDir, '.lock');
    const original = parseLockPayload(fs.readFileSync(lockPath, 'utf8'));
    fs.writeFileSync(
      lockPath,
      serializeLockPayload({
        pid: original.pid,
        timestamp: Date.now(),
        token: 'forged-token',
      }),
    );

    holder.kill('SIGTERM');
    await once(holder, 'exit');

    const remaining = parseLockPayload(fs.readFileSync(lockPath, 'utf8'));
    expect(remaining.token).toBe('forged-token');
  });

  it('preserves atomic write integrity for runtime file writes', () => {
    const testFile = path.join(rootDir, 'robustness_test.txt');
    const initialContent = 'Original Content';
    fs.writeFileSync(testFile, initialContent);

    expect(() => {
      FileSystemManager.safeWriteFile(testFile, 'New Corrupted Content');
    }).not.toThrow();

    const finalContent = fs.readFileSync(testFile, 'utf8');
    expect(finalContent).toBe('New Corrupted Content');
  });
});
