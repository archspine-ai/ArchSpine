# ArchSpine SpineManifest Config Summary

This JSON Schema defines the structure and validation rules for ArchSpine SpineManifest files. It ensures consistency in sync state tracking and file indexing. The manifest includes required metadata (`schemaVersion`, `generatorVersion`, `createdAt`, `updatedAt`), a sync state object, and a file index.

## Key Parameters

- `schemaVersion` & `generatorVersion` – Must conform to shared schema definitions; mismatches cause incompatibility.
- `sync.lastSyncAt` – Records the last synchronization timestamp; affects freshness checks.
- `sync.lastSyncMode` – One of `"full"`, `"incremental"`, or `"unknown"`; influences subsequent sync strategy.
- `sync.reverseIndexComplete` – Boolean flag indicating if the reverse index is fully built; impacts query completeness.
- `sync.indexedUnitCount` – Non‑negative integer; used for progress and consistency checks.
- `files.<path>.contentHash` – Hash of file content; ensures integrity and detects changes.
- `files.<path>.sourceExists` – Flag indicating whether the source file still exists; affects rebuild decisions.
- `files.<path>.docs` – Array of objects with `locale` and `path`; references related documentation.

## Stability and Operational Risks

This schema enforces strict validation on manifest files. Missing fields or invalid enums (e.g., an unknown sync mode) can cause sync failures or index corruption. Invariants such as non‑negative `indexedUnitCount` and proper timestamps prevent logical inconsistencies. Mismatched `schemaVersion` may lead to incompatibility between the generator and consumer. Operators should ensure data integrity before ingestion and monitor for validation errors during sync operations.