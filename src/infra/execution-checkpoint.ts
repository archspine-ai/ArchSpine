import * as fs from 'fs';
import * as path from 'path';
import { FileSystemManager } from '../utils/fs.js';

export type ExecutionCheckpointRunStatus = 'running' | 'completed' | 'failed';
export type ExecutionCheckpointStageStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ExecutionCheckpointItemStatus = 'running' | 'completed' | 'failed' | 'skipped';

export interface ExecutionCheckpointItemState {
  status: ExecutionCheckpointItemStatus;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  metadata?: unknown;
  error?: string;
}

export interface ExecutionCheckpointStageState {
  status: ExecutionCheckpointStageStatus;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  data?: unknown;
  items?: Record<string, ExecutionCheckpointItemState>;
  error?: string;
}

export interface ExecutionCheckpointState {
  schemaVersion: '1.0';
  command: string;
  runId: string;
  status: ExecutionCheckpointRunStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  error?: string;
  stages: Record<string, ExecutionCheckpointStageState>;
}

const RUN_STATUSES = new Set<ExecutionCheckpointRunStatus>(['running', 'completed', 'failed']);
const STAGE_STATUSES = new Set<ExecutionCheckpointStageStatus>([
  'pending',
  'running',
  'completed',
  'failed',
]);
const ITEM_STATUSES = new Set<ExecutionCheckpointItemStatus>([
  'running',
  'completed',
  'failed',
  'skipped',
]);

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function normalizeItemId(itemId: string): string {
  return itemId.replace(/\\/g, '/');
}

function canTransitionItemStatus(
  from: ExecutionCheckpointItemStatus | undefined,
  to: ExecutionCheckpointItemStatus,
): boolean {
  if (!from) {
    return true;
  }
  if (from === 'running') {
    return true;
  }
  // Allow retry/resume to restart items with any terminal status.
  if (to === 'running' && (from === 'skipped' || from === 'failed' || from === 'completed')) {
    return true;
  }
  return from === to;
}

