<!-- spine-content-hash:56cc125052d6440b5305c8cc0cc1f499d73cfffc0deb7814b579a46269e900df -->
# ArchSpine Metadata Index Entry (README.md)

This document describes the metadata index entry for a documentation file (README.md) within the ArchSpine mirror system. The entry serves as a passive record that tracks file identity, content integrity, semantic analysis results, dependency relationships, and provenance information.

## Role

The metadata index entry acts as a structured descriptor for a single documentation file. It captures both the file's physical characteristics (path, hash, language) and its semantic meaning within the system architecture.

## Key Responsibilities

- **Identity Tracking**: Records the file's relative path, content hash (SHA-256), semantic hash, detected language, file kind, and scope.
- **Integrity Verification**: The content hash must match the actual file content at indexing time, ensuring no tampering or corruption.
- **Semantic Analysis**: Stores the file's role, responsibilities, out-of-scope concerns, invariants, change intent, and public surface.
- **Dependency Management**: Maintains a dependency graph (`dependsOn`/`dependedBy`) and symbol-level edges to track relationships between files.
- **Drift Detection**: Flags files that have deviated from their expected state, with an explanation for the drift.
- **Provenance Recording**: Captures indexing timestamp, generator version, and pipeline stages for traceability.

## Notable Invariants

- The content hash must always match the actual file content at the time of indexing.
- The semantic hash must be consistent with the extracted meaning of the file.
- The language field must accurately reflect the detected programming or document language.

## Negative Scope

This metadata entry does not directly affect system stability. It is a passive index record. However, inconsistencies between the content hash and actual file content can indicate file tampering or corruption. A mismatch in semantic hash may signal that the file's meaning has changed without re-indexing.

## Exported Behavior

The metadata entry exposes the following top-level fields for external consumption:

- `schemaVersion`: Version of the metadata schema.
- `identity`: File identity information (path, hashes, language, kind, scope).
- `semantic`: Semantic analysis results (role, responsibilities, invariants, change intent, public surface, drift).
- `skeleton`: Structural hints (imports, exports, declared symbols, barrel/type-only flags).
- `graph`: Dependency graph (dependsOn, dependedBy, reverse index completeness, symbol edges).
- `provenance`: Indexing metadata (timestamp, generator version, pipeline stages).

## Stability and Risks

While the metadata entry itself is passive, it plays a critical role in system integrity. The dependency graph helps identify cascading impacts when files are modified. Drift detection flags files that have deviated from their expected state, which is essential for maintaining system consistency. Provenance information ensures that the index generation process is fully traceable.