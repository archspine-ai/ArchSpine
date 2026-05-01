import type Database from 'better-sqlite3';

function isDuplicateColumnError(error: unknown, columnName: string): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes(`duplicate column name: ${columnName.toLowerCase()}`);
}

function addColumnIfMissing(db: Database.Database, sql: string, columnName: string): void {
  try {
    db.exec(sql);
  } catch (error) {
    if (!isDuplicateColumnError(error, columnName)) {
      throw error;
    }
  }
}

export function initializeRuntimeSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      path TEXT PRIMARY KEY,
      hash TEXT NOT NULL,
      kind TEXT NOT NULL,
      lastIndexedAt TEXT NOT NULL,
      docs JSON,
      is_authoritative INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS symbols (
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      PRIMARY KEY (name, file_path),
      FOREIGN KEY (file_path) REFERENCES files(path) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_id TEXT NOT NULL,
      date TEXT NOT NULL,
      sync_mode TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      total_tokens INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      rule_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      reason TEXT NOT NULL,
      detected_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS drift_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      detected_at TEXT NOT NULL,
      previous_role TEXT NOT NULL,
      previous_responsibilities TEXT NOT NULL,
      drift_reason TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_files_hash ON files(hash);
    CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
    CREATE INDEX IF NOT EXISTS idx_usage_date ON usage_logs(date);
    CREATE INDEX IF NOT EXISTS idx_violations_file ON violations(file_path);
    CREATE INDEX IF NOT EXISTS idx_drift_path ON drift_events(file_path, detected_at DESC);
  `);

  addColumnIfMissing(db, 'ALTER TABLE files ADD COLUMN mtime INTEGER DEFAULT 0;', 'mtime');
  addColumnIfMissing(db, 'ALTER TABLE files ADD COLUMN size INTEGER DEFAULT 0;', 'size');
}