function normalizeCandidateFiles(files: unknown): string[] {
  if (!Array.isArray(files)) {
    return [];
  }
  const unique = new Set<string>();
  for (const file of files) {
    if (typeof file !== 'string') {
      continue;
    }
    const normalized = normalizeItemId(file).trim();
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }
  return Array.from(unique);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateCheckpointItem(item: unknown, pathLabel: string, issues: string[]): void {
  if (!isRecord(item)) {
    issues.push(`${pathLabel} must be an object`);
    return;
  }
  if (
    typeof item.status !== 'string' ||
    !ITEM_STATUSES.has(item.status as ExecutionCheckpointItemStatus)
  ) {
    issues.push(`${pathLabel}.status must be one of: ${Array.from(ITEM_STATUSES).join(', ')}`);
  }
  if (item.startedAt !== undefined && typeof item.startedAt !== 'string') {
    issues.push(`${pathLabel}.startedAt must be a string`);
  }
  if (item.completedAt !== undefined && typeof item.completedAt !== 'string') {
    issues.push(`${pathLabel}.completedAt must be a string`);
  }
  if (typeof item.updatedAt !== 'string') {
    issues.push(`${pathLabel}.updatedAt must be a string`);
  }
  if (item.error !== undefined && typeof item.error !== 'string') {
    issues.push(`${pathLabel}.error must be a string`);
  }
}

function validateCheckpointStage(stage: unknown, pathLabel: string, issues: string[]): void {
  if (!isRecord(stage)) {
    issues.push(`${pathLabel} must be an object`);
    return;
  }
  if (
    typeof stage.status !== 'string' ||
    !STAGE_STATUSES.has(stage.status as ExecutionCheckpointStageStatus)
  ) {
    issues.push(`${pathLabel}.status must be one of: ${Array.from(STAGE_STATUSES).join(', ')}`);
  }
  if (stage.startedAt !== undefined && typeof stage.startedAt !== 'string') {
    issues.push(`${pathLabel}.startedAt must be a string`);
  }
  if (stage.completedAt !== undefined && typeof stage.completedAt !== 'string') {
    issues.push(`${pathLabel}.completedAt must be a string`);
  }
  if (typeof stage.updatedAt !== 'string') {
    issues.push(`${pathLabel}.updatedAt must be a string`);
  }
  if (stage.error !== undefined && typeof stage.error !== 'string') {
    issues.push(`${pathLabel}.error must be a string`);
  }
  if (stage.items !== undefined) {
    if (!isRecord(stage.items)) {
      issues.push(`${pathLabel}.items must be an object`);
    } else {
      for (const [itemId, item] of Object.entries(stage.items)) {
        validateCheckpointItem(item, `${pathLabel}.items.${itemId}`, issues);
      }
    }
  }
}

function validateCheckpointState(
  value: unknown,
  expectedCommand: string,
): { state: ExecutionCheckpointState | null; issues: string[] } {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return { state: null, issues: ['checkpoint root must be a JSON object'] };
  }

  if (value.schemaVersion !== '1.0') {
    issues.push('schemaVersion must equal "1.0"');
  }
  if (value.command !== expectedCommand) {
    issues.push(`command must equal "${expectedCommand}"`);
  }
  if (typeof value.runId !== 'string' || value.runId.length === 0) {
    issues.push('runId must be a non-empty string');
  }
  if (
    typeof value.status !== 'string' ||
    !RUN_STATUSES.has(value.status as ExecutionCheckpointRunStatus)
  ) {
    issues.push(`status must be one of: ${Array.from(RUN_STATUSES).join(', ')}`);
  }
  if (typeof value.startedAt !== 'string') {
    issues.push('startedAt must be a string');
  }
  if (typeof value.updatedAt !== 'string') {
    issues.push('updatedAt must be a string');
  }
  if (value.completedAt !== undefined && typeof value.completedAt !== 'string') {
    issues.push('completedAt must be a string');
  }
  if (value.metadata !== undefined && !isRecord(value.metadata)) {
    issues.push('metadata must be an object');
  }
  if (value.summary !== undefined && !isRecord(value.summary)) {
    issues.push('summary must be an object');
  }
  if (value.error !== undefined && typeof value.error !== 'string') {
    issues.push('error must be a string');
  }
  if (!isRecord(value.stages)) {
    issues.push('stages must be an object');
  } else {
    for (const [stageId, stage] of Object.entries(value.stages)) {
      validateCheckpointStage(stage, `stages.${stageId}`, issues);
    }
  }

  return {
    state: issues.length === 0 ? (value as unknown as ExecutionCheckpointState) : null,
    issues,
  };
}

export function isResumableCheckpoint(
  state: ExecutionCheckpointState | null | undefined,
): state is ExecutionCheckpointState {
  return Boolean(state && state.status !== 'completed');
}

export function getStageData<T>(
  state: ExecutionCheckpointState | null | undefined,
  stageId: string,
): T | undefined {
  return state?.stages[stageId]?.data as T | undefined;
}

export function getStageItemsByStatus(
  state: ExecutionCheckpointState | null | undefined,
  stageId: string,
  statuses: ExecutionCheckpointItemStatus[],
): string[] {
  const items = state?.stages[stageId]?.items;
  if (!items) {
    return [];
  }
  const allowed = new Set(statuses);
  return Object.entries(items)
    .filter(([, item]) => allowed.has(item.status))
    .map(([itemId]) => itemId)
    .sort();
}

export function deriveSyncResumeCandidateFiles(
  state: ExecutionCheckpointState | null | undefined,
): string[] {
  if (!isResumableCheckpoint(state)) {
    return [];
  }

  const scan = getStageData<{ filteredFiles?: string[] }>(state, 'scan-cleanup');
  const filteredFiles = normalizeCandidateFiles(scan?.filteredFiles);
  if (filteredFiles.length === 0) {
    return [];
  }

  const committed = new Set(
    getStageItemsByStatus(state, 'state-commit', ['completed']).map(normalizeItemId),
  );
  return filteredFiles.filter((file) => !committed.has(file));
}

