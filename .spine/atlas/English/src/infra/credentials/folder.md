<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/credentials","role":"Platform-specific credential storage and secure secret management infrastructure.","responsibility":"Provides a unified credential storage system with platform-specific backends (e.g., macOS Keychain) and secure file-based fallback, enabling safe persistence and retrieval of API keys and secrets across different environments.","children":[{"filePath":"src/infra/credentials/backend.ts","role":"Infrastructure facade providing a platform-specific credential storage backend for secure secret persistence on macOS.","fileKind":"source"},{"filePath":"src/infra/credentials/store.ts","role":"Infrastructure module providing secure credential storage with pluggable backends and file-based fallback safety.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.098Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
## Credential Storage Infrastructure (`src/infra/credentials`)

This directory implements the platform-specific credential storage layer for ArchSpine's "mirror" system. It provides a unified interface for securely persisting secrets such as API keys, with support for native OS keychains (macOS) and a secure file-based fallback. The module is designed to abstract away platform differences while maintaining strong security guarantees.

### Notable Children

- **`backend.ts`** – Infrastructure facade that selects and initializes the appropriate credential storage backend. It currently provides a dedicated macOS Keychain backend for native secret persistence.

- **`store.ts`** – Core storage module implementing a pluggable backend architecture. It handles secret lifecycle operations (read/write/delete) and includes file-based fallback for environments where native keychains are unavailable, ensuring safe secret storage across development and production.

### Key Implementation Areas

- Secure secret persistence on macOS using the system Keychain.
- Fallback to encrypted file storage for non-macOS platforms or CI environments.
- Backend abstraction allowing future additions (e.g., Windows Credential Manager, Linux secret-service).
- Error handling and safe defaults to prevent accidental secret leak.

```json
{
  "localized": {
    "English": "This directory provides platform-specific credential storage and secure secret management infrastructure. It includes a macOS Keychain backend (`backend.ts`) and a pluggable storage module with file fallback (`store.ts`)."
  }
}
```