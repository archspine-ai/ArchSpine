import type Database from 'better-sqlite3';
import type { UsageSummaryRow, UsageTotals } from '../types.js';

export function recordUsage(
  db: Database.Database,
  mode: string,
  input: number,
  output: number,
  total: number,
): void {
  const date = new Date().toISOString().slice(0, 10);
  const syncId = `proc-${process.pid}-${Date.now()}`;
  db.prepare(
    `
    INSERT INTO usage_logs (sync_id, date, sync_mode, input_tokens, output_tokens, total_tokens)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(syncId, date, mode, input, output, total);
}

export function getUsageSummary(db: Database.Database): UsageSummaryRow[] {
  return db
    .prepare(
      `
    SELECT date, sync_mode,
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(total_tokens) as total_tokens
    FROM usage_logs
    GROUP BY date, sync_mode
    ORDER BY date DESC
    LIMIT 30
  `,
    )
    .all() as UsageSummaryRow[];
}

export function getTotalUsage(db: Database.Database): UsageTotals {
  return db
    .prepare(
      `
    SELECT
      SUM(input_tokens) as input_tokens,
      SUM(output_tokens) as output_tokens,
      SUM(total_tokens) as total_tokens,
      COUNT(*) as session_count
    FROM usage_logs
  `,
    )
    .get() as UsageTotals;
}