export function deriveSyncFailedCandidateFiles(
  state: ExecutionCheckpointState | null | undefined,
): string[] {
  if (!state) {
    return [];
  }

  const failed = new Set<string>();
  for (const stageId of ['summarization', 'state-commit']) {
    for (const itemId of getStageItemsByStatus(state, stageId, ['failed'])) {
      failed.add(normalizeItemId(itemId));
    }
  }

  return Array.from(failed).sort();
}

export function deriveCheckResumeCandidateFiles(
  state: ExecutionCheckpointState | null | undefined,
): string[] {
  if (!isResumableCheckpoint(state)) {
    return [];
  }

  const scan = getStageData<{ filteredFiles?: string[] }>(state, 'scan-cleanup');
  const filteredFiles = normalizeCandidateFiles(scan?.filteredFiles);
  if (filteredFiles.length === 0) {
    return [];
  }

  const completed = new Set(
    getStageItemsByStatus(state, 'validation', ['completed', 'skipped']).map(normalizeItemId),
  );
  return filteredFiles.filter((file) => !completed.has(file));
}

export class ExecutionCheckpointStore {
  private state: ExecutionCheckpointState | null = null;
  private lastLoadWarning: string | null = null;

  constructor(
    private readonly rootDir: string,
    private readonly command: string,
  ) {}

  public getFilePath(): string {
    return path.join(this.rootDir, '.spine', 'runtime', 'checkpoints', `${this.command}.json`);
  }

  public getLastLoadWarning(): string | null {
    return this.lastLoadWarning;
  }

  public load(): ExecutionCheckpointState | null {
    const filePath = this.getFilePath();
    this.lastLoadWarning = null;
    if (!fs.existsSync(filePath)) {
      this.state = null;
      return null;
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const validation = validateCheckpointState(parsed, this.command);
      if (validation.state) {
        this.state = validation.state;
        return validation.state;
      }
      const quarantinedPath = this.quarantineCorruptFile(filePath);
      this.state = null;
      this.lastLoadWarning =
        `[Resume] Ignoring invalid ${this.command} checkpoint at ${filePath}. ` +
        `Moved to ${quarantinedPath}. Issues: ${validation.issues.join('; ')}`;
      return null;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      const quarantinedPath = this.quarantineCorruptFile(filePath);
      this.state = null;
      this.lastLoadWarning =
        `[Resume] Ignoring unreadable ${this.command} checkpoint at ${filePath}. ` +
        `Moved to ${quarantinedPath}. Reason: ${reason}`;
      return null;
    }
  }

  public startRun(metadata: Record<string, unknown> = {}): ExecutionCheckpointState {
    const startedAt = nowIso();
    this.state = {
      schemaVersion: '1.0',
      command: this.command,
      runId: `${Date.now()}-${process.pid}`,
      status: 'running',
      startedAt,
      updatedAt: startedAt,
      metadata,
      stages: {},
    };
    this.save();
    return this.state;
  }

  public markStageStarted(stageId: string): void {
    const state = this.ensureState();
    const timestamp = nowIso();
    const previous = state.stages[stageId];
    state.updatedAt = timestamp;
    state.stages[stageId] = {
      status: 'running',
      startedAt: previous?.startedAt || timestamp,
      completedAt: undefined,
      updatedAt: timestamp,
      data: previous?.data,
      items: previous?.items || {},
      error: undefined,
    };
    this.save();
  }

  public markStageCompleted(stageId: string, data?: unknown): void {
    const state = this.ensureState();
    const timestamp = nowIso();
    const previous = state.stages[stageId];
    state.updatedAt = timestamp;
    state.stages[stageId] = {
      status: 'completed',
      startedAt: previous?.startedAt || timestamp,
      completedAt: timestamp,
      updatedAt: timestamp,
      data: data === undefined ? previous?.data : data,
      items: previous?.items || {},
      error: undefined,
    };
    this.save();
  }

