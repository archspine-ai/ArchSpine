<!-- spine-content-hash:0bbe6a2a1bab776da14434fc1739455bfed5e390b7b035d0a8e875e543fb14f2 -->
# Unit Test Suite for `getGlobalArchSpineDir`

This Vitest suite validates the resolution of the platform-specific global ArchSpine directory path.

## Responsibilities
- Tests non-Windows platforms (Linux/macOS) with `ARCHSPINE_DIR` environment variable override.
- Tests Windows platform with environment variable override.
- Tests default fallback on non-Windows when no environment variable is set (uses `path.join(os.homedir(), '.archspine')`).
- Restores `process.platform` and `process.env` after each test via `afterEach` to prevent cross-test contamination.
- Indirectly validates the internal logic of the LLM infrastructure module for global directory resolution.

## Out of Scope
- Integration or end-to-end tests of the ArchSpine system.
- Testing of other functions or modules beyond `getGlobalArchSpineDir`.
- Performance or stress testing.

## Invariants
- After each test case, `process.platform` and `process.env` must be restored to their original values.

## Public Surface
- Exported function: `getGlobalArchSpineDir`
- Test framework utilities: `describe`, `afterEach`, `it`, `expect`

## Change Intent
- Architectural intent: Verify correctness of global directory resolution across platforms and environment configurations.
- Recent change: Added Windows platform tests and coverage for fix CHK-02 / FIX-02, as per commit message "test: add Windows platform tests, CHK-02, FIX-02, and real LLM E2E tests".