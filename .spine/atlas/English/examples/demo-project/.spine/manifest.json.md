# ArchSpine Mirror Sync Snapshot — Configuration Summary

## Purpose
This file is a **health-check and sync-state snapshot** for the ArchSpine mirror system. It provides a quick, human-readable view of the last synchronization activity and overall system health. The authoritative state resides in `.spine/cache.db` — this file is **not** the primary source of truth.

## Key Fields and Their Meaning

| Field | Description | Operational Notes |
|-------|-------------|-------------------|
| `lastSyncAt` | ISO timestamp of the most recent synchronization. | Use to detect staleness. Core state is held separately. |
| `lastSyncMode` | Indicates "full" or "incremental". | A long absence of a full sync may increase next sync cost and time. |
| `reverseIndexComplete` | Boolean confirming reverse index build success. | If `false`, search and lookup may be incomplete. |
| `indexedUnitCount` | Number of units (files/documents) processed. | Drastic changes may signal misconfiguration or data loss. |
| `activeViolations` | Count of active rule violations at sync end. | **Zero is healthy.** Persistent non-zero degrades stability — investigate. |
| `lastSyncDurationMs` | Sync duration in milliseconds. | Abnormal spikes indicate performance bottlenecks or resource contention. |
| `llm.provider` | LLM provider used during sync (e.g., "mock"). | Affects which AI service is invoked for sync reasoning. |
| `llm.model` | Model used (e.g., "deepseek-chat"). | Must match available model in config; mismatch causes silent failures. |
| `llm.providerSource` / `llm.modelSource` | Source of the provider/model setting ("project-config" or "global-config"). | Changing the provider or model in this snapshot without updating project/global config can break automated tools. |

## Stability and Risks

- **Snapshot nature**: This file is a cached view. Do **not** use it as the primary source for decisions that require authoritative state — always refer to `.spine/cache.db`.
- **Staleness risk**: If the snapshot becomes outdated (e.g., after a long sync gap), monitoring dashboards and alerting rules may rely on stale information, leading to incorrect health conclusions.
- **Governance drift**: A high or rising `activeViolations` count signals governance drift that can cascade into data integrity issues.
- **LLM configuration**: The embedded LLM provider/model settings here must be consistent with the actual project or global configuration. Inconsistencies cause silent failures during sync-related AI calls.
- **Healthy system pattern**: Consistent syncs with low `activeViolations` and reasonable `lastSyncDurationMs` = healthy mirror. Investigate any persistent deviations.

## Invariants to Enforce

- `activeViolations` must be a non-negative integer. Zero means clean state.
- `lastSyncMode` must be either `"full"` or `"incremental"` — no other values.
- The file is a cache; never use it as the primary state source.

---