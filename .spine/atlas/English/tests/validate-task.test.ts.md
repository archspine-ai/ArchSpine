<!-- spine-content-hash:8cd208a9bf639b63ae364b3c7d90f92eae8543475933bb5419e7dc21ed7d3119 -->
# ValidationTask Unit Test Suite

## Role
Vitest unit test suite for the `ValidationTask` class, validating its file selection and summary generation logic.

## Key Responsibilities
- Creates isolated temporary directories for each test case using `fs.mkdtempSync`.
- Sets up mock file structures and invokes `ValidationTask.execute` to test file filtering and summary output.
- Verifies that the task correctly filters files based on selection criteria and returns expected summary statistics.
- Cleans up temporary directories after each test using `fs.rmSync`.

## Notable Invariants & Negative Scope
- **Invariant:** Test file must end with `.test.ts` or `.spec.ts` suffix (rule: `test-file-suffix`).
- **Out of scope:** Integration or end-to-end testing of the full validation pipeline; testing of external file system side effects beyond the temporary directory; performance or load testing of the `ValidationTask`.

## Public Surface (Exported/Externally Visible Behavior)
- `describe('ValidationTask', ...)`
- `beforeEach` hook
- `afterEach` hook
- `it('should return summary with correct counts', ...)`
- `it('should filter files based on selection criteria', ...)`

## Change Intent
- **Architectural intent:** Provide a focused, isolated unit test suite for the `ValidationTask` to ensure correctness of file selection and summary generation in a controlled temporary environment.
- **Recent change:** Initial commit for open source release (v1.0.0) — this test file was included as part of the initial codebase.