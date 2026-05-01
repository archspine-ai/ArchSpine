import type Database from 'better-sqlite3';
import type { ViolationRecord } from '../types.js';

export function recordViolation(
  db: Database.Database,
  filePath: string,
  ruleId: string,
  severity: string,
  reason: string,
): void {
  db.prepare(
    `
    INSERT INTO violations (file_path, rule_id, severity, reason, detected_at)
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(filePath, ruleId, severity, reason, new Date().toISOString());
}

export function clearViolations(db: Database.Database, filePath: string): void {
  db.prepare('DELETE FROM violations WHERE file_path = ?').run(filePath);
}

export function getActiveViolations(db: Database.Database): ViolationRecord[] {
  return db
    .prepare(
      `
    SELECT file_path, rule_id, severity, reason, detected_at
    FROM violations
    ORDER BY severity DESC, detected_at DESC
  `,
    )
    .all() as ViolationRecord[];
}
