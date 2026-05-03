# ArchSpine Atlas Manifest – Operator Summary

## Purpose

This manifest file (`atlas.json`) is the central index for the ArchSpine Atlas system. It records every source file that has been indexed, along with its content fingerprint (SHA-256 hash) and links to its documentation in supported locales. It also stores synchronization checkpoint data used by the runtime to determine when a rescan is needed.

## Key Parameters & What They Control

| Parameter | What It Means | Why It Matters |
|-----------|---------------|----------------|
| `schemaVersion` | Version of the manifest schema. | Upgrading this can break compatibility with older tools. |
| `generatorVersion` | Exact ArchSpine tool version that created the manifest. | Used for debugging and migration. |
| `createdAt` / `updatedAt` | Timestamps of creation and last modification. | Help trace lifecycle and detect stale state. |
| `sync.lastSyncAt` | When the last sync completed. | Used for incremental sync decisions. |
| `sync.lastSyncMode` | `'full'` or `'incremental'`. | Affects the trust level of the index. |
| `sync.reverseIndexComplete` | Boolean: whether the reverse index (docs back to source) is fully built. | If `false`, view generation and certain queries degrade. Handle with care. |
| `sync.indexedUnitCount` | Number of tracked source units. | Should match the count of keys in `files`. **Divergence indicates corruption.** |
| `files.<path>.contentHash` | SHA-256 hex digest of file content. | Used to detect modifications without re-reading the entire file. |
| `files.<path>.fileKind` | Category of the file (`source`, `test`, `config`). | Influences which analysis pipelines are applied. |
| `files.<path>.lastIndexedAt` | When this file was last indexed. | Decides if re-indexing is needed. |
| `files.<path>.docs` | Array of locale + path to Atlas documentation. | Each entry must have a valid locale and a path under `.spine/atlas/`. |
| `files.<path>.sourceExists` | Boolean: whether the source file still exists on disk. | Allows graceful handling of deleted files. |

## Operational Risks & Stability Concerns

- **Single source of truth**: This manifest is the foundation for all indexing and analysis. If it becomes inconsistent (e.g., `contentHash` mismatches actual file content), analysis and fix operations will produce false positives or miss violations.
- **Corruption or deletion**: If this file is deleted or corrupted, the next sync will trigger a **full re-index**, which can be very time-consuming.
- **`reverseIndexComplete` flag**: If set to `false`, view generation and certain queries are degraded. Only set to `true` when the reverse index has been fully built, and ensure the process is reliable.
- **`indexedUnitCount` mismatch**: If the number of entries in `files` differs from `sync.indexedUnitCount`, the manifest is corrupt. Operators should validate this count after every sync.
- **`contentHash` integrity**: The hash must match the actual file content. If the file changes without updating the hash, the system will not detect the change. Use only authorized ArchSpine tooling to update the manifest.
- **File system syncing**: The entire system's integrity depends on this manifest staying in sync with the file system. Any manual edits or out-of-band modifications risk instability.

## Example (from current context)

- `files` contains two entries (`src/auth.ts` and `src/sync.ts`), both `source` type, with docs in `zh-CN`.
- `reverseIndexComplete` is `false` – meaning certain cross-reference lookups may not work until a full reverse index build is run.
- `sync.lastSyncMode` is `full` – the index was completely rebuilt on the last sync.