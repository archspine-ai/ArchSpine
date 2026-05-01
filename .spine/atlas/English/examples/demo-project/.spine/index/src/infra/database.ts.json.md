<!-- spine-content-hash:122a8a30708c259d4689bdbfefe7853ab35b6b5fc2e4c343d230933cd081b87e -->
# ArchSpine Metadata Index – Source Summary

This file is a **metadata and structural index** for a single TypeScript source file within the ArchSpine mirror system. It does not contain runtime logic; instead, it records identity, content integrity, semantic annotations, dependency graph, and provenance for the file it describes.

## Key Responsibilities

- **File Identity & Integrity** – Tracks the file's path, content hash, skeleton hash, and semantic hash to detect drift and ensure consistency.
- **Semantic Declaration** – Stores the file's role, responsibilities, invariants, and out-of-scope items, providing a human- and machine-readable contract.
- **Dependency Graph** – Records which files this file depends on (`dependsOn`) and which depend on it (`dependedBy`), along with a flag for reverse index completeness.
- **Provenance** – Captures indexing timestamp, generator version, and pipeline stages for auditability.

## Notable Invariants

- The file path must be unique and match the project's directory structure.
- The content hash must be recalculated on every file change to detect drift.
- The semantic role must accurately reflect the file's actual purpose.

## Negative Scope (Out of Scope)

This index file does **not** control runtime behavior, execute business logic, or modify source code. It is purely a metadata snapshot.

## Exported / Public Surface

This file has no public API or exported symbols. It is consumed internally by the ArchSpine indexing pipeline.

## Stability & Risks

- **Stale hashes** can cause undetected drift.
- **Incomplete reverse index** leads to inaccurate dependency analysis.
- **Mismatched semantic annotations** misrepresent the file's role.
- System stability depends on regenerating the index after every file modification.