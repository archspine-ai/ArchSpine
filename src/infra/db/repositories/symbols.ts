import type Database from 'better-sqlite3';

export function invalidateCache(db: Database.Database): void {
  db.exec('DELETE FROM symbols;');
}

export function addFileExports(db: Database.Database, filePath: string, exports: string[]): void {
  const stmt = db.prepare('INSERT OR IGNORE INTO symbols (name, file_path) VALUES (?, ?)');
  const insertMany = db.transaction((symbols: string[]) => {
    for (const symbol of symbols) {
      stmt.run(symbol, filePath);
    }
  });
  insertMany(exports);
}

export function clearFileExports(db: Database.Database, filePath: string): void {
  db.prepare('DELETE FROM symbols WHERE file_path = ?').run(filePath);
}

export function resolveSymbol(db: Database.Database, symbol: string): string[] {
  const rows = db.prepare('SELECT file_path FROM symbols WHERE name = ?').all(symbol) as Array<{
    file_path: string;
  }>;
  return rows.map((row) => row.file_path);
}
