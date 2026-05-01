<!-- spine-content-hash:fedf5f9ef7a75f3c1458965d999c68d21df205f67edc212bb8423c20439b2c98 -->
# ArchSpine Source Directory Metadata

## Role
Defines the structural metadata and indexing provenance for a source code directory within the ArchSpine mirror system.

## Key Responsibilities
- Declares the directory path and its associated role and responsibility description
- Lists child source files and their individual roles
- Records indexing provenance including timestamp, generator version, and pipeline stages

## Important Invariants
- `schemaVersion` must be a valid semver string
- `directory` must be a non-empty string representing a relative path
- `filePath` in each child must be unique within the file
- `provenance.indexedAt` must be a valid ISO 8601 timestamp
- `provenance.generatorVersion` must follow the `archspine/<version>` format

## Negative Scope
This file does not directly control runtime behavior. It is purely a metadata descriptor for indexing and search purposes.

## Exported Behavior
The file exposes a structured configuration object that describes a source directory. It is consumed by the ArchSpine mirror system to understand the layout, purpose, and indexing history of code directories.

## Parameter Definitions
- **schemaVersion**: Version of the configuration schema used; ensures forward/backward compatibility.
- **directory**: Relative path to the source directory being described.
- **role**: High-level functional description of the directory's purpose.
- **responsibility**: Summary of the directory's responsibilities within the system.
- **children**: Array of child file entries, each specifying a file path and its role.
- **filePath**: Relative path to a source file within the directory.
- **fileKind**: Type of the file (e.g., 'source', 'test', 'config').
- **provenance**: Metadata about when and how this configuration was generated.
- **indexedAt**: ISO 8601 timestamp of when the directory was indexed.
- **generatorVersion**: Version identifier of the tool that generated this configuration.
- **pipelineStages**: Ordered list of processing stages (e.g., 'ast', 'llm') used during indexing.

## Stability and Risks
This file is a metadata descriptor for a source directory. It does not directly control runtime behavior but is critical for the mirror system's indexing and search capabilities. Incorrect or stale provenance data may lead to mismatched indexing results. The file is safe to modify as long as invariants are respected; however, removing or altering child entries without updating the actual source tree can cause inconsistencies in the mirror's representation of the codebase.