# `src/infra` – Core Infrastructure Layer

The `src/infra` directory provides the foundational services that power the entire ArchSpine mirror system. It implements configuration resolution, SQLite database lifecycle, multi-provider LLM client abstraction, credential storage, file integrity tracking, an MCP server for external AI agents, prompt assembly, runtime I/O, and governance utilities.

## Notable Children and Grouping

- **`config/`** – Configuration management subsystem. Key modules:  
  `config-validation.ts` (facade for `resolveSpineConfig` and `validateSpineConfig`), `config.ts` (public API barrel).

- **`db/`** – SQLite database infrastructure. Key file: `db.ts` (unified facade for file tracking, symbol export, LLM metrics, rule violations, batch commits).

- **`llm/`** – LLM client abstraction layer. Key file: `llm.ts` (facade exporting `createResolvedLLMClient`, `resolveLLMSettings`, provider utilities).

- **`credentials/`** – Platform-agnostic credential storage with backends for macOS keychain, Linux secret-tool, Windows DPAPI, and in-memory.

- **`manifest/`** – File system interaction and integrity verification. Key file: `manifest.ts` (public API for `Manifest` class and `hasManifestBaseline`).

- **`mcp/`** – Model Context Protocol server exposing internal resources and tools to external AI agents.

- **`prompt/`** – Prompt assembly and orchestration. Key files: `prompt.ts` (public facade), `renderer.ts` (markdown generation), `repository-artifacts.ts` (Git and file operations).

- **`prompt-context/`** – Prompt policy and construction infrastructure. Key file: `prompt-context.ts` (exports budget profiles, validation policies, artifact builders).

- **Other notable files** in `src/infra/`:
  - `runtime-io.ts` – Standardized I/O interface for logging, warnings, errors, confirmations.
  - `spine-gate.ts` – Unauthorized mutation detection in protected output directories.
  - `repair-policy.ts` – Decision logic for repair actions based on violation reports.
  - `secrets.ts` – Secure LLM credential retrieval facade.
  - `output.ts` – DAO for reading/writing Spine index JSON files.
  - `execution-checkpoint.ts` – Checkpoint state manager for retry system.
  - `index-reader.ts` – Index document reading and validation with schema compatibility.
  - `lite-prompt.ts` – Token-constrained prompt builder for Lite Mode.
  - `writer-boundary.ts` – Write protection for `.spine/` directories.
  - `rules-loader.ts` – Rule document loading and parsing.
  - `ui.ts` – CLI foldable console output utility.

## Key Implementation Areas

1. **Configuration Management** – Secure resolution and validation of all settings.
2. **Database Operations** – SQLite lifecycle, atomic batch commits, drift detection.
3. **LLM Integration** – Unified multi-provider client with retry and configuration merging.
4. **Credential Storage** – Cross-platform secure secret persistence.
5. **File System Manifest** – SHA-256 hashing, drift tracking, baseline detection.
6. **MCP Server** – Context-gated access to internal resources for external AI agents.
7. **Prompt Assembly** – Fluent builder, policy tiers, budget calculation, localization.
8. **Governance Utilities** – Mutation detection (`spine-gate.ts`), repair policy (`repair-policy.ts`), write protection (`writer-boundary.ts`), rule loading (`rules-loader.ts`).