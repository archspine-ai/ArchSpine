import { DriftEvent, SpineDB, UsageSummaryRow, UsageTotals, ViolationRecord } from '../db.js';
import { SpineUnit } from '../../types/protocol.js';
import { normalizeRepoPath } from '../../utils/repo-path.js';
import { LanguageSnapshot } from '../../types/protocol.js';
import { getFileStatusSnapshot } from './io.js';
import { calculateHash } from './integrity.js';
import {
  needsInitialSync,
  loadLanguageSnapshot as loadPersistedLanguageSnapshot,
  loadManifestState,
  persistReverseIndexState,
  saveLanguageSnapshot as savePersistedLanguageSnapshot,
  saveManifestState,
} from './state.js';

export class Manifest {
  private db: SpineDB;
  private rootDir: string;
  private reverseIndexComplete: boolean = false;

  private constructor(rootDir: string, db: SpineDB) {
    this.rootDir = rootDir;
    this.db = db;
    this.reverseIndexComplete = loadManifestState(rootDir).reverseIndexComplete;
  }

  public static open(rootDir: string, opts?: { readonly?: boolean }): Manifest {
    return new Manifest(rootDir, new SpineDB(rootDir, opts));
  }

  public isReverseIndexComplete(): boolean {
    return this.reverseIndexComplete;
  }

  public needsInitialSync(): boolean {
    return needsInitialSync(this.rootDir, this.db);
  }

  public calculateHash(filePath: string): string {
    return calculateHash(this.db, filePath);
  }

  public needsUpdate(filePath: string, hash: string): boolean {
    const normalizedPath = normalizeRepoPath(filePath);
    const status = this.db.getFileStatus(normalizedPath);
    return !status || status.hash !== hash;
  }

  public ensureFileRecord(filePath: string, kind: string): void {
    const { mtime, size } = getFileStatusSnapshot(filePath);
    this.db.ensureFileRecord(normalizeRepoPath(filePath), kind, mtime, size);
  }

  public updateFileStatus(filePath: string, hash: string, kind: string, locales: string[]): void {
    const { mtime, size } = getFileStatusSnapshot(filePath);
    this.db.updateFileStatus(normalizeRepoPath(filePath), hash, kind, locales, mtime, size);
  }

  public updateFileStatusWithDocs(
    filePath: string,
    hash: string,
    kind: string,
    spineUnit: SpineUnit,
    locales: string[],
  ): void {
    const { mtime, size } = getFileStatusSnapshot(filePath);
    this.db.updateFileStatusWithDocs(
      normalizeRepoPath(filePath),
      hash,
      kind,
      spineUnit,
      locales,
      mtime,
      size,
    );
  }

  public commitBatch(
    commits: Array<{
      filePath: string;
      hash: string;
      kind: string;
      spineUnit: SpineUnit;
      locales: string[];
      driftInfo?: {
        previousRole: string;
        previousResponsibilities: string[];
        driftReason: string;
      };
    }>,
  ): void {
    this.db.commitBatch(
      commits.map((commit) => {
        const { mtime, size } = getFileStatusSnapshot(commit.filePath);
        return {
          ...commit,
          filePath: normalizeRepoPath(commit.filePath),
          mtime,
          size,
        };
      }),
    );
  }

  public getFileDocs(filePath: string): SpineUnit | undefined {
    return this.db.getFileDocs(normalizeRepoPath(filePath));
  }

  public getTrackedFiles(): string[] {
    return this.db.getTrackedFiles();
  }

  public getDriftHistory(filePath: string, limit: number): DriftEvent[] {
    return this.db.getDriftHistory(normalizeRepoPath(filePath), limit);
  }

  public removeFileState(filePath: string): void {
    this.db.deleteFile(normalizeRepoPath(filePath));
  }

  public registerExports(filePath: string, exports: string[]): void {
    this.db.addFileExports(normalizeRepoPath(filePath), exports);
  }

  public clearFileExports(filePath: string): void {
    this.db.clearFileExports(normalizeRepoPath(filePath));
  }

  public resolveSymbol(symbol: string): string[] {
    return this.db.resolveSymbol(symbol);
  }

  public searchSymbols(
    query: string,
    limit: number = 50,
  ): Array<{ name: string; filePath: string }> {
    return this.db.searchSymbols(query, limit);
  }

  public getActiveViolations(): ViolationRecord[] {
    return this.db.getActiveViolations();
  }

  public recordViolation(filePath: string, ruleId: string, severity: string, reason: string): void {
    this.db.recordViolation(normalizeRepoPath(filePath), ruleId, severity, reason);
  }

  public clearViolations(filePath: string): void {
    this.db.clearViolations(normalizeRepoPath(filePath));
  }

  /** Deletes violations for rules that no longer exist in current .spine/rules/. */
  public deleteOrphanViolations(activeRuleIds: string[]): number {
    return this.db.deleteOrphanViolations(activeRuleIds);
  }

  public recordUsage(
    mode: string,
    usage: { inputTokens: number; outputTokens: number; totalTokens: number },
  ): void {
    this.db.recordUsage(mode, usage.inputTokens, usage.outputTokens, usage.totalTokens);
  }

  public getTotalUsage(): UsageTotals {
    return this.db.getTotalUsage();
  }

  public getUsageSummary(): UsageSummaryRow[] {
    return this.db.getUsageSummary();
  }

  public setReverseIndexComplete(complete: boolean): void {
    this.reverseIndexComplete = complete;
    persistReverseIndexState(this.rootDir, complete);
  }

  public save(
    mode: 'incremental' | 'full',
    durationMs: number = 0,
    llm?: {
      provider?: { value?: string; source: string };
      model?: { value?: string; source: string };
    },
  ): void {
    saveManifestState(
      this.rootDir,
      { reverseIndexComplete: this.reverseIndexComplete },
      this.db,
      mode,
      durationMs,
      llm,
    );
  }

  public loadLanguageSnapshot(): LanguageSnapshot | null {
    return loadPersistedLanguageSnapshot(this.rootDir);
  }

  public saveLanguageSnapshot(snapshot: LanguageSnapshot): void {
    savePersistedLanguageSnapshot(this.rootDir, snapshot);
  }

  public close(): void {
    this.db.close();
  }
}
