<!-- spine-content-hash:a8eb8c3b93becb32bcaf2cc4383938435bd3149b30672f2305827d99592d4e1f -->
# ArchSpine CLI End-to-End Test Suite

**Role:** This file contains the end-to-end (E2E) test suite for the ArchSpine CLI, ensuring correct behavior within a real (temporary) Git repository environment.

**Key Responsibilities:**
- Creates a temporary directory with an initialized Git repository for each test.
- Executes the built CLI binary via `child_process` (`spawnSync`, `execFileSync`) with various arguments.
- Asserts expected CLI outputs, exit codes, and side effects (e.g., file creation).
- Provides test lifecycle utilities (e.g., `afterEach` cleanup) using Vitest hooks.
- Interacts with the CLI's `prompts` module by wrapping or intercepting it to simulate user input.

**Out of Scope (Negative Responsibilities):**
- Unit tests for internal functions or modules.
- Integration tests requiring databases or external services.
- Direct testing of the `prompts` module itself (it is mocked/wrapped).
- Performance or load testing of the CLI.

**Notable Invariants & Assumptions:**
- Requires a Node.js runtime to run Vitest and execute the CLI.
- Assumes the CLI has been built beforehand (`dist/cli/index.js` must exist).
- Relies on the `prompts` npm module being installed at `node_modules/prompts/index.js`.
- Requires Git to be installed and available on the system PATH.
- Uses temporary directories under `os.tmpdir()` and cleans up after each test.
- Test files must be named with `.test.ts` or `.spec.ts` suffix to be discovered by the test runner.

**Change Intent & Scope:**
- The suite was introduced as part of a recent change adding 37 test cases across 7 files, focusing on validating CLI command execution and output. It is intended to provide robust, isolated validation before releases. There is no exported public surface; the file is purely a test harness.

**Drift Status:** No drift detected.