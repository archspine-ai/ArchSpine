<!-- spine-content-hash:da610b0f4e0798517cacedc60a8bb68354a338e57136a94f40c7f0a3f42ce205 -->
# ArchSpine Publish-Preflight Integration Test Suite

## Role
This is a Vitest integration test suite for the publish-preflight service. It validates runtime assertions and lock serialization within isolated project environments to ensure the service behaves correctly before deployment.

## Key Responsibilities
- Creates isolated temporary directories to simulate ArchSpine project root structures.
- Invokes the built CLI executable to test publish runtime baseline assertions end-to-end.
- Validates that `assertPublishRuntimeBaseline` throws appropriate `ArchSpineError` instances for missing or malformed spine configurations.
- Tests `assertPublishSnapshotReady` with mocked manifest and lock files to ensure snapshot readiness checks.

## Notable Invariants
- Relies on the Vitest test framework for structure and assertions.
- Assumes the existence of a built CLI at `dist/cli/index.js`.
- Operates in isolated temporary directories to avoid side effects.
- Follows the test-file-suffix rule (`.test.ts`).

## Negative Scope (Out of Scope)
- Does not unit test individual utility functions (e.g., `serializeLockPayload`) in isolation.
- Does not test non-publish related services or CLI commands.
- Does not cover production runtime logic; this is a test suite.

## Most Important Exported Behavior
- `makeTempDir()`: Creates a temporary directory for isolated testing.
- `makeRuntimeBaseline(rootDir: string): void`: Sets up a runtime baseline in the specified root directory.