# ArchSpine Semantic Configuration Summary

This configuration file defines the semantic identity, indexing pipeline, and provenance metadata for the **ArchSpine** project knowledge graph. It is the keystone for all indexing operations – if incorrectly set, the system may fail to generate correct semantic contracts, produce inconsistent documentation, or lose provenance traceability.

## What This Configuration Controls

The file declares the project name, high-level role, module directories, and indexing provenance. It tells ArchSpine *what* to index, *how* to interpret source directories, and *when* the index was built.

### Key Parameters and Their Importance

| Parameter | Description | Operational Notes |
|-----------|-------------|-------------------|
| `schemaVersion` | Expected schema format (`"1.0.0"` must match current generator). | Mismatches cause parsing failures; must remain aligned with the runtime version to prevent silent data corruption. |
| `projectName` | Identifier for the repository (e.g., `"archspine"`). | Used to scope generated artifacts and cross-reference indices. Must be a non‑empty string. |
| `role` | Functional purpose of this configuration in the indexing pipeline (e.g., *Semantic indexing and protocol tooling for repository knowledge graphs*). | Describes the overall system intent – influences which pipeline stages are activated. |
| `responsibility` | Primary outcome this configuration drives (e.g., *Builds machine‑readable semantic contracts and derived documentation under `.spine`*). | Affects downstream documentation generation; misalignment can produce irrelevant or broken outputs. |
| `modules` | List of source directories and their roles. Each entry has `directory`, `role`, and `childCount`. | `childCount` helps allocate indexing resources and detect structural changes. Omitting or mislabeling modules leads to incomplete indexing or resource allocation errors. |
| `provenance` | Records when (`indexedAt`), how (`generatorVersion`), and through which pipeline stages the index was built (e.g., `["ast", "llm"]`). | Critical for cache invalidation and audit trails. `indexedAt` must be a valid ISO 8601 timestamp; `generatorVersion` must match the current tool version. |

### Example from Supporting Context

```yaml
projectName: archspine
schemaVersion: "1.0.0"
role: "Semantic indexing and protocol tooling for repository knowledge graphs."
modules:
  - directory: src
    role: "Runtime and indexing pipeline implementation."
    childCount: 14
  - directory: docs
    role: "Specification and strategy assets."
    childCount: 4
provenance:
  indexedAt: "2026-04-02T10:00:00Z"
  generatorVersion: "archspine/1.0.0"
  pipelineStages: ["ast", "llm"]
```

## Operational Risks and Stability Concerns

- **Schema/Generator version mismatch:** The `schemaVersion` and `generatorVersion` must align with the actual runtime version of the ArchSpine generator. A mismatch can silently corrupt indexed data or break the entire pipeline.
- **Module misconfiguration:** Incorrect `directory` paths, roles, or omitted `childCount` values cause incomplete indexing and resource allocation errors. The system uses `childCount` to decide how many workers to assign per module.
- **Provenance inconsistency:** If `indexedAt` is not a valid ISO timestamp, or `generatorVersion` does not match the tool, audit trails become unreliable and cache invalidation may not work.
- **Missing invariants:** The `modules` array must contain at least one entry; `projectName` must be a non‑empty string; `schemaVersion` must be exactly `"1.0.0"`. Violating any of these invariants will prevent the index from being built at all.

Operators should treat this file as a critical control plane – any change should be reviewed, validated, and tested against a non‑production environment first.