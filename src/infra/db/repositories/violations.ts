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

/** Deletes all violations whose rule_id is not in the given set of active rule IDs.
 *  Call this before re-evaluating to purge stale violations from deleted rules. */
export function deleteOrphanViolations(db: Database.Database, activeRuleIds: string[]): number {
  if (activeRuleIds.length === 0) {
    return 0;
  }
  const placeholders = activeRuleIds.map(() => '?').join(',');
  const result = db
    .prepare(`DELETE FROM violations WHERE rule_id NOT IN (${placeholders})`)
    .run(...activeRuleIds);
  return result.changes;
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
