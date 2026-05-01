<!-- spine-content-hash:7e5763ad350bfa4f489ed760f062f527061e088fc724cc76d43c35e2a9e02d1d -->
# ArchSpine Project Structure Definition

This file defines the structural layout and metadata of a project for the ArchSpine mirror system, mapping directory modules to their roles and responsibilities.

## Key Responsibilities

- **Project structure registration and module enumeration** – Registers the folder hierarchy and lists all modules.
- **Role and responsibility assignment to directories** – Assigns each directory a functional role and a description of its accountability.
- **Provenance tracking for indexing and generation pipeline** – Records when and how the configuration was generated, including the indexing timestamp, generator version, and pipeline stages used (e.g., AST parsing, LLM analysis).

## Important Invariants

- `schemaVersion` must be a valid semver string.
- Each module must have a `directory`, `role`, and `childCount`.
- `provenance.indexedAt` must be a valid ISO 8601 timestamp.
- `provenance.generatorVersion` must follow the `archspine/<semver>` format.

## Negative Scope / Out of Scope

This file does not handle any out-of-scope responsibilities.

## Exported / Externally Visible Behavior

The file exposes no public surface (no functions, classes, or APIs). It is a static configuration document consumed by the ArchSpine mirror system.

## Stability and Risks

This file is foundational for the ArchSpine mirror system's understanding of project structure. Incorrect module definitions can lead to misrouted responsibilities or incomplete indexing. The provenance block is critical for auditability; tampering with `indexedAt` or `generatorVersion` may cause pipeline mismatches. The `schemaVersion` invariant ensures forward/backward compatibility. Overall, this file has low operational risk if generated automatically, but manual edits to module roles or `childCount` could silently break downstream analysis.

## Parameter Definitions

- **schemaVersion** – Version of the configuration schema used; ensures compatibility with the ArchSpine parser.
- **projectName** – Human-readable name of the project; used for identification in the mirror system.
- **role** – High-level functional purpose of the project within the ArchSpine ecosystem.
- **responsibility** – High-level accountability description for the project.
- **modules** – Array of directory entries, each specifying a path, its role, and the number of child items it contains. This defines the project's folder hierarchy.
- **provenance** – Metadata block recording when and how this configuration was generated, including the indexing timestamp, generator version, and pipeline stages used (e.g., AST parsing, LLM analysis).