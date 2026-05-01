<!-- spine-content-hash:d7775eb9c6f8a1f8e32bb409319bd609d045204e3b100d76ef3b588d48340d32 -->
# ArchSpine – Experimental View Layer Resolution Integration Tests

## Role
Vitest integration test suite for experimental view layer configuration resolution.

## Key Responsibilities
- Validates the `resolveExperimentalViewLayer` function's behavior under different configuration scenarios.
- Tests environment variable `SPINE_EXPERIMENTAL_VIEW_LAYER` override mechanics.
- Verifies `Config.setExperimentalViewLayer` persistence and its effect on resolution.
- Ensures temporary test directories are created and cleaned up properly.

## Notable Invariants & Negative Scope
- **Invariant:** Test files must end with `.test.ts` or `.spec.ts` (Rule: test-file-suffix).
- **Out of Scope:**
  - Unit testing of individual view layer components in isolation.
  - Testing of view derivation or post-commit derivation logic.
  - Performance or stress testing of the view layer resolution.

## Most Important Exported / Externally Visible Behavior
This suite does not export any public API surface; it is purely a test harness. Its primary externally visible behavior is the validation that configuration resolution respects both programmatic overrides and environment variable overrides, and that temporary test directories are properly managed.