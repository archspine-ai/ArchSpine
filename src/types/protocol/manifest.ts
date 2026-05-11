import type { FileKind } from './index-documents.js';
import type { SchemaVersion } from './versions.js';

export interface SyncBlock {
  lastSyncAt: string | null;
  lastSyncMode: 'full' | 'incremental' | 'unknown';
  reverseIndexComplete: boolean;
  indexedUnitCount: number;
}

export interface DocRef {
  locale: string;
  path: string;
}

export interface FileStatus {
  contentHash: string;
  fileKind: FileKind;
  lastIndexedAt: string;
  docs: DocRef[];
  sourceExists: boolean;
}

export interface SpineManifest {
  schemaVersion: SchemaVersion;
  generatorVersion: string;
  createdAt: string;
  updatedAt: string;
  sync: SyncBlock;
  files: Record<string, FileStatus>;
  symbols: Record<string, string[]>;
}
