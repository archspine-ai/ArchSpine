<!-- spine-content-hash:e8c1d8370902b7efe8e67eec37c64fb065135ca814e75c819ec1cb606bd5e44c -->
# ArchSpine Language Index Manifest

## Role
This file serves as the **central language index manifest** for the ArchSpine documentation atlas. It tracks the synchronization state of all documentation files, maps source files to their localized documentation paths, and records content hashes for integrity verification.

## Key Responsibilities
- **Tracking synchronization state** of documentation files across all configured locales.
- **Mapping source files** to their corresponding localized documentation paths.
- **Recording content hashes** (SHA-256) for integrity verification and change detection.

## Notable Invariants
- Every source file must have a corresponding documentation entry for each configured locale.
- The `contentHash` must match the actual file content at the time of last indexing.
- The `sourceExists` flag must be `true` for any file that is expected to be present on disk.

## Negative Scope (Out of Scope)
- This file does **not** contain the actual documentation content.
- It does **not** perform any indexing or generation itself; it only records the results of such processes.

## Exported / Externally Visible Behavior
- **Public Surface**: None directly; this is an internal manifest consumed by the ArchSpine build and indexing pipeline.
- **Consumers**: The documentation atlas builder, locale-aware query system, and integrity verification tools.
- **Key Fields**:
  - `schemaVersion` / `generatorVersion`: Versioning and tool identification.
  - `createdAt` / `updatedAt`: Timestamps for audit and freshness.
  - `sync.*`: Synchronization metadata (last sync time, mode, reverse index completeness, indexed unit count).
  - `files.<path>.*`: Per-file metadata including `contentHash`, `fileKind`, `lastIndexedAt`, `docs[]` (locale + path), and `sourceExists`.

## Stability and Risks
This file is the **central registry** for the documentation atlas. If it becomes corrupted or out of sync, the system may fail to locate or generate localized documentation, leading to broken references in the user interface or build pipeline. The `reverseIndexComplete` flag being `false` can cause incomplete locale-based queries. Missing or mismatched `contentHash` values will trigger unnecessary re-indexing or, worse, serve stale documentation. The `sourceExists` flag must be kept accurate to prevent orphaned entries from accumulating and confusing the indexing logic.