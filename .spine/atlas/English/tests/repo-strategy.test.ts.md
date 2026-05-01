<!-- spine-content-hash:e2afd34df32bd612cfc12a4e24f05495481b0d6e54ef001a45c6440e3919053d -->
# ArchSpine Repository Strategy Test Suite

## Role
Vitest test suite validating repository strategy configuration and drift detection.

## Key Responsibilities
- Sets up temporary directories for isolated test execution of repository strategy checks.
- Mocks console warnings and logs to capture and assert on strategy violation messages.
- Validates that `.gitignore` and `.gitattributes` are correctly updated with ArchSpine managed sections.
- Tests the `runRepoCheck` function's behavior when repository configuration drifts from expected state.

## Notable Invariants & Negative Scope
- **Invariants:** Test file suffix must be `.test.ts` or `.spec.ts` (per rule `test-file-suffix`). Uses Vitest testing framework with `describe`/`it`/`expect` patterns. Relies on mocked console methods to avoid polluting test output.
- **Out of Scope:** Direct CLI command execution or user interaction. Permanent file system modifications outside temporary test directories. Integration with external services or network calls.

## Exported Behavior
No public surface is exported; this is a test-only module.