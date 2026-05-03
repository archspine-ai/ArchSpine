# ArchSpine SpineProjectUnit Configuration Summary

## Overview
This configuration defines the **SpineProjectUnit**, a self-contained project unit within the ArchSpine knowledge mirror system. It is a foundational schema that enforces consistent representation of a project’s identity, its modular decomposition, and the provenance of its generation. Adherence to this schema ensures reliable indexing, validation, and cross-tool interoperability across the mirror ecosystem.

## What This Configuration Controls
The schema governs three core aspects of each project unit:
- **Project metadata**: name, high‑level functional role, and core responsibility.
- **Module decomposition**: a list of logical submodules, each with a directory path, its role, and a child count.
- **Provenance tracking**: the generation timestamp, generator version, and pipeline stages executed.

All six required fields (`schemaVersion`, `projectName`, `role`, `responsibility`, `modules`, `provenance`) must be present. No extra properties are allowed.

## Key Parameters and Their Operational Significance

- **`schemaVersion`** – Indicates which ArchSpine schema protocol version is in use. This is critical for forward/backward compatibility and schema evolution. Operators should ensure it matches the expected version for their tools.
- **`projectName`** – The unique name used for identification and cross‑referencing inside the mirror. Duplicate names can cause indexing conflicts.
- **`role`** – A high‑level functional category (e.g. "backend service", "library"). This affects how the project is visualized and grouped in architectural analyses. Use a consistent set of roles across the mirror.
- **`responsibility`** – A concise statement of the unit’s core purpose. Used for dependency and architectural analysis. Keep descriptions precise and actionable.
- **`modules`** – An array of submodule objects. Each must include:
  - `directory` – a valid scope‑path (e.g. relative directory). Referencing a non‑existent path will not cause schema validation to fail, but may lead to operational inconsistencies during automated processing.
  - `role` – submodule functionality label.
  - `childCount` – non‑negative integer representing immediate children. Values must be accurate for hierarchical decomposition analysis; incorrect counts can skew metrics.
- **`provenance`** – Contains `indexedAt` (ISO 8601 timestamp), `generatorVersion` (non‑empty string), and `pipelineStages` (array of pipeline stage objects). This block is essential for audit trails and reproducibility. Be aware that timestamps may be sensitive and should be handled appropriately in logs or shared environments.

## Stability and Operational Risks

**Stability**: The schema is robust — it uses strict validation (`additionalProperties: false`), required fields, and shared type definitions (e.g. `nonEmptyString`, `isoTimestamp`, `scopePath`). This structural rigidity prevents drift and ensures that all project units conform to a predictable shape.

**Operational Risks**:
- **Missing or invalid required fields**: The schema will reject any unit that omits a required property; validate all inputs before ingestion.
- **Module directory misalignment**: While schema validation does not check file system existence, a directory that does not exist in the actual project can lead to failures in downstream tools that rely on those paths.
- **Child count inaccuracies**: Over‑ or under‑reporting `childCount` can distort decomposition metrics. Automated generation should derive this count from the actual file tree.
- **Provenance timestamp exposure**: The `indexedAt` timestamp reveals when the unit was generated. If these timestamps are shared broadly, consider whether they expose internal generation schedules or latencies.
- **Future schema evolution**: The `schemaVersion` field allows the protocol to evolve. Operators must track version migrations and ensure old units are either upgraded or still compatible.

## Summary for Operators
Treat this schema as the single source of truth for project unit structure in ArchSpine. Validate all unit documents against it before ingestion. Keep role and responsibility definitions consistent across your mirror to enable meaningful architectural queries. Monitor provenance data for audit compliance, and always automate the computation of module child counts to avoid manual errors. When in doubt, review the `shared.schema.json` type definitions referenced by this schema to understand the exact constraints on each field.