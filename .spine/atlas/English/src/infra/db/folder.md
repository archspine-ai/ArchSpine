This directory is the infrastructure layer that centrally manages the SQLite runtime database within the ArchSpine system. Its primary responsibility is to oversee the full lifecycle of the database, starting with file creation, Write-Ahead Log (WAL) recovery, schema initialization, and reliable shutdown. It also provides the atomic batch commit mechanism for file metadata, incorporates semantic drift detection that compares incoming commits against current state, maps runtime database errors to standardized error codes, and supplies stable TypeScript type definitions that decouple data producers (indexers, auditors) from consumers (CLI, services).

The notable modules are grouped into several implementation areas:

- **Database lifecycle management** – `runtime.ts` (facade that ensures the `.spine` data directory exists, recovers stale WAL files before opening, and instantiates a `better-sqlite3` instance), `wal-recovery.ts` (detects stale WAL/SHM files using a 512KB threshold and removes them to prevent empty reconciliations), and `schema.ts` (initializes the `files` table and enables WAL journal mode via the `journal_mode=WAL` pragma).

- **Atomic batch commits and drift detection** – `batch.ts` handles atomic insertion/update of `FileCommitRecord` objects within a transaction, compares previous role and responsibilities to detect semantic drift, and records drift events via the drift repository.

- **Error mapping** – `errors.ts` maps unknown runtime database errors (from open/init stages) to standard `ArchSpineError` instances, detecting read-only conditions and assigning appropriate error codes (`RuntimeDbOpenFailed`, `RuntimeDbInitFailed`, `RuntimeDbReadonly`).

- **Data access layer** – The `repositories` folder provides CRUD operations for drift events, file metadata, symbols, token usage, and violations, managing persistence and retrieval of all tracked data.

- **Shared type contracts** – `types.ts` defines interfaces for `FileRecord`, `FileStatusRecord`, `FileCommitRecord`, `DriftEvent`, `UsageSummaryRow`, `UsageTotals`, `ViolationRecord`, and `GlobalStatus`, ensuring consistent data shapes across the system.

These modules together form the backbone of database interaction, with the most critical implementation areas being WAL recovery (to prevent corruption and rate-limit overload), atomic batch commits (to maintain data integrity and detect drift), and the standardized error codes (to enable robust error handling in higher layers).