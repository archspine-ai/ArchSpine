<!-- spine-content-hash:caa71c111529ce9669fcbb6fef50c105ce5fb3d954aa1a1c45333c4cc3919d9e -->
# CredentialStore Test Suite

## Role
Vitest test suite for the CredentialStore component, verifying backend integration and fallback file safety.

## Key Responsibilities
- Tests CredentialStore initialization with various backend implementations (Memory, WindowsDPAPI, broken).
- Validates secret storage and retrieval behavior across different backend availability scenarios.
- Ensures fallback credential file creation and gitignore safety hardening as per recent security fixes.
- Mocks filesystem operations to isolate test environment and clean up temporary directories.

## Out of Scope
- Does not test production credential backends like WindowsDPAPI in real environments.
- Does not cover network-based credential storage or remote secret management.
- Does not test concurrent access or race conditions in the store.

## Invariants
- Test files must end with `.test.ts` or `.spec.ts` (Rule: test-file-suffix).

## Change Intent
- **Architectural Intent:** Provide comprehensive test coverage for the CredentialStore component, ensuring correct behavior across multiple backend implementations and fallback scenarios.
- **Recent Change Intent:** Harden fallback credential file gitignore safety, ensuring that fallback files are properly ignored by version control to prevent accidental credential exposure.

## Public Surface
- `describe('CredentialStore')`
- `it('should initialize with Memory backend')`
- `it('should fallback to file when backend is broken')`
- `it('should create gitignore for fallback file')`