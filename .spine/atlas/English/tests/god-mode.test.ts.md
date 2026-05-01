<!-- spine-content-hash:f88558db01bc5a9cb25a5fa79ebbe0de34c9b9ae4fa4c1d72fe4b096c88efba8 -->
# ArchSpine God Mode Integration Test Suite

## Role
Vitest integration test suite for the God mode dossier feature in ArchSpine.

## Key Responsibilities
- Sets up a temporary test directory with mock project files and configuration to simulate a real ArchSpine project.
- Executes CLI commands via `child_process.execSync` to test the God mode command.
- Verifies God mode command execution and output behavior using a mocked LLM provider (MockClient).
- Cleans up the temporary test directory after each test run.

## Notable Invariants & Negative Scope
- **Invariant:** Test files must end with `.test.ts` or `.spec.ts` (Rule: test-file-suffix).
- **Out of Scope:**
  - Unit testing of individual God mode engine functions.
  - Testing of production LLM provider integrations.
  - Testing of other CLI commands outside the God mode feature.

## Exported / Externally Visible Behavior
This file does not export any public API surface. It is a test suite that runs as part of the Vitest framework and is not intended for external consumption.