<!-- spine-content-hash:70eb227242562de0bfbc74510d67949bb907bb0e34d72d04d7d230fa502590cf -->
# ArchSpine Spine Index Manifest

## Role
Defines the structural index and metadata for the `.spine` directory, serving as a manifest for configuration and rule files within the ArchSpine mirror system.

## Key Responsibilities
- Indexing and versioning of `.spine` directory contents
- Declaring file roles and kinds for configuration and rule files
- Tracking provenance metadata including indexing timestamp and generator version

## Invariants
- `schemaVersion` must be a valid semver string
- `directory` must be `.spine`
- `provenance.indexedAt` must be a valid ISO 8601 timestamp
- `provenance.generatorVersion` must follow `archspine/<semver>` format

## Negative Scope
This file does not define any runtime behavior, enforce security policies, or contain executable logic. It is purely a structural index.

## Parameter Definitions
- **schemaVersion**: Version of the schema used to validate this manifest; ensures backward compatibility.
- **directory**: The target directory path that this manifest describes; must be `.spine`.
- **role**: Descriptive label for the directory's functional purpose in the system.
- **responsibility**: High-level responsibility statement for the directory.
- **children**: Array of child entries (files or folders) that belong to this directory, each with a `filePath`, `role`, and `fileKind`.
- **provenance**: Metadata block recording when and how this manifest was generated, including indexing timestamp and generator version.
- **provenance.indexedAt**: ISO 8601 timestamp of when the directory was last indexed.
- **provenance.generatorVersion**: Version identifier of the ArchSpine generator that produced this manifest.
- **provenance.pipelineStages**: List of processing stages (e.g., `ast`, `llm`) applied during generation.

## Stability and Risks
This file is a structural index; misconfiguration (e.g., incorrect `schemaVersion` or missing `children`) can cause the ArchSpine system to fail to locate or validate configuration and rule files, leading to incomplete mirroring or rule enforcement gaps. The provenance block is informational but should be accurate to support debugging and audit trails. The directory invariant ensures the manifest only applies to the `.spine` folder, preventing scope creep.

## Most Important Exported Behavior
The manifest is consumed by the ArchSpine system to discover and validate all configuration and rule files within the `.spine` directory. It must be present and correctly structured for the system to operate.