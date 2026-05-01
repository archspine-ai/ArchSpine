import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ArchSpineError, ErrorCodes } from '../core/errors.js';

/**
 * LockManager handles file-based mutual exclusion to prevent race conditions.
 * Sync test comment.
 */
export class LockManager {
  private lockPath: string;
  private held: boolean = false;
  private lockToken: string | null = null;
  private cleanupHandler: (() => void) | null = null;

  constructor(rootDir: string) {
    const spineDir = path.join(rootDir, '.spine');
    if (!fs.existsSync(spineDir)) {
      fs.mkdirSync(spineDir, { recursive: true });
    }
    this.lockPath = path.join(spineDir, '.lock');
  }

  public acquire(): void {
    if (this.held) {
      return;
    }

    try {
      const lockToken = randomUUID();
      // Atomic creation: 'wx' fails if file exists
      const fd = fs.openSync(this.lockPath, 'wx');
      const lockData = serializeLockPayload({
        pid: process.pid,
        timestamp: Date.now(),
        token: lockToken,
      });
      fs.writeSync(fd, lockData);
      fs.closeSync(fd);
      this.held = true;
      this.lockToken = lockToken;
    } catch (e: unknown) {
      const sysErr = e as { code?: string };
      if (sysErr.code === 'EEXIST') {
        this.handleExistingLock();
      } else {
        throw new ArchSpineError(
          ErrorCodes.RuntimeLockAcquireFailed,
          '[Lock] Failed to acquire the local runtime lock.',
          {
            cause: e,
            context: {
              lockPath: this.lockPath,
              systemCode: sysErr.code,
            },
          },
        );
      }
    }

    // Auto cleanup on exit
    if (this.held && !this.cleanupHandler) {
      this.cleanupHandler = () => this.release();
      process.on('SIGINT', this.cleanupHandler);
      process.on('SIGTERM', this.cleanupHandler);
      process.on('exit', this.cleanupHandler);
    }
  }

  private handleExistingLock(): void {
    let payload: RuntimeLockPayload | null = null;
    let content: string | undefined;
    try {
      content = fs.readFileSync(this.lockPath, 'utf8').trim();
      payload = parseLockPayload(content);
      const activePid = payload.pid;

      // Check if the process is actually running
      process.kill(activePid, 0);
      throw new ArchSpineError(
        ErrorCodes.RuntimeLockActive,
        `[Lock] Another ArchSpine process is holding the runtime lock (PID: ${activePid}). Wait for it to finish before retrying.`,
        {
          context: {
            lockPath: this.lockPath,
            pid: activePid,
            token: payload.token,
          },
        },
      );
    } catch (err: unknown) {
      if (err instanceof ArchSpineError) {
        throw err;
      }

      const sysErr = err as { code?: string };

      // ESRCH: Process does not exist
      // ENOENT: Lock file was deleted in the meantime
      if (sysErr.code === 'ESRCH' || sysErr.code === 'ENOENT') {
        const reason = `Stale lock (PID ${payload?.pid})`;
        // eslint-disable-next-line no-console -- Lock recovery diagnostic
        console.warn(`[Lock] ${reason} found. Attempting recovery.`);
        try {
          const checkContent = fs.readFileSync(this.lockPath, 'utf8').trim();
          const checkPayload = parseLockPayload(checkContent);
          if (sameLockOwner(payload, checkPayload)) {
            this.destroy();
          }
        } catch (e) {
          // If ENOENT, someone else already cleared it, which is fine
        }
        // Small synchronous delay to mitigate stampedes, but without Atomics since this is sync logic
        // We'll just rely on the OS 'wx' flag to resolve the final winner
        return this.acquire(); // Retry
      }

      if (sysErr.code === 'EPERM') {
        throw new ArchSpineError(
          ErrorCodes.RuntimeLockOwnerUnverifiable,
          `[Lock] The runtime lock owner cannot be verified (PID: ${payload?.pid}). Confirm no ArchSpine process is still running before clearing .spine/.lock.`,
          {
            cause: err,
            context: {
              lockPath: this.lockPath,
              pid: payload?.pid,
              token: payload?.token,
              ownerVerifiable: false,
            },
          },
        );
      }

      throw new ArchSpineError(
        ErrorCodes.RuntimeLockAcquireFailed,
        '[Lock] Failed while inspecting the existing runtime lock.',
        {
          cause: err,
          context: {
            lockPath: this.lockPath,
            pid: payload?.pid,
            systemCode: sysErr.code,
          },
        },
      );
    }
  }

  /**
   * Safe release - only removes the lock if it belongs to this process.
   */
  public release(): void {
    if (!this.held) {
      return;
    }

    try {
      if (fs.existsSync(this.lockPath)) {
        const content = fs.readFileSync(this.lockPath, 'utf8').trim();
        const data = parseLockPayload(content);
        if (data.pid === process.pid && data.token === this.lockToken) {
          fs.unlinkSync(this.lockPath);
        }
      }
    } catch (e) {
      // Ignore cleanup errors
    } finally {
      this.held = false;
      this.lockToken = null;
      if (this.cleanupHandler) {
        process.off('SIGINT', this.cleanupHandler);
        process.off('SIGTERM', this.cleanupHandler);
        process.off('exit', this.cleanupHandler);
        this.cleanupHandler = null;
      }
    }
  }

  /**
   * Forcefully remove the lock file.
   */
  private destroy(): void {
    try {
      if (fs.existsSync(this.lockPath)) {
        fs.unlinkSync(this.lockPath);
      }
    } catch (e) {
      // Ignore
    }
  }
}

export interface RuntimeLockPayload {
  pid: number;
  timestamp: number;
  token: string;
}

export function parseLockPayload(content: string): RuntimeLockPayload {
  const parsed = JSON.parse(content);
  if (parsed && typeof parsed === 'object') {
    const record = parsed as { pid?: unknown; timestamp?: unknown; token?: unknown };
    if (
      typeof record.pid === 'number' &&
      Number.isInteger(record.pid) &&
      record.pid > 0 &&
      typeof record.timestamp === 'number' &&
      Number.isFinite(record.timestamp) &&
      typeof record.token === 'string' &&
      record.token.length > 0
    ) {
      return {
        pid: record.pid,
        timestamp: record.timestamp,
        token: record.token,
      };
    }
  }
  throw new ArchSpineError(
    ErrorCodes.RuntimeLockCorrupt,
    '[Lock] The runtime lock file is corrupt. Confirm no ArchSpine process is running, then remove .spine/.lock and retry.',
    {
      context: {
        lockPreview: content.slice(0, 200),
      },
    },
  );
}

export function serializeLockPayload(payload: RuntimeLockPayload): string {
  return JSON.stringify(payload);
}

function sameLockOwner(left: RuntimeLockPayload | null, right: RuntimeLockPayload | null): boolean {
  return left !== null && right !== null && left.pid === right.pid && left.token === right.token;
}
