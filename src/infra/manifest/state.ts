import * as path from 'path';
import { FileSystemManager } from '../../utils/fs.js';
import {
  CURRENT_SCHEMA_VERSION,
  GENERATOR_VERSION,
  LanguageSnapshot,
} from '../../types/protocol.js';
import { ErrorCodes } from '../../core/errors.js';
import {
  getLanguageSnapshotPath,
  getManifestPath,
  readJsonFile,
  readJsonFileWithWarning,
} from './io.js';

export interface ManifestRuntimeState {
  reverseIndexComplete: boolean;
}

export interface ManifestStatusSource {
  getGlobalStatus(): { totalFiles: number };
  getActiveViolations(): Array<unknown>;
}

export function loadManifestState(rootDir: string): ManifestRuntimeState {
  const manifestPath = getManifestPath(rootDir);
  const data = readJsonFileWithWarning<Record<string, unknown>>(
    manifestPath,
    (reason) =>
      `[${ErrorCodes.ManifestParseFailed}] Failed to parse ${manifestPath}. ` +
      `Proceeding with conservative defaults for this run. Please repair or regenerate the file with 'spine build'. ` +
      `Reason: ${reason}`,
  );

  const reverseIndexComplete =
    typeof (data as { sync?: { reverseIndexComplete?: unknown } } | null)?.sync
      ?.reverseIndexComplete === 'boolean'
      ? Boolean((data as { sync: { reverseIndexComplete: boolean } }).sync.reverseIndexComplete)
      : false;

  return { reverseIndexComplete };
}

export function needsInitialSync(rootDir: string, statusSource: ManifestStatusSource): boolean {
  const manifestPath = getManifestPath(rootDir);
  try {
    const status = statusSource.getGlobalStatus();
    if (status.totalFiles === 0) {
      return true;
    }

    const data = readJsonFile<Record<string, unknown>>(manifestPath) as {
      sync?: { lastSyncAt?: string };
    } | null;
    return !data?.sync?.lastSyncAt;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console -- Warn on manifest parse failure
    console.warn(
      `[${ErrorCodes.ManifestParseFailed}] Failed while reading ${manifestPath} during index check. ` +
        `Treating state as not initialized. Please repair or regenerate the file with 'spine build'. ` +
        `Reason: ${reason}`,
    );
    return true;
  }
}

export function persistReverseIndexState(rootDir: string, complete: boolean): void {
  const manifestPath = getManifestPath(rootDir);
  const data = readJsonFile<Record<string, unknown>>(manifestPath) ?? {};
  const sync =
    typeof data.sync === 'object' && data.sync ? (data.sync as Record<string, unknown>) : {};
  sync.reverseIndexComplete = complete;
  data.sync = sync;
  FileSystemManager.safeWriteFile(manifestPath, JSON.stringify(data, null, 2));
}

export function saveManifestState(
  rootDir: string,
  runtimeState: ManifestRuntimeState,
  statusSource: ManifestStatusSource,
  mode: 'incremental' | 'full',
  durationMs: number,
  llm?: {
    provider?: { value?: string; source: string };
    model?: { value?: string; source: string };
  },
): void {
  const manifestPath = getManifestPath(rootDir);
  const status = statusSource.getGlobalStatus();
  const violations = statusSource.getActiveViolations();

  const data = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    generatorVersion: GENERATOR_VERSION,
    project: path.basename(rootDir),
    sync: {
      lastSyncAt: new Date().toISOString(),
      lastSyncMode: mode,
      reverseIndexComplete: runtimeState.reverseIndexComplete,
      indexedUnitCount: status.totalFiles,
      llm: {
        provider: llm?.provider?.value || null,
        providerSource: llm?.provider?.source || 'unset',
        model: llm?.model?.value || null,
        modelSource: llm?.model?.source || 'unset',
      },
    },
    health: {
      activeViolations: violations.length,
      lastSyncDurationMs: durationMs,
    },
    _note: 'Core state is held by .spine/cache.db, this file is a quick health-check view',
  };

  FileSystemManager.safeWriteFile(manifestPath, JSON.stringify(data, null, 2));
}

export function loadLanguageSnapshot(rootDir: string): LanguageSnapshot | null {
  const filePath = getLanguageSnapshotPath(rootDir);
  const data = readJsonFileWithWarning<Record<string, unknown>>(
    filePath,
    (reason) =>
      `[${ErrorCodes.ManifestParseFailed}] Failed to parse ${filePath}. ` +
      `Language snapshot is ignored for this run. Rebuild it with 'spine sync' or 'spine init'. ` +
      `Reason: ${reason}`,
  );
  if (!data?.schemaVersion) {
    return null;
  }
  return data as unknown as LanguageSnapshot;
}

export function saveLanguageSnapshot(rootDir: string, snapshot: LanguageSnapshot): void {
  const filePath = getLanguageSnapshotPath(rootDir);
  FileSystemManager.safeWriteFile(filePath, JSON.stringify(snapshot, null, 2));
}
