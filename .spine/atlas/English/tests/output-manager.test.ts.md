<!-- spine-content-hash:241b223bf4b8461af6e2185946f4193a93657ae7315395b3d35e59ca53b50816 -->
# OutputManager – pruneAtlasLocales Unit Tests

## Role
Unit test suite for the `OutputManager` class, specifically testing the `pruneAtlasLocales` method.

## Key Responsibilities
- Sets up a temporary directory with a `.spine/atlas` structure containing locale subdirectories (English, Simplified Chinese) and sample files.
- Instantiates `OutputManager` with the temporary directory path.
- Calls `OutputManager.pruneAtlasLocales` with a set containing only `'Simplified Chinese'` to test locale pruning logic.
- Asserts that the `'English'` locale directory is removed after pruning.
- Asserts that the `'Simplified Chinese'` locale directory is preserved after pruning.
- Cleans up the temporary directory after each test via `afterEach` hook.

## Notable Invariants & Negative Scope
- Test file must end with `.test.ts` or `.spec.ts`.
- Does **not** cover integration tests with real file systems beyond temporary directories.
- Does **not** include performance or stress testing of `OutputManager`.
- Does **not** test other `OutputManager` methods (e.g., `write`, `read`).
- Does **not** include end-to-end or system-level tests.

## Most Important Exported / Externally Visible Behavior
- `describe('output manager', ...)` – test suite declaration.
- `afterEach(() => { ... })` – cleanup hook.
- `it('should prune atlas locales', ...)` – the core test case verifying locale pruning logic.