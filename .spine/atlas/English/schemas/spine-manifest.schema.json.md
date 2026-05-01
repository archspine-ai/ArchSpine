<!-- spine-content-hash:63ef3291e0e8d90eebfe8cf16f0263163dee1ebc6b8255f0e00a67023c0a4c4d -->
# ArchSpine SpineManifest Schema

## Role

Defines the schema for the ArchSpine SpineManifest, a metadata manifest that tracks the synchronization state and indexed file inventory of a mirror repository.

## Key Responsibilities

- Declares the required structure and validation rules for `spine-manifest.json` files
- Enforces mandatory fields: `schemaVersion`, `generatorVersion`, `createdAt`, `updatedAt`, `sync`, `files`
- Governs the sync metadata block including last sync timestamp, mode, reverse index completeness, and indexed unit count
- Governs the files inventory block mapping repo-relative paths to their content hash, file kind, last indexed timestamp, associated documentation locales, and source existence flag

## Notable Invariants

- The `sync` object must always include `lastSyncAt`, `lastSyncMode`, `reverseIndexComplete`, and `indexedUnitCount`
- `lastSyncMode` must be one of: `'full'`, `'incremental'`, or `'unknown'`
- `indexedUnitCount` must be a non-negative integer
- Each file entry must include `contentHash`, `fileKind`, `lastIndexedAt`, `docs`, and `sourceExists`
- The `files` object keys must conform to repo-relative path format
- No additional properties are permitted at the root level or within sync or file entry objects

## Negative Scope

This schema does not define the actual synchronization logic, file indexing algorithms, or storage backend. It only defines the structure and validation rules for the manifest file itself.

## Most Important Exported Behavior

The schema enforces structural integrity of the spine manifest, which is critical for the mirror system's ability to track synchronization state and file inventory. Violations of the schema (e.g., missing required fields, invalid enum values, or negative counts) will cause validation failures, potentially halting sync operations or corrupting the manifest. The strict `additionalProperties: false` constraints prevent unexpected fields from being injected, reducing the risk of silent data corruption. The `reverseIndexComplete` flag is a safety invariant: if set to `false` while `indexedUnitCount > 0`, downstream tools may operate on incomplete data. The nullable `lastSyncAt` field allows graceful handling of never-synced repositories. Overall, strict adherence to this schema is essential for reliable mirror state management and recovery.

## Parameter Definitions

- **schemaVersion**: References the shared schema version definition; ensures compatibility with the expected schema revision.
- **generatorVersion**: A non-empty string identifying the version of the tool that generated this manifest.
- **createdAt**: ISO 8601 timestamp marking when this manifest was first created.
- **updatedAt**: ISO 8601 timestamp marking the last modification time of this manifest.
- **sync.lastSyncAt**: Nullable ISO 8601 timestamp of the most recent synchronization event; null indicates no sync has occurred.
- **sync.lastSyncMode**: Enum field indicating the synchronization mode: `'full'`, `'incremental'`, or `'unknown'`.
- **sync.reverseIndexComplete**: Boolean flag indicating whether the reverse index (mapping indexed units back to files) has been fully built.
- **sync.indexedUnitCount**: Non-negative integer counting the total number of indexed units (e.g., documents or chunks) in the repository.
- **files.\<path\>.contentHash**: Hash of the file's content, used to detect changes and ensure integrity.
- **files.\<path\>.fileKind**: Classification of the file type (e.g., source, documentation, configuration) as defined by the shared fileKind schema.
- **files.\<path\>.lastIndexedAt**: ISO 8601 timestamp of when this file was last indexed.
- **files.\<path\>.docs**: Array of associated documentation entries, each with a locale and a repo-relative path.
- **files.\<path\>.sourceExists**: Boolean indicating whether the original source file still exists on disk.

## Stability and Risks

This schema enforces structural integrity of the spine manifest, which is critical for the mirror system's ability to track synchronization state and file inventory. Violations of the schema (e.g., missing required fields, invalid enum values, or negative counts) will cause validation failures, potentially halting sync operations or corrupting the manifest. The strict `additionalProperties: false` constraints prevent unexpected fields from being injected, reducing the risk of silent data corruption. The `reverseIndexComplete` flag is a safety invariant: if set to `false` while `indexedUnitCount > 0`, downstream tools may operate on incomplete data. The nullable `lastSyncAt` field allows graceful handling of never-synced repositories. Overall, strict adherence to this schema is essential for reliable mirror state management and recovery.