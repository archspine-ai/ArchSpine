<!-- spine-content-hash:c8c859d80214b3bebbf228bd5584533c2cd6941c6966ad1add1cebd24b86d147 -->
# ArchSpine Domain Source Metadata

## Role
Defines the structural metadata and indexing provenance for a domain source folder within the ArchSpine mirror system.

## Key Responsibilities
- Declares the directory path and role for a domain folder
- Lists child source files with their roles and kinds
- Records indexing provenance including timestamp, generator version, and pipeline stages

## Important Invariants
- The `schemaVersion` must be a valid semver string
- The `directory` field must be a non-empty relative path
- Each child must have a `filePath` and `fileKind`
- The `provenance.indexedAt` must be a valid ISO 8601 timestamp

## Negative Scope / Out of Scope
This file does not contain runtime logic, executable code, or behavioral definitions. It is purely a metadata descriptor.

## Exported / Externally Visible Behavior
This file is consumed by the ArchSpine mirror system to understand the structure and provenance of a domain folder. It does not export any functions, classes, or runtime APIs. Its primary external effect is to influence how the system indexes, locates, and organizes source files within a domain.

## Parameter Definitions
- **schemaVersion**: Version of the configuration schema used; ensures compatibility with the parser.
- **directory**: Relative path to the domain folder being described; affects how the system locates and organizes source files.
- **role**: Functional label for the folder; used by the system to categorize and apply policies.
- **responsibility**: Brief description of the folder's purpose; aids in documentation and auditing.
- **children**: Array of child file entries; each entry specifies a source file path, its role, and file kind (e.g., 'source').
- **provenance**: Metadata block recording when and how this configuration was generated, including the indexing pipeline stages (e.g., 'ast', 'llm').

## Stability and Risks
This file is a metadata descriptor with no direct runtime effect. However, incorrect directory paths or missing child entries can cause the mirror system to mis-index or fail to locate domain files, leading to incomplete analysis or broken references. The provenance block is critical for audit trails and debugging indexing issues. Schema version mismatches may cause parsing failures.