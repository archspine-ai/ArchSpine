<!-- spine-content-hash:cc278d7381ae066fefc5dca92ad109d6e4ef8cdd4eff6f2daeacfedf63ebaddc -->
# ArchSpine Architecture Rule Definition

## Role
This file defines architectural rules and constraints for the `.spine/rules` directory within the ArchSpine mirror system. It provides metadata for rule file indexing and drift detection.

## Key Responsibilities
- Define architectural rules and constraints for the `.spine/rules` directory
- Provide metadata for rule file indexing and drift detection

## Invariants
- File must be located at `.spine/rules/arch.yml`
- Content hash and semantic hash must be consistent with actual file content
- Language field is set to `'unsupported'`, indicating no language-specific processing

## Negative Scope
This file has no actual rules defined (empty invariants, no architectural intent). It acts as a placeholder or template. The `'unsupported'` language field means no language-specific processing will occur.

## Externally Visible Behavior
- Drift detection flag is `false`, meaning the system currently considers this file consistent with its expected state
- The reverse index is marked as incomplete, which could lead to incomplete dependency analysis

## Stability and Risks
The primary risk is that without defined invariants or architectural intent, this file provides no actual enforcement of architectural rules, potentially allowing structural drift to go undetected. The incomplete reverse index could lead to incomplete dependency analysis.

## Parameter Definitions

| Parameter | Description |
|-----------|-------------|
| `schemaVersion` | Defines the version of the schema used for this configuration file |
| `identity.filePath` | Specifies the exact file path within the repository |
| `identity.contentHash` | SHA-256 hash of the file content for integrity verification |
| `identity.semanticHash` | Hash representing the semantic meaning of the file content |
| `identity.language` | Indicates the programming language; `'unsupported'` means no language-specific processing |
| `identity.fileKind` | Describes the type of file (e.g., document, code) |
| `identity.scope` | Defines the directory scope this rule applies to |
| `semantic.role` | Describes the functional purpose of this configuration |
| `semantic.responsibilities` | Lists subsystems or areas controlled by these settings |
| `semantic.outOfScope` | Explicitly lists items not covered by this configuration |
| `semantic.invariants` | Mandatory constraints or safety limits that must be maintained |
| `semantic.changeIntent.architecturalIntent` | Documents the intended architectural purpose of changes |
| `semantic.changeIntent.recentChangeIntent` | Documents the reason for the most recent change |
| `semantic.publicSurface` | Lists publicly exposed interfaces or APIs |
| `semantic.ruleViolations` | Records any detected violations of architectural rules |
| `semantic.driftDetected` | Boolean flag indicating whether drift from expected state has been detected |
| `semantic.driftReason` | Explanation of why drift was detected, if applicable |
| `skeleton.imports` | Lists imported dependencies |
| `skeleton.exports` | Lists exported symbols or modules |
| `skeleton.declaredSymbols` | Lists symbols declared within this file |
| `skeleton.structuralHints.importCount` | Number of imports for structural analysis |
| `skeleton.structuralHints.exportCount` | Number of exports for structural analysis |
| `skeleton.structuralHints.isBarrel` | Indicates if this file is a barrel (re-export) module |
| `skeleton.structuralHints.isTypeOnly` | Indicates if this file contains only type definitions |
| `graph.dependsOn` | Lists files this configuration depends on |
| `graph.dependedBy` | Lists files that depend on this configuration |
| `graph.reverseIndexComplete` | Indicates whether the reverse dependency index is fully built |
| `graph.symbolEdges` | Tracks symbol-level dependency relationships |
| `provenance.indexedAt` | Timestamp when this file was last indexed |
| `provenance.generatorVersion` | Version of the ArchSpine tool that generated this metadata |
| `provenance.pipelineStages` | Stages of the processing pipeline applied to this file |