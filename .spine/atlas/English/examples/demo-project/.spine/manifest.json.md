# ArchSpine Health-Check Config Summary

This document summarizes the configuration snapshot produced by the ArchSpine system. It is a lightweight, human-readable health check — **not** the authoritative state store (which resides in `.spine/cache.db`). Operators and CI systems can use this file to quickly assess synchronization health and project metadata.

## What It Controls

| Parameter | Description | Example Value from Latest Sync |
|-----------|-------------|--------------------------------|
| `schemaVersion` | Format version of this config file. Must be exactly `1.0.0` for toolchain compatibility. | `1.0.0` |
| `generatorVersion` | Version of the ArchSpine generator that produced this file, used for traceability and upgrade decisions. | `archspine/1.0.0` |
| `project` | Human‑readable project name for identification in multi‑project environments. | `demo-project` |
| `sync.lastSyncAt` | ISO 8601 timestamp of the most recent full or incremental sync. A stale timestamp indicates the repository may be out of date. | `2026-04-26T03:53:07.598Z` |
| `sync.lastSyncMode` | Whether the last sync was `full` or `incremental`. Affects how much state was rebuilt. | `full` |
| `sync.reverseIndexComplete` | Boolean flag; when `false`, any operation relying on the reverse index (e.g., symbol search) may be incomplete. | `true` |
| `sync.indexedUnitCount` | Number of source units successfully indexed. A lower than expected count may signal missing files or scan failures. | `7` |
| `sync.llm.provider` | The LLM provider used for the last sync (e.g., `mock`, `openai`, `gemini`). Important for cost and consistency auditing. | `mock` |
| `sync.llm.providerSource` | Where the provider selection originated (`project-config` or `global-config`), affecting override behavior. | `project-config` |
| `sync.llm.model` | The specific model name used for LLM calls. | `deepseek-chat` |
| `sync.llm.modelSource` | Where the model came from, enabling debugging of model resolution precedence. | `global-config` |
| `health.activeViolations` | Current number of unaddressed rule violations. Zero is ideal; positive values require investigation. | `0` |
| `health.lastSyncDurationMs` | Milliseconds taken by the last sync, useful for performance trend analysis. | `826` |

## Operational Risks & Stability Concerns

- **Derived view, not primary state.** This file is a snapshot derived from the sync process. The authoritative state is in `.spine/cache.db`. A clean `activeViolations` value (0) does **not** guarantee that the underlying cache is uncorrupted or up‑to‑date.
- **Timestamp staleness.** If `lastSyncAt` is significantly behind the current time, the repository may be out of sync. Always cross‑check with the actual repository state before making critical decisions.
- **Index completeness guard.** The invariant `reverseIndexComplete === true` must hold before any index‑based operation (e.g., symbol search, dependency analysis) can be trusted. A `false` value may lead to incomplete results.
- **Zero violations ≠ all clear.** Unresolved violations may exist in the cache that are not yet reflected in this snapshot. Always verify against the full manifest and cache for governance audits.
- **Provider/model resolution.** Changes to `llm.provider` or `llm.model` between syncees can affect cost and output consistency. The `providerSource` and `modelSource` fields help debug unexpected overrides.

## Key Invariants for Operators

- `schemaVersion` must equal `1.0.0` to ensure protocol compatibility.
- `generatorVersion` should match the expected ArchSpine version pattern.
- `lastSyncAt` must be a valid ISO 8601 UTC timestamp to avoid time drift issues.
- `reverseIndexComplete` must be `true` before using index‑based features.
- `health.activeViolations` must be `0` for a clean bill of health.

Treat this file as a quick diagnostic indicator. For critical operations, always validate against the authoritative state in `.spine/cache.db`.