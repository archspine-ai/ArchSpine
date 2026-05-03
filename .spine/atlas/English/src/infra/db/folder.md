# ArchSpine Infrastructure – SQLite Database Layer (`src/infra/db`)

This directory provides the core persistence foundation for the ArchSpine mirror system. It manages the entire lifecycle of the SQLite runtime database inside the `.spine` directory, from schema initialization and WAL journal mode to atomic batch commits, error mapping, and a data access layer. The layer decouples data producers (indexers, auditors) from consumers (CLI, services) through stable TypeScript interfaces.

## Notable Components and Grouping

- **Runtime Lifecycle** (`runtime.ts`, `wal-recovery.ts`, `schema.ts`) – Responsible for starting up and maintaining the database connection. `runtime.ts` ensures the `.spine` directory exists, recovers stale WAL files via `wal-recovery.ts`, and instantiates a `better-sqlite3` instance. `schema.ts` initializes the `files` table and enables Write‑Ahead Logging (`journal_mode = WAL`).

- **Atomic Batch Operations** (`batch.ts`) – Provides atomic batch insertion/update of file metadata records (`FileCommitRecord`). Each commit runs inside a transaction and performs semantic drift detection by comparing incoming role/responsibility values against the current state. Detected drifts are recorded immediately via the drift repository.

- **Error Handling** (`errors.ts`) – Maps unknown runtime database errors (open or init stage) to standardized `ArchSpineError` instances, detecting read‑only database conditions and assigning appropriate error codes (`RuntimeDbOpenFailed`, `RuntimeDbInitFailed`, `RuntimeDbReadonly`).

- **Data Access Layer** (`repositories/` folder) – Contains SQLite‑based DAO objects for CRUD operations on file metadata, semantic drift events, exported symbol caches, token usage metrics, and architectural violation records. This is the primary interface for all persistent storage logic.

- **Type Definitions** (`types.ts`) – Defines stable TypeScript interfaces: `FileRecord`, `FileStatusRecord`, `FileCommitRecord`, `DriftEvent`, `UsageSummaryRow`, `UsageTotals`, `ViolationRecord`, and `GlobalStatus`. These contracts unify data shapes across indexing, audit, and status reporting.

## Key Implementation Areas

- **Stale WAL Recovery** – The `wal-recovery.ts` module uses a byte threshold (512 KB) to detect stale WAL/SHM files left by a killed process and removes them to prevent empty reconciliations and LLM rate limit overload.
- **Semantic Drift Detection** – Built directly into the batch commit function (`batch.ts`), comparing old and new role/responsibility metadata per file.
- **Schema Initialization** – Only creates the core `files` table; additional tables are managed by the repositories layer.
- **Error Isolation** – Every database open/init failure is wrapped into a meaningful `ArchSpineError` so upper layers can respond uniformly.