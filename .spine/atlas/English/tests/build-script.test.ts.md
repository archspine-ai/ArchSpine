<!-- spine-content-hash:08a415a956699e22fb32dcd834b8bc5e79dbdfed9b17753cd31b60cfefba8815 -->
# Build Script Packaging Filter Tests

## Role
Unit test suite for the build script's dist packaging filter function.

## Key Responsibilities
- Verifies that `shouldExcludeDistEntry` correctly identifies `__mocks__` paths as excludable from dist packaging.
- Verifies that non-mock paths (e.g., `src/infra/llm/runtime.ts`) are not excluded from dist packaging.

## Out of Scope
- Integration or end-to-end testing of the build pipeline.
- Testing other functions in the build script beyond `shouldExcludeDistEntry`.
- Testing the build script's file system operations or CLI behavior.

## Invariants
- Test files must end with `.test.ts` or `.spec.ts`.

## Architectural Intent
Ensure the build script's packaging filter correctly excludes mock directories from the distribution package, preventing test infrastructure from leaking into production artifacts.

## Recent Change Intent
Initial commit for open source release (v1.0.0) — this test validates a core packaging behavior.

## Public Surface
- `describe('build script packaging filters', ...)`
- `it('excludes __mocks__ content from dist packaging', ...)`