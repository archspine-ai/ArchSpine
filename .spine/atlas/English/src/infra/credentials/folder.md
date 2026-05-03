This directory contains the platform-agnostic credential storage infrastructure for the ArchSpine mirror system. It provides multiple backends (macOS keychain, Linux secret-tool, Windows DPAPI, and in-memory) for secure persistence and retrieval of secrets such as LLM API keys. The files are grouped into two core submodules:

- `backend.ts` — Defines the `CredentialBackend` interface and implements platform-specific backends along with a factory function `createDefaultCredentialBackend` for automatic selection.
- `store.ts` — Provides factory functions `createProjectLLMCredentialStore` and `createGlobalLLMCredentialStore` that use a pluggable backend to manage scoped credential stores with deterministic secret naming.

Key implementation areas include platform detection, secret validation, condition-based warnings, and the unified interface that abstracts away OS-specific details.