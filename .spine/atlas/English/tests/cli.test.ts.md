<!-- spine-content-hash:94c4303239e7a22fed06d906d126a87c9fee01aa5541211c33da69d31a3ff205 -->
# ArchSpine E2E Integration Test Suite

## Role
Vitest end-to-end integration test suite for ArchSpine's CLI command workflow and service orchestration, validating real command-line behavior and engine interactions.

## Key Responsibilities
- Sets up isolated temporary directories for each test case to avoid side effects.
- Mocks the LLM client via a custom `E2EMockClient` to simulate both successful and failing scenarios for testing robustness.
- Executes ArchSpine CLI commands via `child_process.execSync` to validate real command-line behavior.
- Verifies the interaction between core engines (check, fix, usage) and the synchronization workflow.

## Notable Invariants & Negative Scope
- **Invariant:** Test files must end with `.test.ts` or `.spec.ts` (rule: test-file-suffix).
- **Out of Scope:**
  - Unit testing of individual functions or modules in isolation.
  - Testing of non-CLI interfaces or API endpoints.
  - Performance or load testing of the system.

## Most Important Exported / Externally Visible Behavior
- `E2EMockClient` class (implements `LLMClient`) — used to simulate LLM responses in tests.
- Test cases for CLI commands and engine interactions — validate the full workflow from command execution to engine orchestration.

## Architectural Intent
Provide a comprehensive end-to-end test suite that validates the full CLI workflow, ensuring that the check, fix, usage, and sync engines work correctly together in a real command-line environment.

## Recent Change Intent
Resolve lint errors and finalize pipeline fixes before v1.0, ensuring the test suite is clean and reliable.