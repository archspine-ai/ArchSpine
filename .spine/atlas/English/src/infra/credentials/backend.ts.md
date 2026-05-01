<!-- spine-content-hash:b34f13e3370ae92af36b733078030d299045a2f51a2ad7fcbed6c8593fd834f6 -->
# ArchSpine – macOS Credential Backend

## Role
Infrastructure facade providing a platform-specific credential storage backend for secure secret persistence on macOS.

## Key Responsibilities
- Defines the `CredentialBackend` interface for uniform secret get/set/delete operations across platforms.
- Implements `MacOSKeychainBackend` using native macOS security command-line tools (`security`).
- Encapsulates platform availability detection by checking `process.platform`.

## Notable Invariants & Negative Scope
- The `CredentialBackend` interface must remain stable to avoid breaking consumers.
- `MacOSKeychainBackend` must only be available on macOS (darwin platform).
- All secret operations must delegate to the native macOS security command-line tool.
- **Out of scope:** Cross-platform credential backends (e.g., Windows Credential Manager, Linux secret-service), high-level secret management orchestration or caching logic, user authentication or session management.

## Most Important Exported / Externally Visible Behavior
- `CredentialBackend` (interface)
- `MacOSKeychainBackend` (class)

## Drift Detection
A drift has been detected: the previous semantic contract described a file-based fallback backend, but the current source code only contains the `MacOSKeychainBackend` class. The file-based backend has been removed, indicating a narrowing of scope.