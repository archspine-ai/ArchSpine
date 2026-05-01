<!-- spine-content-hash:2d2729df844ddcb000db128ec8e5b674851a01a7fe1db42054e2e856f4982a61 -->
# ArchSpine Aggregator Resume Test Suite

## Role
Vitest test suite for verifying the Aggregator engine's resume functionality and directory aggregation needs.

## Key Responsibilities
- Sets up and tears down temporary directories for isolated test runs.
- Mocks and restores Vitest mocks to ensure test isolation.
- Tests the Aggregator's `needsDirectoryAggregation` method under various file system states.
- Validates that aggregation tasks can correctly identify directories requiring processing.

## Notable Invariants & Negative Scope
- Test file must end with `.test.ts` or `.spec.ts`.
- Temporary directories must be cleaned up after each test via `afterEach` hook.
- Mocks must be restored after each test to prevent cross-test contamination.
- **Out of scope:** Integration tests with external databases or services; performance or load testing; unit tests for utility functions outside the Aggregator.

## Most Important Exported Behavior
- `describe('aggregation resume support')` — main test suite block.
- `afterEach(() => { vi.restoreAllMocks(); ... })` — ensures mock cleanup.
- `it('should detect directories needing aggregation')` — core positive test.
- `it('should handle empty directories')` — edge case validation.

## Architectural Intent
Ensure the Aggregator engine correctly identifies directories needing aggregation, supporting resume capabilities in the ArchSpine mirror system.