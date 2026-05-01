<!-- spine-content-hash:b8cc64957fc835ad34a7e395f548d09496055e2afff42105be16b2e7141de971 -->
# ArchSpine Rules Folder Configuration

## Role
Defines the directory structure and metadata for a rules folder within the ArchSpine project, serving as a container for configuration documents.

## Key Responsibilities
- Organizing rule files under `.spine/rules`
- Providing metadata (role, responsibility) for the folder and its children
- Tracking provenance information for indexing and generation

## Invariants
- The directory must be `.spine/rules`
- `schemaVersion` must be exactly `1.0.0`
- Each child must have a `filePath`, `role`, and `fileKind`

## Negative Scope
This file does not define runtime behavior, enforce security policies, or manage user authentication. It is purely a structural descriptor for documentation and AI context.

## Exported Behavior
The configuration is consumed by indexing and generation pipelines. It validates that the directory path and child file references are correct. The `provenance` block is informational and does not affect runtime behavior.

## Stability and Risks
This file is a structural descriptor with low operational risk. Incorrect directory or `schemaVersion` may cause indexing failures or misrouting of rule files. System stability is maintained as long as the directory path and child file references are valid.

## Parameter Definitions
- **schemaVersion**: Version of the schema used to validate this configuration; must be `1.0.0` for compatibility.
- **directory**: Target directory path where rule files are stored; must be `.spine/rules`.
- **role**: Functional description of the folder's purpose, used for documentation and AI context.
- **responsibility**: High-level responsibility assigned to this folder, aiding in system understanding.
- **children**: Array of child file entries, each specifying a file path, role, and file kind (e.g., `document`).
- **provenance**: Metadata about when and how this configuration was generated, including indexing timestamp and generator version.
  - **provenance.indexedAt**: ISO 8601 timestamp of when the folder was last indexed.
  - **provenance.generatorVersion**: Version identifier of the generator tool (e.g., `archspine/1.0.0`).
  - **provenance.pipelineStages**: List of processing stages (e.g., `ast`, `llm`) used to generate this configuration.