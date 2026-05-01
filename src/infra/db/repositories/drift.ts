import type Database from 'better-sqlite3';
import type { DriftEvent } from '../types.js';

export function recordDriftEvent(
  stmt: Database.Statement,
  filePath: string,
  previousRole: string,
  previousResponsibilities: string[],
  driftReason: string,
  detectedAt: string,
): void {
  stmt.run(
    filePath,
    detectedAt,
    previousRole,
    JSON.stringify(previousResponsibilities),
    driftReason,
  );
}

export function getDriftHistory(
  db: Database.Database,
  filePath: string,
  limit: number,
): DriftEvent[] {
  const rows = db
    .prepare(
      `
    SELECT
      id,
      file_path,
      detected_at,
      previous_role,
      previous_responsibilities,
      drift_reason
    FROM drift_events
    WHERE file_path = ?
    ORDER BY detected_at DESC
    LIMIT ?
  `,
    )
    .all(filePath, limit) as Array<{
    id: number;
    file_path: string;
    detected_at: string;
    previous_role: string;
    previous_responsibilities: string;
    drift_reason: string;
  }>;

  return rows.map((row) => {
    let previousResponsibilities: string[] = [];
    try {
      const parsed = JSON.parse(row.previous_responsibilities);
      if (Array.isArray(parsed)) {
        previousResponsibilities = parsed.filter(
          (value): value is string => typeof value === 'string',
        );
      }
    } catch {
      previousResponsibilities = [];
    }

    return {
      id: row.id,
      filePath: row.file_path,
      detectedAt: row.detected_at,
      previousRole: row.previous_role,
      previousResponsibilities,
      driftReason: row.drift_reason,
    };
  });
}
