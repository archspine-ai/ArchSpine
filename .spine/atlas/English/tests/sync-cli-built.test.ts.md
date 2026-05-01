<!-- spine-content-hash:f5ead8145ecf0b78e21c957c264504996c70d04c1db6476809f8019b39009a0a -->
# ArchSpine CLI Sync Integration Test

## Role
This file is a Vitest integration test for the ArchSpine CLI `sync` command. It validates the behavior of the built executable in an isolated environment.

## Key Responsibilities
- Creates temporary repository fixtures to ensure each test runs in a clean, isolated directory.
- Executes the pre-built ArchSpine CLI binary from the `dist` directory to test the `sync` command.
- Validates that the CLI produces correct output and exits with the expected code.
- Cleans up all temporary directories after each test to prevent side effects.

## Notable Invariants
- The test **must** use the built CLI binary located in the `dist` directory — it does not run against source code or a development server.
- Every test **must** execute inside a unique temporary directory to guarantee isolation.
- The file **must** be a Vitest test file with the `.test.ts` suffix.

## Negative Scope (Out of Scope)
- This test does **not** perform unit testing of individual internal functions.
- It does **not** mock the CLI binary or any external dependencies.
- It does **not** test the CLI build or development process itself.
- It does **not** provide any production runtime functionality.

## Exported / External Behavior
This file exports no public API surface. It is purely a test suite that runs as part of the Vitest runner. Its only external effect is to validate the CLI binary's behavior and report pass/fail results.