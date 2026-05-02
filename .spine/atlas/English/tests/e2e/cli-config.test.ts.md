<!-- spine-content-hash:b84344199f6b16f75f24d338e8d7d157e2918ce370599d34797c5864d2513181 -->
# ArchSpine CLI End-to-End Test Suite

This file provides the automated end-to-end test suite for ArchSpine's CLI commands, using **vitest** and **child_process** to perform integration testing. It is responsible for validating the correctness of CLI output, error handling, and command behavior in an isolated environment.

## Key Responsibilities

- **Isolated Test Execution:** Creates unique temporary directories via `fs.mkdtempSync` and `os.tmpdir` for each test run.
- **CLI Runner Helper:** Defines a `runCli` function that spawns the built CLI binary with given arguments, capturing stdout, stderr, and exit code.
- **Prompt Simulation:** Writes wrapper scripts to enable non‑interactive testing of prompts.
- **Comprehensive Coverage:** Runs 37 test cases across 7 files covering CLI output, error handling, and command behavior.
- **Cleanup:** Uses `afterEach` to remove temporary directories after each test.
- **Setup:** Uses `beforeAll` to prepare the test environment, including building wrapper scripts.

## Notable Invariants & Scope

- **Invariants:** All test files must end with `.test.ts` or `.spec.ts`; test processes are spawned synchronously to ensure deterministic execution.
- **Out of Scope:** This suite does **not** cover unit tests of internal CLI logic, GUI testing, or network‑dependent external services.
- **Public Surface:** There are no exported symbols; the entire suite is executed by the test runner.

## Change Intent

- **Architectural Intent:** To provide comprehensive automated E2E coverage for CLI commands, catching regressions before release.
- **Recent Change:** Added E2E test suite for CLI commands with 37 tests across 7 files (commit `171f7b4`).