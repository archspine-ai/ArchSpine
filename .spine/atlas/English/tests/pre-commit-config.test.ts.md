<!-- spine-content-hash:2058972c911ca2a4a03e2b9f91ac332895608830ebad6cc56fd08247b2bc7fa0 -->
# ArchSpine Pre-Commit Hook Configuration Test Suite

## Role
This file is a Vitest unit test suite that validates ArchSpine's pre-commit hook configuration and resolution logic.

## Key Responsibilities
- Tests `Config.getPreCommitResolution` to verify correct resolution values and their sources.
- Validates that `Config.getHookSyncMode` returns the expected synchronization mode.
- Creates isolated temporary directories for each test to prevent side effects.
- Cleans up all test artifacts after each test to maintain strict test isolation.

## Notable Invariants & Negative Scope
- **Must** be a test file: it imports Vitest and uses `describe`/`it` blocks.
- **Must** isolate the test environment using temporary directories.
- **Must** clean up test artifacts after each test.
- **Does not** contain production runtime logic for pre-commit hooks.
- **Does not** directly modify git hooks outside of test isolation.
- **Does not** perform configuration schema validation beyond the unit test scope.

## Exported / Externally Visible Behavior
This file exports no production surface; it is purely a test suite. Its externally visible behavior is limited to passing or failing Vitest assertions that confirm the correctness of pre-commit configuration resolution and hook sync mode under various environment and configuration states.