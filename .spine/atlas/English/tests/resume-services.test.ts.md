<!-- spine-content-hash:765402c623a8847c2a09cf59d6c4b07fbe1ed9f0cda8d3dc299fbfa8f5e5ad58 -->
# ArchSpine Resume-Aware Aggregation Service Test Suite

## Role
This is a Vitest unit test suite that validates the resume-aware aggregation service behavior within the ArchSpine system. It ensures that interrupted synchronization tasks can be correctly resumed across service boundaries.

## Key Responsibilities
- Mocks `SyncService`, `CheckService`, and `FixService` to isolate resume logic testing from production dependencies.
- Verifies that interrupted sync candidates are correctly fed back into scan and forced-sync paths.
- Uses Vitest's `vi` mocking utilities (`vi.mock`, `vi.resetModules`) to reset state between test cases.
- Hardens scan resume validation and fallback path logic, reflecting recent changes to improve robustness.

## Notable Invariants & Negative Scope
- **Invariants:** Follows Vitest testing framework conventions strictly. All tests isolate unit behavior using mocking, with no reliance on real service implementations.
- **Out of Scope:** This suite does not test production service implementation, direct HTTP or database interactions, or UI/CLI rendering. It focuses exclusively on resume logic for sync, scan, and fix operations.

## Exported Behavior
The test suite does not export any public surface for external consumption. Its primary value is internal validation of resume-aware aggregation logic, ensuring that state is correctly persisted and resumed when synchronization tasks are interrupted.