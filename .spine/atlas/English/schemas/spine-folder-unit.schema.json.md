# ArchSpine Folder Unit Configuration Summary

## Purpose

The `SpineFolderUnit` schema defines the structure for a folder-level entry in the ArchSpine documentation index. It captures the role, responsibility, and children (files) of a directory within the project, along with provenance metadata to track indexing history.

## What This Configuration Controls

This configuration controls the metadata associated with a directory in the documentation index. It is used by automated systems for rule validation, view generation, change detection, and audit trails.

## Key Parameters

- **schemaVersion**: The version of the schema used for this folder unit. Must match a valid schema version to ensure forward compatibility.
- **directory**: Filesystem path of the directory, relative to the repository root (scoped path). Identifies which directory the unit describes.
- **role**: A non-empty string describing the functional role of this directory within the project architecture (e.g., "source", "docs", "config").
- **responsibility**: A non-empty string describing the responsibility or purpose of the directory (e.g., "contains primary application logic").
- **children**: An array of file entries belonging to this directory. Each entry must include:
  - **filePath**: Path relative to the repository root.
  - **role**: Non-empty string describing the file's role.
  - **fileKind**: Type of file (e.g., source, test, config).
- **provenance**: Indexing metadata containing:
  - **indexedAt**: ISO 8601 timestamp of when the unit was indexed.
  - **generatorVersion**: Version string of the indexing tool that created this unit.
  - **pipelineStages**: Array of pipeline stage names that processed this unit (e.g., ["validate", "transform"]).

## Operational Risks & Stability Concerns

- **Rigid structure**: The schema enforces strict required fields and disallows additional properties. Any missing or incorrectly typed field will cause automated processing to fail, potentially breaking the entire documentation pipeline and leading to incomplete outputs.
- **Provenance dependency**: The `provenance` block is mandatory. Without it, the system cannot verify data freshness or trace the origin of the unit, which may hinder debugging and recovery.
- **Schema drift risk**: Introducing new fields without updating `schemaVersion` could cause compatibility issues. The `additionalProperties: false` constraint means any unrecognized field will be rejected.
- **Validation chain**: Changes to the schema or to shared definitions referenced via `$ref` may propagate silently and cause downstream validation failures if not coordinated.

Operators should ensure that all required fields are populated accurately, especially `provenance.indexedAt` and `provenance.generatorVersion`, to maintain traceability and enable automated freshness checks.