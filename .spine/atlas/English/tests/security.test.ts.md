<!-- spine-content-hash:543559c6fed6032c3dd1b3fd0a8d4003b7fb2d33dbe5cf38f99fb36984a16772 -->
# ArchSpine CLI Security Integration Tests

This file is a Vitest integration test suite focusing on the security and prompt-flow behavior of the ArchSpine CLI. It verifies that the CLI correctly handles `dry-run` mode and confirm prompts to prevent accidental destructive actions.

## Key Responsibilities

- Creates isolated temporary directories for each test scenario.
- Writes a wrapper script to override the `prompts` module, simulating user input for confirm and choice prompts.
- Executes the built ArchSpine CLI binary via `execFileSync` with specified arguments inside the temporary directory.
- Cleans up all created temporary directories after each test using `afterEach` hooks.
- Verifies that the `dry-run` flag prevents the confirm prompt from being shown.
- Validates that confirm prompt answers are correctly respected when `dry-run` is not enabled.
- Tests that security-sensitive CLI workflows behave as expected under controlled prompt injection.

## Notable Invariants

- All test files must end with `.test.ts` or `.spec.ts` (architectural rule `test-file-suffix`).

## Negative Scope (Out of Scope)

- Unit testing of individual modules or functions.
- End-to-end tests that involve a real LLM or external network calls.
- Performance or load testing of the CLI.
- Testing of CLI features unrelated to prompt security or `dry-run` behavior.

## Change Intent

The architectural intent is to provide security-focused integration tests that validate the CLI's prompt orchestration, particularly the correct handling of `dry-run` and confirm prompts. A recent change moved the `dry-run` check before the confirm prompt in `FixTask` and added corresponding security tests to ensure the fix is properly validated.

## Exported or Visible Behavior

This file does not export any public API; it is solely a test suite executed by Vitest. Its externally visible behavior is the execution of integration tests that assert the CLI’s response to user prompt inputs and the `dry-run` flag.