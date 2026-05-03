# `src/infra` – Infrastructure Foundation of ArchSpine

This directory forms the **infrastructure layer** of the ArchSpine mirror system. It provides the core services — configuration management, LLM client abstraction, credential storage, database lifecycle, manifest persistence, MCP server integration, prompt assembly and rendering, runtime I/O utilities, and output management — that all higher-level operations depend on.

## Notable Submodules & Grouping

The components are organized into logical groups:

| Area | Key files / subdirectories | Purpose |
|------|----------------------------|---------|
| **Configuration** | `config/`, `config.ts`, `config-validation.ts` | Loads, validates, and resolves environment variables and defaults; provides a stable API for `resolveSpineConfig` and `validateSpineConfig`. |
| **Credentials** | `credentials/`, `secrets.ts` | Pluggable credential storage with platform-specific backends (macOS Keychain, Linux secret-tool, Windows DPAPI, in-memory) for secure LLM API key management. |
| **Database** | `db/`, `db.ts`, `execution-checkpoint.ts` | Manages the SQLite runtime database lifecycle (WAL journal, schema init, drift detection, stale recovery). Includes `db.ts` as a unified DAO repository for files, drift events, symbol caches, token usage, and violations. |
| **LLM Integration** | `llm/`, `llm.ts` | Client abstraction, factory, global config file management, retry with exponential backoff, and concrete provider implementations (OpenAI, Gemini, etc.). |
| **Manifest** | `manifest/`, `manifest.ts` | File status tracking, SHA-256 hashing, deterministic path resolution, and state persistence for synchronization and verification. |
| **MCP Server** | `mcp/` | Implements the Model Context Protocol (MCP) server with stdio transport, exposing project metadata, file contents, scanning, rules, and drift history to external AI agents. |
| **Prompt Generation** | `prompt/`, `prompt-context/`, `prompt.ts`, `prompt-policy.ts`, `prompt-rendering.ts`, `lite-prompt.ts` | Fluent prompt builders, policy resolution, budget calculation, trimming, diagnostics, and specialized generators for markdown, source code, config, document, folder, and project prompts. Also includes `lite-prompt.ts` for token-constrained “Lite Mode” prompts. |
| **Runtime I/O & Utilities** | `runtime-io.ts`, `ui.ts`, `renderer.ts`, `index-reader.ts`, `output.ts`, `rules-loader.ts`, `writer-boundary.ts`, `spine-gate.ts`, `repository-artifacts.ts`, `repair-policy.ts`, `auth.ts` | Standardized logging/warnings/errors, foldable console UI, markdown documentation rendering, index file reading with schema validation, output DAO for .spine JSON files, rule document loading, write-protection boundaries, mutation detection, repository snapshot utilities, and repair-action decision logic. |
| **Mocking** | `__mocks__/` | Provides a stable public export of `MockClient` for testing LLM provider interactions. |

## Most Important Implementation Areas

- **Configuration & Credentials** – The foundational setup that controls all other infrastructure behavior.
- **Database (db/)** – The persistence backbone for file metadata, audit events, and system status.
- **LLM Abstraction (llm/)** – Decouples the system from specific providers and handles resilience.
- **Prompt System (prompt/ + prompt-context/)** – Generates structured, localized, and validated prompts that drive ArchSpine’s AI interactions.
- **MCP Server (mcp/)** – Enables external AI agents to consume ArchSpine resources and tools directly.
- **Runtime I/O (runtime-io.ts, ui.ts)** – Ensures consistent user interaction and testability across the application.

All these components coalesce into a unified infrastructure layer that supports the entire ArchSpine mirror system.