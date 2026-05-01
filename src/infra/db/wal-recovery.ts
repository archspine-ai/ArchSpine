import * as fs from 'fs';

/**
 * WAL size threshold (512KB) above which we assume a previous run was killed
 * mid-write and the journal was never checkpointed. Stale WAL files cause the
 * reconcile task to restore 0 entries, forcing a full re-summarization on the
 * next sync which in turn overwhelms rate-limited LLM providers.
 */
const STALE_WAL_THRESHOLD_BYTES = 512 * 1024;

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

  // WAL is bloated — the previous run was likely killed mid-write.
  // Remove both WAL and SHM so SQLite falls back to the last clean state.
  try {
    fs.rmSync(walPath, { force: true });
    fs.rmSync(shmPath, { force: true });
  } catch {
    // Non-fatal: if we can't delete, SQLite will attempt its own recovery.
  }
}
