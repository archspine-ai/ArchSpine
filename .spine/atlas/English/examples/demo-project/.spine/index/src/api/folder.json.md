<!-- spine-content-hash:fe981a468e54ace3174387ea9ac6dde112f564d1c783c6e5825c1ffd99c83839 -->
# ArchSpine Directory Metadata Configuration

## Role
Defines the structural metadata and indexing provenance for a source code directory within the ArchSpine mirror system.

## Key Responsibilities
- Declares the directory path and its functional role in the project
- Lists child source files with their roles and file kinds
- Records indexing provenance including timestamp, generator version, and pipeline stages

## Notable Invariants
- `schemaVersion` must be a valid semver string
- `directory` must be a non-empty string representing a valid project path
- `provenance.indexedAt` must be a valid ISO 8601 timestamp
- `provenance.generatorVersion` must follow the `archspine/<semver>` format

## Negative Scope
This configuration file is a metadata descriptor for a single source directory. It does not directly control runtime behavior or system security. Incorrect or stale provenance data can lead to misalignment between the mirror system's understanding of the codebase and the actual source tree, potentially causing indexing errors, missed dependencies, or incorrect role assignments.

## Exported Behavior
The configuration is consumed by the ArchSpine mirror system to understand the structure and purpose of a source directory. It provides traceability through provenance metadata but does not enforce operational constraints. The system should validate that directory and file paths actually exist in the repository to prevent silent failures.

## Parameter Definitions
- **schemaVersion**: Specifies the version of the schema used for this configuration file, ensuring compatibility with parsing tools.
- **directory**: The relative path of the directory being described, used by the mirror system to locate and organize source code.
- **role**: A human-readable label describing the functional purpose of the directory or file within the project architecture.
- **responsibility**: A brief description of the responsibilities assigned to this directory, aiding in system understanding and documentation.
- **children**: An array of child file entries, each containing a file path, role, and file kind, enabling recursive traversal of the source tree.
- **provenance**: Metadata block recording when and how this configuration was generated, critical for audit trails and reproducibility.
- **provenance.indexedAt**: Timestamp of when the directory was last indexed, used to detect stale or outdated configurations.
- **provenance.generatorVersion**: Identifies the version of the ArchSpine generator that produced this file, important for debugging and compatibility checks.
- **provenance.pipelineStages**: Lists the processing stages (e.g., AST parsing, LLM analysis) that contributed to generating this configuration, providing transparency into the indexing pipeline.

## Stability and Risks
This configuration file is a metadata descriptor for a single source directory. It does not directly control runtime behavior or system security. However, incorrect or stale provenance data can lead to misalignment between the mirror system's understanding of the codebase and the actual source tree, potentially causing indexing errors, missed dependencies, or incorrect role assignments. The invariants ensure schema consistency, but the system should validate that the directory and file paths actually exist in the repository to prevent silent failures. The pipeline stages field provides traceability but does not enforce any operational constraints.