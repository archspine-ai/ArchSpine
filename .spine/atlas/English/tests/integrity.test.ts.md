<!-- spine-content-hash:07a5d1cd45cc69eb91d4cab27cbd10122262f6c12803abd171715b0d657a7ea4 -->
# SpineDB Batch Commit Test Suite

This Vitest test suite provides automated regression coverage for SpineDB batch commit operations and transaction integrity. It ensures that batch commits behave atomically and recover correctly from errors.

## Key Responsibilities

- **SQLite Mocking**: Mocks the SQLite `prepare` method to intercept and validate batch commit SQL statements.
- **Rollback Validation**: Verifies that batch commits roll back entirely when constraint violations occur.
- **Test Environment Management**: Creates temporary test directories before each test and cleans them up afterward.
- **Atomicity Assertions**: Confirms that batch operations maintain atomicity and that error handling works as expected.

## Out of Scope

- Unit testing of individual SpineDB methods outside the batch commit context.
- Integration testing with real database instances.
- Performance or load testing of batch operations.

## Notable Invariants

- Test files must end with `.test.ts` or `.spec.ts` (rule: `test-file-suffix`).

## Change Intent

The architectural intent is to provide automated regression coverage for SpineDB batch commit atomicity and error recovery. This file finalizes v1.0.0 release closure; no specific changes to this test file were detected in the recent change set.

## Public Surface

This test suite does not export any public API surface.