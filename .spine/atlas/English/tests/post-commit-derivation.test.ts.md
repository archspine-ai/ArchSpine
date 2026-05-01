<!-- spine-content-hash:6ce11b2c806693e2b6d7f7d39dcd26ba65a57b65b9f9894ea9316e6b11e5845c -->
# ArchSpine – PostCommitDerivationTask Integration Test Suite

## Role
This file is a Vitest integration test suite for the `PostCommitDerivationTask` orchestration pipeline. It validates that the top-level task correctly coordinates its subtasks in the expected sequence.

## Key Responsibilities
- Verifies that `PostCommitDerivationTask.execute` invokes `ReverseIndexingTask`, `AggregationTask`, and `ViewDerivationTask` in the correct sequential order.
- Mocks the `execute` methods of the dependent tasks to isolate the orchestration logic from their actual implementations.
- Uses `createTaskTelemetryState` to supply telemetry context during task execution.
- Cleans up all mocks after each test via `afterEach` to guarantee test isolation and prevent cross-test contamination.

## Notable Invariants & Negative Scope
- **Invariants:**  
  - Test files must use the `.test.ts` or `.spec.ts` suffix (rule: `test-file-suffix`).  
  - All mocks are restored after each test to maintain a clean state.
- **Out of Scope:**  
  - Unit testing of individual task implementations (`ReverseIndexingTask`, `AggregationTask`, `ViewDerivationTask`).  
  - Integration testing with real file systems or databases.  
  - Testing error handling or edge cases within the post-commit derivation pipeline.

## Exported / Externally Visible Behavior
This file does not export any public API; it is a test suite executed by Vitest. Its primary external behavior is to assert that the orchestration pipeline runs subtasks in the correct order under mocked conditions.