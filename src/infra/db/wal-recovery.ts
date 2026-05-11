import * as fs from 'fs';
import Database from 'better-sqlite3';

/**
 * WAL size threshold (512KB) above which the WAL may contain uncheckpointed
 * data from a previous run. Rather than assuming it is stale, we first attempt
 * a safe checkpoint to drain legitimate writes into the main database.
 */
const STALE_WAL_THRESHOLD_BYTES = 512 * 1024;

/**
 * Recover a potentially bloated WAL file before opening the database.
 *
 * Strategy:
 * 1. If WAL < 512KB, leave it alone — SQLite will handle it on open.
 * 2. If WAL >= 512KB, open a temporary connection and attempt
 *    PRAGMA wal_checkpoint(TRUNCATE) to safely drain committed pages.
 * 3. Only if checkpoint fails (genuine corruption) do we delete WAL+SHM
 *    so SQLite falls back to the last clean state.
 */
export function recoverStaleWal(dbPath: string): void {
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;
  if (!fs.existsSync(walPath)) {
    return;
  }

  const walSize = fs.statSync(walPath).size;
  if (walSize < STALE_WAL_THRESHOLD_BYTES) {
    return;
  }

  // Attempt safe checkpoint first to preserve legitimate writes
  let checkpointSucceeded = false;
  try {
    const tempDb = new Database(dbPath, { readonly: false });
    try {
      tempDb.pragma('wal_checkpoint(TRUNCATE)');
      checkpointSucceeded = true;
    } finally {
      tempDb.close();
    }
  } catch {
    // Checkpoint failed — the WAL is likely corrupt. Fall through to deletion.
  }

  if (checkpointSucceeded) {
    // WAL was safely drained. Clean up any remaining SHM file.
    try {
      if (fs.existsSync(shmPath)) {
        fs.rmSync(shmPath, { force: true });
      }
    } catch {
      // Non-fatal
    }
    return;
  }

  // Checkpoint failed — WAL is genuinely stale/corrupt.
  // Remove both WAL and SHM so SQLite falls back to the last clean state.
  try {
    fs.rmSync(walPath, { force: true });
    fs.rmSync(shmPath, { force: true });
  } catch {
    // Non-fatal: if we can't delete, SQLite will attempt its own recovery.
  }
}
