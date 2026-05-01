<!-- spine-content-hash:8ad327f95be8b462e13e698ab5d0f8a260b3d7c961f09dc7a16d28229966bcba -->
# ArchSpine File Metadata & Semantic Index Entry

## Role
This file serves as a **metadata and semantic index entry** for a single TypeScript source file within the ArchSpine mirror system. It is a configuration-like record that captures the identity, structure, semantics, and dependency graph of the source file it describes.

## Key Responsibilities
- **Identity Tracking**: Maintains file path, content hash, skeleton hash, and semantic hash to detect changes at multiple granularities.
- **Semantic Declaration**: Records the file's role, responsibilities, invariants, and out-of-scope boundaries for human and AI consumption.
- **Structural Skeleton**: Stores imports, exports, declared symbols, and structural hints (e.g., barrel file, type-only file).
- **Dependency Graph**: Tracks both forward dependencies (`dependsOn`) and reverse dependencies (`dependedBy`), including symbol-level edges.
- **Provenance & Pipeline**: Logs indexing timestamp, generator version, and pipeline stages for cache invalidation and audit.

## Notable Invariants
- `schemaVersion` must be a valid semver string.
- `identity.contentHash` must match the actual file content.
- `identity.skeletonHash` must match the parsed AST skeleton.
- `identity.semanticHash` must match the semantic analysis output.
- `filePath` must be relative to the project root.
- `driftDetected` must be `false` unless `driftReason` is provided.

## Negative Scope (Out of Scope)
This file does **not** control runtime behavior, execute business logic, or directly influence application state. It is purely a metadata index for analysis and tracking purposes.

## Most Important Exported / Externally Visible Behavior
- **Hash-based change detection**: The three hashes (content, skeleton, semantic) allow the system to detect changes without full reindexing.
- **Dependency graph traversal**: The `dependsOn` and `dependedBy` fields enable impact analysis and architectural drift detection.
- **Invariant enforcement**: The invariants act as a contract that must hold for the index to be valid; violations trigger investigation.
- **Provenance tracking**: The `indexedAt` and `generatorVersion` fields ensure cache consistency and tool compatibility.

## Stability & Risks
This file is critical for the integrity of the indexing pipeline. Risks include:
- Hash mismatches causing false drift detection or missed changes.
- Incomplete reverse index leading to inaccurate impact analysis.
- Stale provenance timestamps causing cache inconsistency.
- Missing or incorrect invariants allowing unsafe code changes to go undetected.

The file's stability directly affects the reliability of dependency analysis, change impact assessment, and architectural drift detection across the entire project.