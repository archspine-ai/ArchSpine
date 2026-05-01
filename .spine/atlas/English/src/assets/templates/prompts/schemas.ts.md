<!-- spine-content-hash:b26fa82fc5223a6d53a87051eef6fed37ca44b940e45f193ef3cfaf92f60c8a0 -->
# ArchSpine Schema Definitions

This module provides the JSON template structures for all semantic summary units used throughout the ArchSpine mirror system. It defines the canonical shape that every summary must follow, ensuring consistency across different entity types.

## Role

Schema definition module providing JSON templates for ArchSpine semantic summary units.

## Key Responsibilities

- Defines the JSON schema structure for source file semantic summaries.
- Defines the JSON schema structure for document semantic summaries.
- Defines the JSON schema structure for configuration file semantic summaries.
- Defines the JSON schema structure for folder unit semantic summaries.
- Defines the JSON schema structure for project-level semantic summaries.

## Notable Invariants

- All exported schemas are string constants containing valid JSON template literals.
- Every schema defines a `semantic` object as its root or primary container.

## Negative Scope (Out of Scope)

- This module does **not** validate data against the defined schemas.
- It does **not** parse or interpret the content of summarized files.
- It does **not** generate summaries; it only provides the template structure.

## Public Surface (Exported Symbols)

- `sourceFileSchema`
- `documentSchema`
- `configSchema`
- `folderSchema`
- `projectSchema`

These five constants are the only externally visible behavior. Consumers import the appropriate schema constant and use it as a template when constructing semantic summaries for the corresponding entity type.