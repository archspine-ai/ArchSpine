<!-- spine-content-hash:949e27b174b4537099a624487eaadcf5a73fb4e76b92ae93e1ffb941f1cb9d04 -->
# ArchSpine Project Root Configuration

## Role
Defines the project identity, module structure, and provenance metadata for the ArchSpine semantic indexing system.

## Key Responsibilities
- Manage project metadata and schema versioning
- Define module directory layout and role assignment
- Track provenance for indexing pipeline stages

## Important Parameters
- **schemaVersion**: Controls compatibility with ArchSpine tooling; mismatched versions may cause parsing failures.
- **projectName**: Identifies the repository for cross-reference integrity; must match the root project name.
- **modules**: Declares source and documentation directories with their roles and file counts; affects indexing scope.
- **provenance.indexedAt**: Timestamp of last indexing; used for cache invalidation and staleness detection.
- **provenance.generatorVersion**: Version of the indexing tool that produced this file; critical for reproducibility.
- **provenance.pipelineStages**: Ordered list of processing stages (e.g., AST, LLM) that generated the index; affects downstream tool behavior.

## Invariants
- `schemaVersion` must be a valid semver string
- `projectName` must match the repository root identifier
- `provenance.indexedAt` must be a valid ISO 8601 timestamp
- `pipelineStages` must contain at least one stage

## Stability and Risks
This file is the root configuration for the ArchSpine indexing pipeline. Incorrect `schemaVersion` or `projectName` can break cross-repository linking and toolchain compatibility. Missing or stale provenance timestamps may cause unnecessary re-indexing or missed updates. The module list defines the scope of semantic analysis; omitting directories can lead to incomplete knowledge graphs.

## Exported Behavior
This file is consumed by ArchSpine tooling to initialize the indexing pipeline. It does not export any runtime functions or classes; it is a static configuration document.