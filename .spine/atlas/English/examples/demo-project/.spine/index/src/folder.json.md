<!-- spine-content-hash:480493cd98c3363e5d19058ed6a8b76fa064960baa8f78098c4bcb93b89324c3 -->
# ArchSpine Source Directory Configuration

## Role
Defines the structural hierarchy and metadata for the source code directory tree within the ArchSpine project.

## Key Responsibilities
- Maps source folders (src, src/api, src/domain, src/infra) to their roles and responsibilities
- Provides provenance metadata for indexing and generation pipeline tracking

## Important Invariants
- The `directory` field must point to an existing root source folder
- Each child entry must have a valid `filePath` and `fileKind`
- Provenance `indexedAt` must be a valid ISO 8601 timestamp

## Negative Scope / Out of Scope
This file does not define any out-of-scope behavior.

## Exported / Externally Visible Behavior
This file does not export any functions, classes, or public surface. It is a static configuration file consumed by the ArchSpine indexing and generation pipeline.

## Parameter Definitions
- **schemaVersion**: Version of the configuration schema used for validation.
- **directory**: Root directory path for the source code tree.
- **role**: Functional description of the folder's purpose.
- **responsibility**: Specific responsibility assigned to the folder.
- **children**: List of subdirectories or files with their own roles and kinds.
- **filePath**: Relative path to the file or folder.
- **fileKind**: Type of the entry (e.g., 'folder').
- **provenance**: Metadata about when and how this configuration was generated.
- **indexedAt**: Timestamp of when the directory was indexed.
- **generatorVersion**: Version of the tool that generated this configuration.
- **pipelineStages**: Stages in the generation pipeline (e.g., 'ast', 'llm').

## Stability and Risks
This file defines the logical structure of the source tree. Misconfiguration (e.g., incorrect filePath or missing children) could lead to broken navigation or incorrect role assignments in downstream tools. The provenance metadata is critical for auditability; stale timestamps may indicate outdated indexing. Overall, this file has low operational risk but high importance for structural consistency.