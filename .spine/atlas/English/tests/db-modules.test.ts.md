<!-- spine-content-hash:4ae04cb47d82695c028b7e8f77f468ee31d575034f957730c2f75d7fe02b7cc9 -->
# ArchSpine Database Integration Test Suite

This Vitest integration test suite validates the runtime database schema initialization and batch commit operations for the ArchSpine mirror system.

## Role

The test suite ensures that the database layer functions correctly by verifying schema creation and data persistence through integration tests.

## Key Responsibilities

- **Schema Validation**: Confirms that `initializeRuntimeSchema` creates all required database tables: `files`, `symbols`, `usage_logs`, `violations`, and `drift_events`.
- **Batch Commit Testing**: Verifies that the `commitBatch` function correctly persists `FileCommitRecord` arrays to the database.
- **Table Structure Assertions**: Uses `PRAGMA table_info` queries to validate proper table structure and column definitions.
- **Integration Coverage**: Provides test coverage for database repository layer integration points including `getDriftHistory`, `getFileDocs`, and `getTrackedFiles`.

## Important Invariants

- Must import `vitest` for test framework functions.
- Must import database schema and batch functions from `../src/infra/db/`.
- Must use an in-memory SQLite database for isolated testing.
- Test file suffix must be `.test.ts` or `.spec.ts` per project rules.

## Out of Scope

- Unit testing of individual repository functions in isolation.
- Testing of non-database components like scanners or MCP resources.
- Performance or load testing of database operations.

## Architectural Intent

The primary goal is to ensure database layer integrity through integration tests that cover schema creation and data persistence, supporting the v1.0.0 release closure with stable and reliable test coverage.