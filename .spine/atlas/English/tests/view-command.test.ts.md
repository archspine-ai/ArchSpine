<!-- spine-content-hash:80034e453f2b496de73c16c5bd005ce55ca7f517a52ae4b7fd91bd27410f5b4c -->
# ArchSpine View Command Test Suite

## Role
This is a Vitest unit test suite for the **view command** CLI functionality.

## Key Responsibilities
- Creates temporary test directories to isolate view command testing.
- Mocks `console.log` to capture and verify CLI command output.
- Validates experimental view layer configuration via `Config.setExperimentalViewLayer`.
- Tests the `executeViewCommand` function under different configuration states.

## Notable Invariants
- Uses Vitest with `describe`/`it`/`beforeEach`/`afterEach` structure.
- All test state is isolated using temporary directories under `os.tmpdir`.
- Console output is mocked to assert command behavior.
- Depends on the `Config` infrastructure for experimental feature toggles.

## Negative Scope (Out of Scope)
- Does **not** test other CLI commands (e.g., `scan`, `init`).
- Does **not** implement the view command logic itself.
- Does **not** provide production runtime services.

## Exported / Visible Behavior
- No public surface is exported; this is a test-only module.
- The suite validates that the view command responds correctly to configuration changes and logs appropriate output.