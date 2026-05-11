import type { SpineUnit } from '../../types/protocol.js';

export interface FileRecord {
  path: string;
  hash: string;
  kind: string;
  lastIndexedAt: string;
  docs: string;
  is_authoritative: number;
}

export interface FileStatusRecord {
  hash: string;
  kind: string;
  mtime: number;
  size: number;
}

export interface FileCommitRecord {
  filePath: string;
  hash: string;
  kind: string;
  spineUnit?: SpineUnit;
  locales: string[];
  mtime?: number;
  size?: number;
  driftInfo?: {
    previousRole: string;
    previousResponsibilities: string[];
    driftReason: string;
  };
}

export interface DriftEvent {
  id: number;
  filePath: string;
  detectedAt: string;
  previousRole: string;
  previousResponsibilities: string[];
  driftReason: string;
}

export interface UsageSummaryRow {
  date: string;
  sync_mode: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface UsageTotals {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  session_count: number;
}

export interface ViolationRecord {
  file_path: string;
  rule_id: string;
  severity: string;
  reason: string;
  detected_at: string;
}

export interface GlobalStatus {
  totalFiles: number;
}
