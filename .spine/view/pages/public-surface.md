# Public Surface Map

> Generated: 2026-05-02T13:38:18.702Z
> Top 24 high-confidence public entry surfaces derived from index and graph signals.

## CLI Entry Points

### `src/cli/document-languages.ts`
Kind: CLI
Symbols: `getDocumentLanguageChoices`, `DocumentLanguageChoice`, `HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE`, `HIGH_CAPACITY_LANGUAGE_SEPARATOR`, `DOCUMENT_LANGUAGE_QUALITY_NOTE`
Confidence: 0.75
CLI-facing entry: Configuration module defining types and constants for document language selection in multilingual documentation tiers.

### `src/cli/init/types.ts`
Kind: CLI
Symbols: `InitSharedOptions`, `RepositoryBootstrapResult`, `LLMScope`, `HookSetupStatus`, `ArtifactStrategy`
Confidence: 0.77
CLI-facing entry: TypeScript module defining shared type contracts for the ArchSpine initialization and repository bootstrapping subsystem.

### `src/cli/commands/build.ts`
Kind: CLI
Symbols: `build`
Confidence: 0.73
CLI-facing entry: CLI command adapter for the 'build' operation, orchestrating the build workflow and delegating to core services.

### `src/cli/commands/hook.ts`
Kind: CLI
Symbols: `hook`
Confidence: 0.73
CLI-facing entry: CLI command adapter for managing git hook integration and synchronization within the ArchSpine system.

### `src/cli/cli-utils.ts`
Kind: CLI
Symbols: _None_
Confidence: 0.68
CLI-facing entry: CLI UI presentation utility for formatting language discovery results, conditional banner rendering, and configuration value parsing.

### `src/cli/commands/init.ts`
Kind: CLI
Symbols: `init`
Confidence: 0.68
CLI-facing entry: CLI command orchestrator for initializing the ArchSpine environment, configuration, and repository structure.

### `src/cli/index.ts`
Kind: CLI
Symbols: _None_
Confidence: 0.68
CLI-facing entry: Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.

### `src/cli/commands/languages.ts`
Kind: CLI
Symbols: `languages`
Confidence: 0.70
CLI-facing entry: CLI command adapter for interactive documentation language configuration management in the ArchSpine system.

### `src/cli/commands/publish.ts`
Kind: CLI
Symbols: `publish`
Confidence: 0.70
CLI-facing entry: CLI command handler orchestrating the publish workflow for the ArchSpine mirror system, coordinating preflight checks, sync, document backfill, and atlas state management.

### `src/cli/commands/view.ts`
Kind: CLI
Symbols: `view`
Confidence: 0.70
CLI-facing entry: CLI command adapter for the 'view' subcommand, handling view selection, validation, and orchestration of protected output writes within the ArchSpine system.

### `src/cli/repo/strategy.ts`
Kind: CLI
Symbols: `parseArtifactStrategy`, `runRepoCheck`, `runRepoStrategySet`
Confidence: 0.70
CLI-facing entry: CLI command adapter for repository artifact strategy management within the ArchSpine system.

### `src/cli/commands/check.ts`
Kind: CLI
Symbols: `check`
Confidence: 0.67
CLI-facing entry: CLI command adapter for the 'check' operation, providing the entry point that delegates to the RuntimeService's CheckService and signals failures via structured errors.

### `src/cli/commands/fix.ts`
Kind: CLI
Symbols: `fix`
Confidence: 0.67
CLI-facing entry: CLI command adapter for the 'fix' operation, providing a thin interface to delegate execution to the runtime service's fix subsystem facade.

### `src/cli/commands/god.ts`
Kind: CLI
Symbols: `god`
Confidence: 0.67
CLI-facing entry: CLI command handler for the God Mode feature, providing user warnings and confirmation before delegating to the God engine.

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

### `src/cli/commands/mcp.ts`
Kind: CLI
Symbols: `mcp`
Confidence: 0.67
CLI-facing entry: CLI command adapter for starting the ArchSpine Model Context Protocol (MCP) server.

### `src/cli/commands/repo.ts`
Kind: CLI
Symbols: `repo`
Confidence: 0.67
CLI-facing entry: CLI command router for repository-level operations in the ArchSpine system.

### `src/cli/commands/scan.ts`
Kind: CLI
Symbols: `scan`
Confidence: 0.67
CLI-facing entry: CLI command handler for the 'scan' operation, orchestrating source code scanning and dry-run reporting.

### `src/cli/commands/usage.ts`
Kind: CLI
Symbols: `usage`
Confidence: 0.67
CLI-facing entry: CLI command entry point for executing usage reports.

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

### `src/engines/context.ts`
Kind: Public Module
Symbols: `ContextEngine`, `RelevanceScoreContribution`, `DependencyCandidateDiagnostics`, `SymbolTargetDiagnostics`, `UsageTargetDiagnostics`, `ContextResolutionDiagnostics`, `ContextResolutionResult`, `ContextResolutionOptions`
Confidence: 0.69
Exported module surface: Architectural context resolution engine for dependency analysis and relevance scoring in the ArchSpine mirror system.

---

_Experimental view. Refresh via `spine sync`._