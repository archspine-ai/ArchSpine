<!-- spine-content-hash:6d3d279e8e54b6be6ca8f4b8a7301f5959bd8a5b326968230ecd1abc9f8a8341 -->
# ArchSpine SyncService — Core Orchestration

The `SyncService` is the central coordinator of the ArchSpine mirror system's multi-stage synchronization pipeline. It ensures that all stages—reconciliation, scanning/cleanup, AST extraction, summarization, state commit, and post-commit derivation—execute in the correct sequential order, while enforcing boundary protection and supporting resumable operations.

## Key Responsibilities

- **Pipeline orchestration**: Drives the sequential execution of all sync tasks, from reconciliation through post-commit derivation.
- **Configuration validation**: Validates runtime settings via `ServiceOptions` and manages checkpoint state to allow resumable syncs.
- **Boundary protection**: Detects and warns about protected output mutations using the spine-gate system before committing state.
- **View integration**: Works with the view service registry to produce architectural diagrams and other derived outputs.
- **Statistics tracking**: Maintains counts of processed and skipped items, and provides formatted byte-size reporting.

## Important Invariants

- The service must be instantiated with valid `ServiceOptions`.
- Pipeline tasks must always execute in the defined sequential order.
- Protected output mutations must be detected and warned before any state commit.
- Before starting a sync, the execution checkpoint must be consulted to identify resume candidate files.

## Out of Scope

- Direct file system operations beyond checkpoint and manifest hash calculation.
- Language-specific AST parsing (delegated to `LangRegistry` and `ASTExtractionTask`).
- User interface or CLI command handling.
- Database or persistent storage management.

## Public Surface

- `SyncService` class (constructor, `execute` method)
- `SyncStats` interface
- `SyncExecutionOptions` interface