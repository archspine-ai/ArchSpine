import Database from 'better-sqlite3';
import { commitBatch } from './db/batch.js';
import { mapRuntimeDbError } from './db/errors.js';
import {
  deleteFile,
  ensureFileRecord,
  getFileDocs,
  getFileStatus,
  getGlobalStatus,
  getTrackedFiles,
  updateFileStatus,
  updateFileStatusWithDocs,
} from './db/repositories/files.js';
import { getDriftHistory } from './db/repositories/drift.js';
import {
  addFileExports,
  clearFileExports,
  invalidateCache,
  resolveSymbol,
  searchSymbols,
} from './db/repositories/symbols.js';
import { getTotalUsage, getUsageSummary, recordUsage } from './db/repositories/usage.js';
import {
  clearViolations,
  deleteOrphanViolations,
  getActiveViolations,
  recordViolation,
} from './db/repositories/violations.js';
import { openRuntimeDatabase } from './db/runtime.js';
import { initializeRuntimeSchema } from './db/schema.js';
import type {
  DriftEvent,
  FileCommitRecord,
  FileRecord,
  FileStatusRecord,
  GlobalStatus,
  UsageSummaryRow,
  UsageTotals,
  ViolationRecord,
} from './db/types.js';
import type { SpineUnit } from '../types/protocol.js';

export type {
  DriftEvent,
  FileCommitRecord,
  FileRecord,
  FileStatusRecord,
  GlobalStatus,
  UsageSummaryRow,
  UsageTotals,
  ViolationRecord,
};

/**
 * Public facade for the runtime DB subsystem.
 * Keep callers importing from this file; treat `src/infra/db/*` as internal
 * implementation detail so schema/repository changes stay localized.
 *
 * Data Hierarchy:
 * - [AUTHORITATIVE] files, violations, usage_logs: Persistent data, must not be cleared.
 * - [CACHE]         symbols: Derived from AST, can be rebuilt via sync.
 */
export class SpineDB {
  private db: Database.Database;

  constructor(rootDir: string, opts?: { readonly?: boolean }) {
    const runtime = openRuntimeDatabase(rootDir, opts);
    this.db = runtime.db;

    try {
      initializeRuntimeSchema(this.db);
    } catch (error) {
      if (opts?.readonly) {
        // Schema already exists — read-only connections can't run DDL.
      } else {
        throw mapRuntimeDbError(error, 'init', runtime.dbPath);
      }
    }
  }

  public invalidateCache(): void {
    invalidateCache(this.db);
  }

  public getFileStatus(filePath: string): FileStatusRecord | undefined {
    return getFileStatus(this.db, filePath);
  }

  public ensureFileRecord(
    filePath: string,
    kind: string,
    mtime: number = 0,
    size: number = 0,
  ): void {
    ensureFileRecord(this.db, filePath, kind, mtime, size);
  }

  public updateFileStatus(
    filePath: string,
    hash: string,
    kind: string,
    locales: string[] = [],
    mtime: number = 0,
    size: number = 0,
  ): void {
    updateFileStatus(this.db, filePath, hash, kind, locales, mtime, size);
  }

  public updateFileStatusWithDocs(
    filePath: string,
    hash: string,
    kind: string,
    spineUnit: SpineUnit,
    locales: string[] = [],
    mtime: number = 0,
    size: number = 0,
  ): void {
    updateFileStatusWithDocs(this.db, filePath, hash, kind, spineUnit, locales, mtime, size);
  }

  public commitBatch(commits: FileCommitRecord[]): void {
    commitBatch(this.db, commits);
  }

  public getFileDocs(filePath: string): SpineUnit | undefined {
    return getFileDocs(this.db, filePath);
  }

  public deleteFile(filePath: string): void {
    deleteFile(this.db, filePath);
  }

  public getTrackedFiles(): string[] {
    return getTrackedFiles(this.db);
  }

  public getDriftHistory(filePath: string, limit: number): DriftEvent[] {
    return getDriftHistory(this.db, filePath, limit);
  }

  public addFileExports(filePath: string, exports: string[]): void {
    addFileExports(this.db, filePath, exports);
  }

  public clearFileExports(filePath: string): void {
    clearFileExports(this.db, filePath);
  }

  public resolveSymbol(symbol: string): string[] {
    return resolveSymbol(this.db, symbol);
  }

  public searchSymbols(
    query: string,
    limit: number = 50,
  ): Array<{ name: string; filePath: string }> {
    return searchSymbols(this.db, query, limit);
  }

  public recordUsage(mode: string, input: number, output: number, total: number): void {
    recordUsage(this.db, mode, input, output, total);
  }

  public getUsageSummary(): UsageSummaryRow[] {
    return getUsageSummary(this.db);
  }

  public getTotalUsage(): UsageTotals {
    return getTotalUsage(this.db);
  }

  public recordViolation(filePath: string, ruleId: string, severity: string, reason: string): void {
    recordViolation(this.db, filePath, ruleId, severity, reason);
  }

  public clearViolations(filePath: string): void {
    clearViolations(this.db, filePath);
  }

  public deleteOrphanViolations(activeRuleIds: string[]): number {
    return deleteOrphanViolations(this.db, activeRuleIds);
  }

  public getActiveViolations(): ViolationRecord[] {
    return getActiveViolations(this.db);
  }

  public getGlobalStatus(): GlobalStatus {
    return getGlobalStatus(this.db);
  }

  public close(): void {
    this.db.close();
  }
}
