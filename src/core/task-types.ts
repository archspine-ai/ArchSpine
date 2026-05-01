import type { FileSkeleton } from '../ast/extractor.js';
import { FileKind, SpineUnit } from '../types/protocol.js';
import type {
  RelevanceDiagnosticsMode,
  SourceFileDiagnosticsSnapshot,
} from '../infra/prompt-context.js';
import type { ViewId } from '../types/view.js';

export interface TaskStats {
  processed: number;
  skipped: number;
  failed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface TaskStageMetric {
  runs: number;
  totalDurationMs: number;
  lastDurationMs: number;
  maxDurationMs: number;
  lastHeapUsedBytes: number;
  maxHeapUsedBytes: number;
  lastRssBytes: number;
  maxRssBytes: number;
}

export interface TaskDiagnosticsState {
  mode: RelevanceDiagnosticsMode;
  summarize: SourceFileDiagnosticsSnapshot[];
  validate: SourceFileDiagnosticsSnapshot[];
}

export interface TaskSelectionState {
  filteredFiles: string[];
  affectedDirs: Set<string>;
}

export interface TaskArtifactsState {
  skeletons: Map<string, FileSkeleton>;
  unsupportedFiles: Map<string, string>;
  pendingCommits: Map<string, { hash: string; kind: FileKind; spineUnit: SpineUnit }>;
}

export interface TaskTelemetryState {
  stats: TaskStats;
  stageMetrics: Record<string, TaskStageMetric>;
  driftWarnings: Array<{ filePath: string; reason: string }>;
  diagnostics: TaskDiagnosticsState;
}

export interface TaskState {
  telemetry: TaskTelemetryState;
}

export interface ScanStageInput {
  candidateFiles?: string[];
}

export interface ScanStageOutput {
  selection: TaskSelectionState;
}

export interface ExtractionStageOutput {
  selection: TaskSelectionState;
  artifacts: Pick<TaskArtifactsState, 'skeletons' | 'unsupportedFiles'>;
}

export interface SummarizationStageOutput extends ExtractionStageOutput {
  artifacts: TaskArtifactsState;
}

export interface FixViolation {
  file_path: string;
  rule_id: string;
  severity: string;
  reason: string;
}

export interface FixStageInput {
  violations: FixViolation[];
}

export interface FixStageOutput {
  fixed: number;
  skipped: number;
  failed: number;
  recheckFiles: string[];
}

export interface CommitStageOutput {
  selection: TaskSelectionState;
  committedFiles: string[];
  committedCount: number;
}

export interface ViewDerivationStageOutput {
  publicSurfaceCount: number;
  riskHotspotCount: number;
  archDiagramGenerated: boolean;
  generatedViews: ViewId[];
  skippedViews: Array<{ viewId: ViewId | string; reason: string }>;
}
