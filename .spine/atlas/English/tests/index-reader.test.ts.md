<!-- spine-content-hash:7e64ec68391e2066b211fead471b09382d91fb4de7d4ad4b82dd52c26b3e825c -->
# ArchSpine Index Reader Schema Enforcement Test Suite

## Role
This is a Vitest test suite that validates the index reader's ability to enforce schema versioning and handle compatibility scenarios correctly.

## Key Responsibilities
- Creates isolated temporary directories for each test case to prevent side effects between tests.
- Automatically cleans up temporary directories after each test to maintain test isolation.
- Writes test JSON files with specific schema versions to simulate legacy or unsupported index documents.
- Invokes the `readIndexDocument` function from the index reader to test its behavior under various schema conditions.
- Asserts that unsupported file units are rejected with a status indicating a rebuild is required.
- Verifies both the schema version present in the test data and the expected schema version in the response.

## Notable Invariants & Negative Scope
- Test files must end with `.test.ts` or `.spec.ts` (rule: test-file-suffix).
- This suite does **not** test index reader performance or concurrency.
- It does **not** test the reader with valid or supported schema versions.
- It does **not** test error handling for malformed JSON or missing files.
- It does **not** perform integration testing with actual file system persistence beyond temporary directories.

## Exported / Externally Visible Behavior
The suite exports no public surface; it is purely a test harness that validates the index reader's schema rejection logic. The key externally observable behavior is that unsupported schema versions cause the reader to return a rebuild-required status, and the response includes both the encountered schema version and the expected schema version.