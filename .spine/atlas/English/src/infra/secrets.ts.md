<!-- spine-content-hash:4e514f4760428ca2e6633c67bf8d4fdf9d208595a7f2b653f0fbc101a7f954e8 -->
# ArchSpine – Secrets Module

## Role
Infrastructure facade for secure LLM credential retrieval and management.

## Key Responsibilities
- Provides a simplified public interface to the underlying LLM credential store.
- Initializes the credential store with a project root directory and optional backend.
- Retrieves the stored LLM API key from the credential store.
- Manages the lifecycle of the credential store instance (including setting, clearing, checking existence, and querying source/backend).

## Notable Invariants & Negative Scope
- Must remain a thin facade over the credential store implementation.
- Must not assume or hardcode specific backend implementations.
- Must expose a stable API for consumers to retrieve and manage LLM credentials.
- **Out of scope:** Orchestrating higher-level service or engine workflows, directly interacting with external LLM APIs, handling user authentication or session management, providing encryption/decryption algorithms (delegates to backend).

## Public Surface (Exported / Externally Visible)
- `Secrets` class
- `Secrets.constructor(rootDir: string, backend?: CredentialBackend)`
- `Secrets.getLLMApiKey(): string | undefined`
- `Secrets.setLLMApiKey(key: string): void`
- `Secrets.clearLLMApiKey(): void`
- `Secrets.hasLLMApiKey(): boolean`
- `Secrets.getSource(): CredentialSource`
- `Secrets.getBackendName(): string`