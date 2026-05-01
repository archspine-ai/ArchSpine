<!-- spine-content-hash:1eff3b0cc540448d668d312d5aa8ef26de27c976259f35c6e37293a9980eafd1 -->
# ArchSpine – Runtime Database Facade

## Role
Infrastructure facade module providing low-level runtime SQLite database lifecycle management, including filesystem preparation, stale WAL file detection/recovery, and error handling.

## Key Responsibilities
- Manages the creation and opening of a SQLite database file within the project's `.spine` directory.
- Handles filesystem operations to ensure the database directory exists.
- Detects and recovers stale WAL (Write-Ahead Logging) files to prevent data loss or corruption.
- Wraps database instantiation with error mapping for consistent runtime error handling.

## Notable Invariants
- Exposes a stable facade for database lifecycle operations.
- Relies on internal infra modules (errors, wal-recovery) for specific concerns.
- Does not absorb service, task, or engine orchestration responsibilities.

## Negative Scope (Out of Scope)
- High-level business logic or application orchestration.
- Database schema definition or migration management.
- Query execution or transaction handling beyond initial connection.

## Most Important Exported Behavior
- **`RuntimeDatabase` interface** – Defines the contract for the runtime database instance.
- **`openRuntimeDatabase` function** – Primary entry point for opening or creating the database, handling all lifecycle setup and recovery.