# ArchSpine Mirror Index Configuration Summary

## Purpose
This configuration file serves as the index metadata for the ArchSpine mirror system. It tracks the synchronization state and file inventory, ensuring that the mirror remains consistent with the source repository. Operators use it to verify sync completeness, detect stale or missing files, and enable reverse index lookups for documentation generation.

## Key Parameters

### Schema & Versioning
- **schemaVersion** (`"1.0.0"`): Defines the config schema version for compatibility. Do not change manually.
- **generatorVersion** (`"archspine/1.0.0"`): Identifies the tool and version that generated the file.
- **createdAt** / **updatedAt**: Timestamps indicating when the index was first created and last modified. Useful for audit and freshness checks.

### Synchronization State (`sync`)
- **lastSyncAt**: The most recent timestamp when synchronization occurred. A stale value may indicate a failed or missed sync.
- **lastSyncMode**: Either `"full"` or `"incremental"`. Full sync re-processes all files; incremental only processes changes.
- **reverseIndexComplete**: Boolean flag. **`false`** means the reverse index (e.g., from documentation paths back to source files) is not fully built. This can degrade query performance for some operations. Expect this to become `true` after a complete indexing run.
- **indexedUnitCount**: The number of indexing units processed so far. In the example, this is `2` (matching the two source files). If this count does not match the actual number of indexed files, the index may be incomplete.

### File Inventory (`files`)
Each source file is stored as a key-value pair mapping file path to metadata. In the example, both `src/auth.ts` and `src/sync.ts` are tracked.

Required metadata per file:
- **contentHash**: A 64-character SHA-256 hex string. The system uses this to detect content changes. An incorrect or stale hash can cause unrecognized changes or sync failures.
- **fileKind**: The category of the file (e.g., `"source"`). Only predefined kinds are allowed.
- **lastIndexedAt**: Timestamp of the last indexing for this file.
- **docs**: An array of per-locale documentation references. Each entry has a `locale` (e.g., `"zh-CN"`) and a `path` to the generated documentation file.
- **sourceExists**: Boolean indicating whether the original source file still exists on disk. A `false` value means the file has been deleted or moved—this should be investigated.

## Stability & Risks

- **Hash mismatches**: If a source file is modified but its hash is not updated, the system may incorrectly assume no change. Conversely, a stale hash can cause unnecessary re-syncs.
- **Reverse index incomplete**: While `reverseIndexComplete` is `false`, reverse lookups may not return all relevant documentation. This is a transient state during initial indexing or after a partial sync.
- **Indexed unit count discrepancies**: If `indexedUnitCount` does not equal the actual number of processed units (files or logical units), some content may be missing from the mirror.
- **Missing or malformed entries**: Omitted locales, incorrect paths, or broken links in the `docs` array will lead to incomplete documentation generation.
- **Operational checks**: Always verify timestamps (`createdAt`, `updatedAt`, `lastSyncAt`) to confirm the data is not stale. Cross-check `sourceExists` with actual disk state before relying on the index for deployments.