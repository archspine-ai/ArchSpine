<!-- spine-content-hash:1191c4cca153ce5b44f9b7668bc8230aaf9e88cbe8d82772b3b9c2bca9b67875 -->
# ArchSpine – Windows DPAPI Credential Backend Test Suite

## Role
This is a Vitest test suite for the Windows DPAPI credential backend. It validates that secret storage behaves securely and correctly on Windows.

## Key Responsibilities
- Ensures secrets are passed to PowerShell via **stdin** rather than command-line arguments, preventing credential leakage through process inspection.
- Tests the credential backend's **set operation** in isolated, mocked environments.
- Cleans up mocks and environment variables between test cases to maintain test isolation.

## Notable Invariants
- Test files must use the suffix `.test.ts` or `.spec.ts`.

## Out of Scope
- Non-Windows credential backends or cross-platform storage.
- Credential retrieval (`get`) or deletion (`delete`) operations.
- Integration with higher-level credential store abstractions.

## Exported / Visible Behavior
This suite does not export any public API surface. It is purely a test harness that validates internal behavior of the Windows DPAPI credential backend.