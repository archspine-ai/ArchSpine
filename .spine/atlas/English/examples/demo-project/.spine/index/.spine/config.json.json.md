<!-- spine-content-hash:84ddb46c7452a4ec025f9ae4add4430d08f28819e192cb3f475619bd306048f4 -->
# ArchSpine Root Configuration Metadata

## Role
This file serves as the **root configuration metadata** for the ArchSpine mirror system. It is the authoritative anchor that defines system identity, tracks file integrity, enables semantic analysis and drift detection, manages the dependency graph, and records change intent.

## Key Responsibilities
- **System Identity & File Tracking**: Uniquely identifies the configuration file and its location within the repository.
- **Semantic Analysis & Drift Detection**: Provides hashes and semantic metadata to detect when the configuration has drifted from its expected state.
- **Dependency Graph Management**: Records both forward and reverse dependencies, including symbol-level edges, to support build and analysis workflows.
- **Change Intent Recording**: Captures architectural and recent change intent for auditability and long-term understanding.

## Notable Invariants
- `schemaVersion` must be exactly `"1.0.0"`.
- `identity.contentHash` and `identity.semanticHash` must be non-empty SHA-256 strings.
- `identity.filePath` must be `".spine/config.json"`.
- `identity.fileKind` must be `"config"`.
- `identity.scope` must be `".spine"`.
- `provenance.indexedAt` must be a valid ISO 8601 timestamp.
- `provenance.generatorVersion` must be `"archspine/1.0.0"`.

## Negative Scope (Out of Scope)
This configuration does not explicitly exclude any concerns; the `outOfScope` list is empty. However, it is not responsible for runtime behavior, application logic, or user-facing features.

## Most Important Exported / Externally Visible Behavior
- **`driftDetected` flag**: A critical safety mechanism. If `true` without a corresponding `driftReason`, the system state should be treated as potentially inconsistent.
- **`graph.reverseIndexComplete` flag**: Indicates whether the dependency graph is fully resolved. An incomplete index may lead to missing dependency edges and incorrect analysis results.
- **`identity.contentHash` and `identity.semanticHash`**: These hashes are the primary means of integrity verification and change detection. Stale or incorrect values can cause cascading failures.

## Stability & Risks
This file is low-risk for runtime failures but high-impact for system integrity and auditability. Incorrect or stale hashes can cause false drift detection or missed integrity violations, leading to cascading failures in dependency resolution and change tracking. The invariants enforce strict schema compliance; any deviation will cause the system to reject the configuration. Operators should monitor the `driftDetected` flag and ensure `reverseIndexComplete` is `true` for reliable dependency analysis.