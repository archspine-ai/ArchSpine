# ArchSpine Configuration Summary

This configuration defines the project metadata, module structure, and provenance pipeline for **ArchSpine** — a system that performs semantic indexing and generates documentation from repository knowledge graphs. It is consumed by both runtime pipelines (indexing, document generation) and tooling that validates repository consistency.

## Key Parameters and Their Significance

| Parameter | Value / Constraint | Purpose |
|---|---|---|
| `schemaVersion` | Must be `"1.0.0"` | Ensures backward compatibility; used by downstream consumers to interpret the configuration format. |
| `projectName` | Must be `"archspine"` | Identifies the project for routing and validation; cannot be changed without breaking integration. |
| `modules` | Exactly two entries: `src` (14 children) and `docs` (4 children) | Declares which top‑level directories are recognized. `src` holds the indexing pipeline, `docs` holds specification and strategy assets. The `childCount` is used for structural integrity checks. |
| `provenance.indexedAt` | ISO 8601 timestamp (e.g. `2026-04-02T10:00:00Z`) | Records when the index was last generated – critical for cache invalidation, incremental builds, and audit trails. |
| `provenance.generatorVersion` | Must be `"archspine/1.0.0"` | Pins the exact version of the generator that produced this configuration, enabling reproducibility. |
| `provenance.pipelineStages` | Ordered list `["ast", "llm"]` | Defines the processing stages (abstract syntax tree analysis, then LLM processing). The order determines the dependency chain and cannot be altered without changing the pipeline implementation. |

## Operational Risks and Stability Concerns

- **Strict version enforcement**: `schemaVersion` and `generatorVersion` are locked to exact values. Changing them (or omitting them) will cause downstream tooling to reject the configuration or produce unpredictable results. Always update tooling in lockstep with schema changes.

- **Module structure requirements**: The `modules` array must contain exactly the required directories with the specified child counts. Missing `src` or `docs` will lead to incomplete index generation – and because such failures may be silent (e.g., an empty index file is created), they are hard to detect. Validation should be run as part of your CI pipeline.

- **Provenance timestamps**: An incorrect or stale `indexedAt` can trick caching systems into using an outdated index or triggering unnecessary full rebuilds. For incremental builds, ensure the timestamp is updated each time the index is regenerated.

- **Pipeline stage ordering**: The `pipelineStages` list is ordered and must include both `"ast"` and `"llm"` in that sequence. Changing the order or removing a stage will break the dependency chain of the indexing pipeline and may cause data inconsistency in the generated documentation.

In summary, this configuration acts as a contract between the repository structure and the ArchSpine tooling. Any deviation from the enforced invariants can compromise the reliability of the semantic knowledge graph and the documentation it produces.