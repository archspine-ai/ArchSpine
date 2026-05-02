<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli","role":"Entry point and command-line interface layer for the ArchSpine system, handling user commands, argument parsing, help presentation, and runtime bootstrapping.","responsibility":"Provides the complete command-line interface for ArchSpine, including the main entry point (index.ts), help text rendering, utility functions for UI formatting and configuration parsing, and subdirectories for command adapters (commands), initialization (init), and repository artifact management (repo). Collectively, these components enable users to interact with ArchSpine's semantic mirror workflows through terminal commands.","children":[{"filePath":"src/cli/cli-utils.ts","role":"CLI UI presentation utility for formatting language discovery results, conditional banner rendering, and configuration value parsing.","fileKind":"source"},{"filePath":"src/cli/commands","role":"CLI command adapters for the ArchSpine system, each handling a specific subcommand's argument parsing, validation, and delegation to core services.","fileKind":"folder"},{"filePath":"src/cli/document-languages.ts","role":"Configuration module defining types and constants for document language selection in multilingual documentation tiers.","fileKind":"source"},{"filePath":"src/cli/help.ts","role":"CLI help text renderer for the ArchSpine command-line interface.","fileKind":"source"},{"filePath":"src/cli/index.ts","role":"Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.","fileKind":"source"},{"filePath":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","fileKind":"folder"},{"filePath":"src/cli/repo","role":"CLI command adapter for managing repository artifact strategies.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-02T07:41:55.417Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli` — Command-Line Interface & Entry Point

The `src/cli` directory is the user-facing gateway to the ArchSpine semantic mirror system. It handles all terminal interactions: parsing commands, displaying help, bootstrapping the runtime, and delegating to core services.

## Notable Children

- **`index.ts`** — Primary CLI entry point and command router. It interprets the user’s invocation and dispatches to the appropriate subcommand.
- **`commands/`** — A folder containing adapters for each ArchSpine subcommand. Each adapter performs argument validation and delegates to core business logic.
- **`init/`** — The initialization and bootstrapping subsystem, responsible for setting up a new ArchSpine project (configuration files, scaffolding, etc.).
- **`repo/`** — A CLI adapter for managing repository artifact strategies (e.g., snapshots, versioning policies).
- **`help.ts`** — Renders the CLI help text, including usage examples and command descriptions.
- **`cli-utils.ts`** — Utility functions for UI formatting (language discovery banners, conditional output) and configuration value parsing.
- **`document-languages.ts`** — Defines types and constants for selecting documentation languages in multilingual tiers.

## Implementation Areas

- **Argument Parsing & Routing**: `index.ts` and the adapters inside `commands/` form the core of the CLI dispatch mechanism.
- **Help System**: `help.ts` provides dynamically generated help output.
- **Initialization Workflow**: The `init/` subdirectory handles project scaffolding, making it a critical entry point for new users.
- **Repository Artifact Management**: The `repo/` subdirectory exposes CLI commands for controlling how repository artifacts are generated and maintained.
- **Language Configuration**: `document-languages.ts` and `cli-utils.ts` together enable locale-aware help and configuration.