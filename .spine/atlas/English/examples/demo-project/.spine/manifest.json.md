<!-- spine-content-hash:12c8b567f15a43d187207ac6c3e019507bdfb4a50548331f7d1f7116b6edfc1a -->
# ArchSpine Health & Sync Snapshot

## Role
Provides a lightweight, read-only health-check view of the ArchSpine mirror system's synchronization state and constraint status.

## Key Responsibilities
- Tracks the last synchronization timestamp and mode (full or incremental).
- Reports whether the reverse index is complete and how many units were indexed.
- Exposes the LLM provider and model used during the last sync.
- Reports the number of active constraint violations and the duration of the last sync.

## Notable Invariants
- `activeViolations` must be non-negative.
- `lastSyncDurationMs` must be non-negative.
- `indexedUnitCount` must be non-negative.
- `reverseIndexComplete` must be a boolean.

## Negative Scope
This file does not control system behavior directly. It is a derived, read-only snapshot. Core state is stored in `.spine/cache.db`.

## Exported / Externally Visible Behavior
The file exposes a flat set of fields under `sync` and `health` namespaces. All values are informational and intended for monitoring, alerting, and debugging. No functions or classes are exported.

## Parameter Definitions
- `schemaVersion`: Version of the schema this file conforms to.
- `generatorVersion`: Version of the ArchSpine generator that produced this file.
- `project`: Name of the project this configuration belongs to.
- `sync.lastSyncAt`: ISO 8601 timestamp of the most recent synchronization.
- `sync.lastSyncMode`: Type of the last sync operation (e.g., full or incremental).
- `sync.reverseIndexComplete`: Boolean indicating whether the reverse index was fully built during the last sync.
- `sync.indexedUnitCount`: Number of units indexed during the last sync.
- `sync.llm.provider`: LLM provider used during the last sync (e.g., mock, openai).
- `sync.llm.providerSource`: Source of the LLM provider configuration (e.g., project-config, global-config).
- `sync.llm.model`: LLM model used during the last sync (e.g., deepseek-chat).
- `sync.llm.modelSource`: Source of the LLM model configuration (e.g., global-config).
- `health.activeViolations`: Number of currently active constraint violations. Zero indicates a healthy state.
- `health.lastSyncDurationMs`: Duration of the last sync operation in milliseconds.
- `_note`: Informational note indicating that the core state is stored in `.spine/cache.db`.

## Stability and Risks
This file is a derived, read-only snapshot. It does not control system behavior directly. However, if the values become stale or inconsistent with the cache database, monitoring and alerting systems may report false positives or miss real issues. A non-zero `activeViolations` count indicates constraint breaches that could affect downstream operations. A very high `lastSyncDurationMs` may signal performance degradation or resource contention. The LLM provider/model fields are informational; mismatches with actual runtime configuration could cause confusion during debugging.