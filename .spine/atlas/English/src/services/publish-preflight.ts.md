<!-- spine-content-hash:1f24e34f6ba205d2f3b5670c2bb8c3acbb229213653137aef3a502ca59cac792 -->
# ArchSpine Publish Validation Facade

## Role
Infrastructure-layer validation facade that asserts runtime conditions for publish operations, including baseline checks, snapshot readiness, and local strategy warnings.

## Key Responsibilities
- Validates the presence of the `.spine` directory and required `manifest.json` before publish.
- Checks for active runtime lock files and verifies their payload integrity, throwing `ArchSpineError` if invalid.
- Ensures the index directory and its sub-structures (`atlas`, `rules`) exist for snapshot readiness.
- Warns if publishing from a local strategy by checking runtime configuration and emitting a console warning.
- Throws `ArchSpineError` with appropriate error codes if any baseline or snapshot condition fails.

## Out of Scope
- Does not perform the actual publish operation or file copying.
- Does not handle network or remote storage operations.
- Does not manage user authentication or authorization.
- Does not implement any UI or user interaction beyond console warnings.

## Invariants
- All assertion functions must throw `ArchSpineError` with specific `ErrorCodes` on failure.
- The `.spine` directory must exist before any publish operation can proceed.
- Lock files must be parseable and contain valid payloads.
- Index directory and its subdirectories (`atlas`, `rules`) must exist for snapshot readiness.

## Public Surface
- `assertPublishRuntimeBaseline(rootDir: string): void`
- `assertPublishSnapshotReady(rootDir: string): void`
- `warnIfPublishingFromLocalStrategy(rootDir: string, runtimeIO?: RuntimeIO): void`