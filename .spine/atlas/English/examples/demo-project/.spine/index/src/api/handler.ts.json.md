<!-- spine-content-hash:0b09f782a81e9daf3a6f8f01600bcd47f3cd9635fe1def8f6cc326de123a533b -->
# ArchSpine Source File Metadata Configuration

## Role
Defines the semantic metadata, dependency graph, and structural skeleton for a single source file within the ArchSpine mirror system.

## Key Responsibilities
- Tracking file identity and content integrity via hashes
- Declaring the file's role, responsibilities, and invariants
- Recording import/export structure and declared symbols
- Mapping dependency edges between symbols across files
- Flagging rule violations and architectural drift

## Invariants
- The `identity.contentHash` must match the actual file content to ensure consistency
- The `semantic.ruleViolations` array must be empty for a clean architectural state
- The `graph.reverseIndexComplete` must be true for a fully resolved dependency graph

## Negative Scope
This configuration file does not enforce runtime behavior, execute code, or modify source files. It is purely a metadata and analysis artifact.

## Exported Behavior
The configuration is consumed by ArchSpine's analysis pipeline to validate architectural rules, detect drift, and provide dependency insights. Key externally visible behaviors include:
- **Integrity verification**: The content hash ensures stale metadata is not used.
- **Rule enforcement**: Rule violations (e.g., layer isolation errors) are flagged with severity and reason.
- **Dependency analysis**: The reverse index completeness flag indicates whether the dependency graph is fully resolved.
- **Drift detection**: The `driftDetected` flag and `driftReason` field signal deviations from intended architecture.

## Stability and Risks
This configuration file is critical for maintaining architectural consistency across the codebase. It enforces layer isolation rules and detects drift between actual code and intended design. A rule violation (e.g., layer-isolation error) indicates a direct stability risk, as it allows infrastructure concerns to leak into the API layer, potentially causing tight coupling and making the system harder to refactor or test. The reverse index completeness flag is essential for accurate dependency analysis; an incomplete index may lead to missed dependency cycles or incorrect impact analysis. The content hash ensures that stale metadata is not used, preventing silent inconsistencies during builds or deployments.

## Parameter Definitions
- **schemaVersion**: Version of the schema used to validate this configuration file.
- **identity.filePath**: Relative path of the source file from the project root.
- **identity.contentHash**: SHA-256 hash of the file content for integrity verification.
- **identity.skeletonHash**: Hash of the file's structural skeleton (imports/exports).
- **identity.semanticHash**: Hash of the file's semantic annotations and metadata.
- **identity.language**: Programming language of the source file (e.g., typescript).
- **identity.fileKind**: Classification of the file (e.g., source, test, config).
- **identity.scope**: Logical scope or module the file belongs to.
- **semantic.role**: Functional purpose of this file within the system.
- **semantic.responsibilities**: List of subsystems or concerns this file is responsible for.
- **semantic.outOfScope**: Explicitly listed concerns that are out of scope for this file.
- **semantic.invariants**: Mandatory constraints or safety limits enforced by this file.
- **semantic.changeIntent.architecturalIntent**: High-level architectural goal for this file.
- **semantic.changeIntent.recentChangeIntent**: Intent behind the most recent modification.
- **semantic.publicSurface**: List of public APIs or symbols exposed by this file.
- **semantic.ruleViolations**: Array of architectural rule violations detected, each with an id, severity, and reason.
- **semantic.driftDetected**: Boolean flag indicating whether the file has drifted from its intended architecture.
- **semantic.driftReason**: Explanation of the drift if detected.
- **skeleton.imports**: List of imported modules or symbols.
- **skeleton.exports**: List of exported symbols from this file.
- **skeleton.declaredSymbols**: Symbols declared within this file.
- **skeleton.structuralHints.importCount**: Number of import statements.
- **skeleton.structuralHints.exportCount**: Number of export statements.
- **skeleton.structuralHints.isBarrel**: Whether this file is a barrel (re-export) file.
- **skeleton.structuralHints.isTypeOnly**: Whether this file contains only type definitions.
- **graph.dependsOn**: List of files this file depends on.
- **graph.dependedBy**: List of files that depend on this file.
- **graph.reverseIndexComplete**: Whether the reverse dependency index has been fully resolved.
- **graph.symbolEdges**: Detailed edges between symbols, including source, target, relation, and provenance.
- **provenance.indexedAt**: Timestamp when this file was last indexed.
- **provenance.generatorVersion**: Version of the ArchSpine generator that produced this metadata.
- **provenance.pipelineStages**: Stages of the indexing pipeline used (e.g., ast, fallback).