  public markStageFailed(stageId: string, error: unknown): void {
    const state = this.ensureState();
    const timestamp = nowIso();
    const previous = state.stages[stageId];
    state.updatedAt = timestamp;
    state.stages[stageId] = {
      status: 'failed',
      startedAt: previous?.startedAt || timestamp,
      completedAt: previous?.completedAt,
      updatedAt: timestamp,
      data: previous?.data,
      items: previous?.items || {},
      error: normalizeError(error),
    };
    this.save();
  }

  public updateStageData(stageId: string, data: unknown): void {
    const state = this.ensureState();
    const timestamp = nowIso();
    const previous = state.stages[stageId];
    state.updatedAt = timestamp;
    state.stages[stageId] = {
      status: previous?.status || 'pending',
      startedAt: previous?.startedAt,
      completedAt: previous?.completedAt,
      updatedAt: timestamp,
      data,
      items: previous?.items || {},
      error: previous?.error,
    };
    this.save();
  }

  public markItemStarted(stageId: string, itemId: string, metadata?: unknown): void {
    this.updateItem(stageId, itemId, 'running', metadata);
  }

  public markItemCompleted(stageId: string, itemId: string, metadata?: unknown): void {
    this.updateItem(stageId, itemId, 'completed', metadata);
  }

  public markItemSkipped(stageId: string, itemId: string, metadata?: unknown): void {
    this.updateItem(stageId, itemId, 'skipped', metadata);
  }

  public markItemFailed(stageId: string, itemId: string, error: unknown, metadata?: unknown): void {
    this.updateItem(stageId, itemId, 'failed', metadata, normalizeError(error));
  }

  public completeRun(summary: Record<string, unknown> = {}): void {
    const state = this.ensureState();
    const timestamp = nowIso();
    state.status = 'completed';
    state.updatedAt = timestamp;
    state.completedAt = timestamp;
    state.summary = summary;
    state.error = undefined;
    this.save();
  }

  public failRun(error: unknown): void {
    const state = this.ensureState();
    const timestamp = nowIso();
    state.status = 'failed';
    state.updatedAt = timestamp;
    state.error = normalizeError(error);
    this.save();
  }

  private updateItem(
    stageId: string,
    itemId: string,
    status: ExecutionCheckpointItemStatus,
    metadata?: unknown,
    error?: string,
  ): void {
    const state = this.ensureState();
    const timestamp = nowIso();
    const normalizedItemId = normalizeItemId(itemId);
    const previousStage = state.stages[stageId];
    const previousItem = previousStage?.items?.[normalizedItemId];
    if (!canTransitionItemStatus(previousItem?.status, status)) {
      throw new Error(
        `Invalid checkpoint item transition for "${stageId}:${normalizedItemId}" ` +
          `from "${previousItem?.status}" to "${status}"`,
      );
    }
    const items = {
      ...(previousStage?.items || {}),
      [normalizedItemId]: {
        status,
        startedAt: previousItem?.startedAt || timestamp,
        completedAt: status === 'running' ? undefined : timestamp,
        updatedAt: timestamp,
        metadata,
        error,
      },
    };

    state.updatedAt = timestamp;
    state.stages[stageId] = {
      status: previousStage?.status || 'pending',
      startedAt: previousStage?.startedAt,
      completedAt: previousStage?.completedAt,
      updatedAt: timestamp,
      data: previousStage?.data,
      items,
      error: previousStage?.error,
    };
    this.save();
  }

  private ensureState(): ExecutionCheckpointState {
    if (!this.state) {
      return this.startRun();
    }
    return this.state;
  }

  private save(): void {
    if (!this.state) {
      return;
    }
    FileSystemManager.safeWriteFile(this.getFilePath(), JSON.stringify(this.state, null, 2));
  }

  private quarantineCorruptFile(filePath: string): string {
    const quarantinedPath = `${filePath}.corrupt.${Date.now()}`;
    try {
      fs.renameSync(filePath, quarantinedPath);
      return quarantinedPath;
    } catch {
      return filePath;
    }
  }
}
