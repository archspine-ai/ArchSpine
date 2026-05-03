# Public Surface Map

> Generated: 2026-05-03T11:29:16.411Z
> Top 24 high-confidence public entry surfaces derived from index and graph signals.

## CLI Entry Points

### `src/cli/cli-utils.ts`
Kind: CLI
Symbols: `parseConfigValue`, `formatConfigValue`, `throwCliUsage`, `normalizeOptionalString`, `printStep`, `printLanguageDiscovery`, `displayUIBanner`, `wrapPromptText`
Confidence: 0.84
CLI-facing entry: CLI UI presentation utility for formatting command output, banner display, configuration value parsing, and text wrapping.

### `src/cli/commands/llm.ts`
Kind: CLI
Symbols: `llm`
Confidence: 0.81
CLI-facing entry: CLI command adapter for interactive LLM provider, model, and runtime configuration.

### `src/cli/document-languages.ts`
Kind: CLI
Symbols: `getDocumentLanguageChoices`, `DocumentLanguageChoice`, `HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE`, `HIGH_CAPACITY_LANGUAGE_SEPARATOR`, `DOCUMENT_LANGUAGE_QUALITY_NOTE`
Confidence: 0.75
CLI-facing entry: Configuration module defining types, constants, and a dynamic builder function for document language selection in a multilingual documentation system.

### `src/cli/commands/build.ts`
Kind: CLI
Symbols: `build`
Confidence: 0.76
CLI-facing entry: CLI command adapter for the 'build' operation, orchestrating the build workflow and delegating to core services.

### `src/cli/commands/hook.ts`
Kind: CLI
Symbols: `hook`
Confidence: 0.76
CLI-facing entry: CLI command adapter for managing git hook installation, configuration, and execution within the ArchSpine system.

### `src/cli/commands/languages.ts`
Kind: CLI
Symbols: `languages`
Confidence: 0.76
CLI-facing entry: CLI command adapter for interactive documentation language configuration management in the ArchSpine system.

### `src/cli/commands/publish.ts`
Kind: CLI
Symbols: `publish`
Confidence: 0.76
CLI-facing entry: CLI command handler orchestrating the publish workflow for the ArchSpine mirror system, coordinating preflight checks, sync, document backfill, and manifest state management.

### `src/cli/commands/sync.ts`
Kind: CLI
Symbols: `sync`
Confidence: 0.76
CLI-facing entry: CLI command adapter that orchestrates the complete synchronization workflow for the ArchSpine mirror system, including argument parsing, spine gate enforcement, repair policy evaluation, and execution checkpoint management.

### `src/cli/commands/view.ts`
Kind: CLI
Symbols: `view`
Confidence: 0.76
CLI-facing entry: CLI command adapter for the `view` subcommand, handling view selection, display, and protected output baseline writes within the ArchSpine system.

### `src/cli/repo/strategy.ts`
Kind: CLI
Symbols: `parseArtifactStrategy`, `runRepoCheck`, `runRepoStrategySet`
Confidence: 0.76
CLI-facing entry: CLI command adapter for repository artifact strategy operations (check and set) within the ArchSpine system.

### `src/cli/init/types.ts`
Kind: CLI
Symbols: _None_
Confidence: 0.72
CLI-facing entry: TypeScript module defining shared type contracts for the ArchSpine initialization and repository bootstrapping subsystem.

### `src/cli/index.ts`
Kind: CLI
Symbols: _None_
Confidence: 0.68
CLI-facing entry: Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.

### `src/cli/commands/check.ts`
Kind: CLI
Symbols: `check`
Confidence: 0.67
CLI-facing entry: CLI command adapter for the 'check' operation, providing the entry point that delegates to the RuntimeService's CheckService and signals failures via structured errors.

### `src/cli/commands/config.ts`
Kind: CLI
Symbols: `config`
Confidence: 0.67
CLI-facing entry: CLI command adapter for configuration management in the ArchSpine system.

### `src/cli/commands/fix.ts`
Kind: CLI
Symbols: `fix`
Confidence: 0.67
CLI-facing entry: CLI command adapter for the 'fix' operation, providing a thin interface to delegate execution to the runtime service's fix subsystem facade.

### `src/cli/commands/god.ts`
Kind: CLI
Symbols: `god`
Confidence: 0.67
CLI-facing entry: CLI command adapter for the God Mode feature, handling user warnings and confirmation before delegating to the God engine.

### `src/cli/commands/history.ts`
Kind: CLI
Symbols: `history`
Confidence: 0.67
CLI-facing entry: CLI command adapter for the `spine history` subcommand, responsible for parsing arguments, delegating to the Manifest infrastructure for drift history and file documentation retrieval, and formatting the output for terminal display.

### `src/cli/commands/info.ts`
Kind: CLI
Symbols: `info`
Confidence: 0.67
CLI-facing entry: CLI command handler for the 'info' command, acting as a thin adapter that orchestrates the execution of the info report engine.

### `src/cli/commands/init.ts`
Kind: CLI
Symbols: `init`
Confidence: 0.67
CLI-facing entry: CLI command orchestrator for initializing the ArchSpine environment, managing documentation language configuration, and coordinating repository and runtime bootstrap.

### `src/cli/commands/mcp.ts`
Kind: CLI
Symbols: `mcp`
Confidence: 0.67
CLI-facing entry: CLI command adapter for starting the ArchSpine Model Context Protocol (MCP) server.

### `src/cli/commands/repo.ts`
Kind: CLI
Symbols: `repo`
Confidence: 0.67
CLI-facing entry: CLI command adapter/router for repository-level operations in the ArchSpine system.

## MCP Entry Points

### `src/infra/mcp/tools.ts`
Kind: MCP
Symbols: `SpineTools`
Confidence: 0.73
MCP-facing entry: MCP (Model Context Protocol) tool facade that wraps core ArchSpine system components (Scanner, RuleEngine, Manifest, Config) into a unified interface for external AI agents.

### `src/infra/mcp/resources.ts`
Kind: MCP
Symbols: `SpineResources`
Confidence: 0.71
MCP-facing entry: Infrastructure facade providing MCP resource templates and handlers for accessing ArchSpine project metadata and files within the .spine directory, with context-aware access control via MCPContextGate.

### `src/infra/mcp/context.ts`
Kind: MCP
Symbols: `MCPContextGate`, `MCPContextMode`
Confidence: 0.69
MCP-facing entry: Infrastructure facade class for gating Model Context Protocol (MCP) context flow based on priming state and operational mode.

## Exported Modules

_No exported modules detected._

---

_Experimental view. Refresh via `spine sync`._