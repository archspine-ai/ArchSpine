# CLI Subcommand Entry Point (`src/cli/`)

This directory is the single entry point for all ArchSpine command-line operations. Each file here is a thin adapter that parses its subcommand's arguments, validates them, and delegates execution to the appropriate runtime service or engine. The structure ensures separation of concerns: CLI logic (argument parsing, user prompts, error formatting) stays here, while core business logic lives in `src/runtime/` and other layers.

## Subcommand Groupings

- **Initialization & Configuration**  
  `init.ts` – bootstraps the entire ArchSpine environment (`.spine` structure, agent files, language selection).  
  `languages.ts` – interactive documentation language management.  
  `config.ts` – get/set configuration values (LLM provider, model, etc.).  
  `llm.ts` – interactive LLM provider/model/runtime configuration.  
  `repo.ts` – repository-level operations (check strategy, set artifact strategy).

- **Core Workflows**  
  `sync.ts` – orchestrates the full synchronization (scan, manifest update, spine gate protection, repair policies).  
  `publish.ts` – coordinates preflight checks, sync, document backfill, and manifest state update for publishing.  
  `scan.ts` – scans the codebase according to the configured policy.  
  `build.ts` – delegates to the build workflow for generating output artifacts.  
  `check.ts` – runs rule validation via the `CheckService`.  
  `fix.ts` – triggers automatic architectural violation fixes.

- **Status & Information**  
  `status.ts` – displays synchronization metrics (total files, needs sync, failures).  
  `info.ts` – runs the info report engine for detailed system state.  
  `usage.ts` – executes the usage report.  
  `view.ts` – manages view selection, display, and protected output baseline writes.  
  `history.ts` – retrieves and displays drift history and file documentation for a given file.

- **Maintenance & Hooks**  
  `hook.ts` – installs, uninstalls, configures, and triggers the pre-commit git hook.  
  `remove.ts` – removes all ArchSpine-managed artifacts (files, hooks) from a repository.

- **Experimental / Advanced**  
  `god.ts` – dangerous “God Mode” that overwrites files (requires confirmation).  
  `mcp.ts` – starts the Model Context Protocol server for AI agent integration.  
  `try.ts` – preview command for testing mirror output in specified directories.

## Key Implementation Patterns

- Every subcommand file exports a function like `executeXCommand(options)` that takes a typed options interface and returns `Promise<void>`.
- Common CLI utilities (`throwCliUsage`, `displayUIBanner`, `toArchSpineError`) are reused across files for consistent user feedback and error handling.
- The `sync.ts` file is particularly complex: it enforces spine gate protection via `detectProtectedOutputMutations`, applies repair policies, and manages execution checkpoints for recovery from partial failures.
- Experimental features (check, fix) display localized warnings and encourage AI agent usage via MCP.
- Several commands accept a `RuntimeService` dependency, enabling easier testing and separation from infrastructure.

This structure makes ArchSpine's command-line interface modular, testable, and extensible – new subcommands simply add a new file in this directory and register it in the main CLI router.