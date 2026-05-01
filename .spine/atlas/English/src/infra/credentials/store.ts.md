<!-- spine-content-hash:402751d643581f3d34615f7926d639df66559d838c23981ee7101e45a433cb17 -->
# ArchSpine Credential Store

## Role
Infrastructure module providing secure credential storage with pluggable backends and file-based fallback safety.

## Key Responsibilities
- Manages LLM API keys and other credentials via a pluggable backend (e.g., system keychain).
- Provides secure fallback file storage when the primary backend is unavailable.
- Validates and trims secret values to ensure data integrity.
- Warns if fallback secrets may be tracked by version control via `.gitignore` analysis.
- Exposes factory functions (`createProjectLLMCredentialStore`, `createGlobalLLMCredentialStore`) for convenient store creation with project or global scope.

## Notable Invariants
- Infra modules should expose stable low-level capabilities and facades, must not absorb service/task/engine orchestration concerns.
- Callers should prefer public infra facades over reaching into deep private implementation paths when a facade exists.

## Negative Scope (Out of Scope)
- Does not handle authentication or authorization logic.
- Does not manage network requests or API calls.
- Does not implement business logic for LLM usage or orchestration.
- Does not provide UI or user interaction components.

## Public Surface
- `CredentialStore` (class)
- `createProjectLLMCredentialStore` (function)
- `createGlobalLLMCredentialStore` (function)
- `CredentialSource` (type)
- `FileCredentialShape` (interface)