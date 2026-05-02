<!-- spine-content-hash:14a72df645b850b0c8ef74afae002293f28ccddead9ede86b712851e02247f22 -->
# ArchSpine CLI E2E Test Suite

**Role:** Vitest end-to-end (E2E) test suite for the ArchSpine CLI commands.

**Key Responsibilities:**

- Tests CLI commands by spawning the built CLI in a temporary project directory.
- Verifies correct stdout, stderr, exit codes, and file creation for CLI commands.
- Uses `beforeAll` to initialize a temporary git repository and set up project scaffolding.
- Uses `afterEach` to clean up temporary directories to maintain test isolation.
- Validates JSON output of CLI inventory and generation commands.
- Ensures CLI correctly handles arguments like project initialization, validation, and file generation.

**Out of Scope:**

- Unit tests for internal ArchSpine modules or services.
- Integration tests with external dependencies like databases or containers.
- Performance, security, or snapshot regression testing for CLI output.
- Tests requiring user interaction or mock prompts.

**Notable Invariants:**

- CLI must be built to `dist/cli/index.js` before tests can run.
- Test file must follow naming convention `.test.ts` or `.spec.ts` (architectural rule test-file-suffix).
- Tests rely on `vitest` as the test runner.

**Change Intent:**

- Architectural intent: Establish a comprehensive end-to-end test suite for the ArchSpine CLI to validate command output, error handling, and file generation under realistic project conditions.
- Recent change: Added 37 E2E tests across 7 files covering CLI commands (initialization, inventory, generation) with temporary project isolation.

**Exported Surface:** None (tests are internal to the test runner; no public API is exported).