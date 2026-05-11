import type Database from 'better-sqlite3';
import type { FileCommitRecord } from './types.js';
import { recordDriftEvent } from './repositories/drift.js';

export function commitBatch(db: Database.Database, commits: FileCommitRecord[]): void {
  const fileStmt = db.prepare(`
    INSERT INTO files (path, hash, kind, lastIndexedAt, docs, is_authoritative, mtime, size)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      hash=excluded.hash,
      kind=excluded.kind,
      lastIndexedAt=excluded.lastIndexedAt,
      docs=excluded.docs,
      is_authoritative=1,
      mtime=excluded.mtime,
      size=excluded.size
  `);
  const driftStmt = db.prepare(`
    INSERT INTO drift_events (
      file_path,
      detected_at,
      previous_role,
      previous_responsibilities,
      drift_reason
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  const runBatch = db.transaction((items: FileCommitRecord[]) => {
    const now = new Date().toISOString();
    for (const item of items) {
      if (item.driftInfo) {
        recordDriftEvent(
          driftStmt,
          item.filePath,
          item.driftInfo.previousRole,
          item.driftInfo.previousResponsibilities,
          item.driftInfo.driftReason,
          now,
        );
      }

      fileStmt.run(
        item.filePath,
        item.hash,
        item.kind,
        now,
        JSON.stringify(item.spineUnit ?? { locales: item.locales }),
        item.mtime ?? 0,
        item.size ?? 0,
      );
    }
  });

  runBatch(commits);
}
