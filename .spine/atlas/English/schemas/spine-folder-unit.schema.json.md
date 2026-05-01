<!-- spine-content-hash:f0d70ca6d346612da6e4c70f044934103521cc1582fb5c4209daffe8f2fa6e63 -->
# SpineFolderUnit Schema

## Role
Defines the schema for a **SpineFolderUnit**, a structural node in the ArchSpine mirror system that represents a directory with a specific role and responsibility.

## Key Responsibilities
- Validating the structure of folder-level units in the ArchSpine project tree
- Enforcing required metadata fields (`schemaVersion`, `directory`, `role`, `responsibility`, `children`, `provenance`)
- Defining the shape and constraints for child file entries within a folder unit
- Tracking provenance metadata including indexing timestamp, generator version, and pipeline stages

## Invariants
- The object must **not** contain additional properties beyond those explicitly defined
- All six required fields must be present: `schemaVersion`, `directory`, `role`, `responsibility`, `children`, `provenance`
- Each child entry must include `filePath`, `role`, and `fileKind`
- Provenance must include `indexedAt`, `generatorVersion`, and `pipelineStages`

## Parameter Definitions
- **schemaVersion**: Specifies the version of the schema used for validation, ensuring compatibility across different releases.
- **directory**: The relative path of the directory within the project scope that this unit represents.
- **role**: A non-empty string describing the functional role of this folder unit within the system.
- **responsibility**: A non-empty string describing the responsibility or purpose of this folder unit.
- **children**: An array of child file entries, each containing a `filePath`, `role`, and `fileKind` to define the files belonging to this folder unit.
- **provenance**: An object containing metadata about when and how this unit was indexed, including `indexedAt` timestamp, `generatorVersion`, and `pipelineStages` array.

## Stability and Risks
This schema enforces strict structural validation for folder units. If a folder unit fails validation (e.g., missing required fields or extra properties), the entire unit may be rejected, potentially breaking the mirror tree. The provenance tracking ensures auditability but adds a dependency on accurate timestamp and version data. Misconfigured child entries could lead to orphaned or misclassified files in the system.

## Negative Scope (Out of Scope)
- No out-of-scope items are explicitly defined for this schema.

## Exported / Externally Visible Behavior
- The schema is used to validate folder units before they are added to the ArchSpine mirror tree.
- Validation failure results in rejection of the entire folder unit.
- Provenance data is required for auditability and traceability.