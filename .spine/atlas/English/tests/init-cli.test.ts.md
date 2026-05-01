<!-- spine-content-hash:b1a7ff01ef0f2f7478370e46cd9bb447e72f1a4a56340ec06f446f19d06e365e -->
# ArchSpine – CLI Init Test Utilities

## Role
Vitest test utility module for CLI initialization integration tests.

## Key Responsibilities
- Provides temporary directory creation and cleanup for isolated test environments.
- Generates wrapper scripts that inject mocked user prompts for CLI testing.
- Sets up test fixtures and executes the built CLI binary with controlled inputs.

## Notable Invariants & Negative Scope
- Temporary directories are created under the OS temp directory with a consistent prefix.
- Wrapper scripts are written to disk and executed via child_process.
- The built CLI binary path is resolved relative to the repository root.
- **Out of scope:** Does not contain actual test cases or assertions. Does not implement CLI logic or prompt handling. Does not manage persistent state or configuration.

## Public Surface
- `makeTempDir(): string` – Creates and returns a path to a new temporary directory.
- `writeWrapperScript(wrapperPath: string, cliArgs: string[], injectedAnswers: unknown[]): void` – Writes a wrapper script to disk that runs the CLI with given arguments and injected answers.