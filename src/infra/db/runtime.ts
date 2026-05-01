import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { mapRuntimeDbError } from './errors.js';
import { recoverStaleWal } from './wal-recovery.js';

export interface RuntimeDatabase {
  db: Database.Database;
  dbPath: string;
}

export function openRuntimeDatabase(rootDir: string): RuntimeDatabase {
  const dbDir = path.join(rootDir, '.spine');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'cache.db');
  recoverStaleWal(dbPath);

  try {
    return { db: new Database(dbPath), dbPath };
  } catch (error) {
    throw mapRuntimeDbError(error, 'open', dbPath);
  }
}
