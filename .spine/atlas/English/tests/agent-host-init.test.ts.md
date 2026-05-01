<!-- spine-content-hash:c2bc2448444604be4815efe5d08beb3469fd2e748c2f1f92226f2eea6a75a768 -->
# ArchSpine Repository Bootstrap & Managed File Sync — Test Suite

## Role
Vitest unit test suite for the ArchSpine repository bootstrap and managed file synchronization system.

## Key Responsibilities
- Tests synchronization of managed repository files (agent instructions, gitattributes, gitignore, search ignore, spine ignore) via `sync*` functions.
- Validates injection and removal of ArchSpine scripts in agent instructions files.
- Verifies removal of managed files during cleanup.
- Tests the full repository bootstrap workflow using `runRepositoryBootstrap` with a `Config` instance.
- Isolates test state using temporary directories (`os.tmpdir`, `fs.mkdtempSync`) to prevent side effects.
- Asserts correct file content, presence, and absence after sync and cleanup operations.

## Notable Invariants & Negative Scope
- **Invariant:** Test files must end with `.test.ts` or `.spec.ts`.
- **Out of scope:** Does not test error handling or edge cases for invalid configurations. Does not cover integration with external systems or real file system permissions. Does not test performance or concurrency.

## Most Important Exported / Externally Visible Behavior
The suite validates that managed files are idempotently written and correctly removed, ensuring the synchronization subsystem behaves correctly under normal conditions.