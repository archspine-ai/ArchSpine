<!-- spine-content-hash:bfff1ff8db0973214b146dd011d918a8dad479a69114aaa0d636a0fdd894bce6 -->
# ArchSpine Config System – Unit Test Suite

This Vitest test suite validates the configuration loading, language settings, hook synchronization mode, and warning emissions for the ArchSpine config system.

## Responsibilities

- Sets up isolated temporary directories with a `.spine` subdirectory for each test case to avoid side effects.
- Validates language configuration loading and default fallback behavior.
- Tests hook synchronization mode configuration and default values.
- Verifies warning emission for missing or invalid configuration files via `console.warn` spy.

## Out of Scope

- Integration tests with real file systems beyond temporary directories.
- Performance or stress testing of configuration loading.
- Validation of other configuration sections not related to languages or hook sync mode.

## Invariants

- Each test case creates a fresh temporary directory to prevent state leakage.
- Test cleanup restores all mocks via `vi.restoreAllMocks()`.
- Configuration files are written in JSON format with `CURRENT_CONFIG_SCHEMA_VERSION`.

## Change Intent

The architectural intent is to provide deterministic, isolated unit tests for the configuration subsystem, ensuring language and hook sync defaults are correct and warnings are emitted for malformed configs. The recent change intent is marked as "gogogo" — likely a bulk commit with no specific config validation changes indicated beyond general progress.

## Public Surface

No public surface is exported from this test suite.