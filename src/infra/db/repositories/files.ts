import type Database from 'better-sqlite3';
import type { SpineUnit } from '../../../types/protocol.js';
import type { FileStatusRecord, GlobalStatus } from '../types.js';

export function getFileStatus(
  db: Database.Database,
  filePath: string,
): FileStatusRecord | undefined {
  return db.prepare('SELECT hash, kind, mtime, size FROM files WHERE path = ?').get(filePath) as
    | FileStatusRecord
    | undefined;
}

export function ensureFileRecord(
  db: Database.Database,
  filePath: string,
  kind: string,
  mtime: number = 0,
  size: number = 0,
): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO files (path, hash, kind, lastIndexedAt, docs, is_authoritative, mtime, size)
    VALUES (?, 'pending', ?, ?, ?, 0, ?, ?)
  `);
  const now = new Date().toISOString();
  stmt.run(filePath, kind, now, JSON.stringify({ locales: [] }), mtime, size);
}

function writeFileStatus(
  db: Database.Database,
  filePath: string,
  hash: string,
  kind: string,
  docs: unknown,
  mtime: number,
  size: number,
): void {
  const stmt = db.prepare(`
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
  stmt.run(filePath, hash, kind, new Date().toISOString(), JSON.stringify(docs), mtime, size);
}

export function updateFileStatus(
  db: Database.Database,
  filePath: string,
  hash: string,
  kind: string,
  locales: string[] = [],
  mtime: number = 0,
  size: number = 0,
): void {
  writeFileStatus(db, filePath, hash, kind, { locales }, mtime, size);
}

export function updateFileStatusWithDocs(
  db: Database.Database,
  filePath: string,
  hash: string,
  kind: string,
  spineUnit: SpineUnit,
  locales: string[] = [],
  mtime: number = 0,
  size: number = 0,
): void {
  writeFileStatus(db, filePath, hash, kind, spineUnit ?? { locales }, mtime, size);
}

export function getFileDocs(db: Database.Database, filePath: string): SpineUnit | undefined {
  const row = db.prepare('SELECT docs FROM files WHERE path = ?').get(filePath) as
    | { docs?: string | null }
    | undefined;
  if (!row?.docs) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(row.docs);
    if (parsed?.schemaVersion && parsed?.identity?.filePath && parsed?.semantic) {
      return parsed as SpineUnit;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function deleteFile(db: Database.Database, filePath: string): void {
  db.prepare('DELETE FROM files WHERE path = ?').run(filePath);
  db.prepare('DELETE FROM violations WHERE file_path = ?').run(filePath);
}

export function getTrackedFiles(db: Database.Database): string[] {
  const rows = db.prepare('SELECT path FROM files').all() as Array<{ path: string }>;
  return rows.map((row) => row.path);
}

export function getGlobalStatus(db: Database.Database): GlobalStatus {
  const row = db.prepare('SELECT COUNT(*) as count FROM files').get() as
    | { count: number }
    | undefined;
  return { totalFiles: row?.count || 0 };
}
