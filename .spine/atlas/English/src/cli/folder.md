<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli","role":"CLI layer providing user-facing commands, utilities, and initialization logic for the ArchSpine system.","responsibility":"Collectively, this directory implements the command-line interface of ArchSpine, including argument parsing, command routing, help text rendering, configuration bootstrapping, language discovery, repository setup, and UI formatting utilities that bridge user input with core services.","children":[{"filePath":"src/cli/cli-utils.ts","role":"CLI UI presentation utility for formatting language discovery results, conditional banner rendering, and configuration value parsing.","fileKind":"source"},{"filePath":"src/cli/commands","role":"CLI command adapters that provide the user-facing interface for all ArchSpine operations.","fileKind":"folder"},{"filePath":"src/cli/document-languages.ts","role":"Configuration module defining types and constants for document language selection in multilingual documentation tiers.","fileKind":"source"},{"filePath":"src/cli/help.ts","role":"CLI help text renderer for the ArchSpine command-line interface.","fileKind":"source"},{"filePath":"src/cli/index.ts","role":"Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.","fileKind":"source"},{"filePath":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","fileKind":"folder"},{"filePath":"src/cli/repo","role":"CLI command adapter for managing repository artifact strategies.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:01:50.635Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli` — ArchSpine Command-Line Interface

This directory implements the entire user-facing CLI layer of the ArchSpine semantic mirror system. It is responsible for argument parsing, command routing, help text rendering, configuration bootstrapping, language discovery, repository setup, and UI formatting utilities that bridge user input with core services.

## Notable Children

- **`index.ts`** — Primary CLI entrypoint and command router. This is where all user commands are dispatched to their respective handlers.
- **`commands/`** — Folder containing command adapters that provide the user-facing interface for all ArchSpine operations. Each subcommand (e.g., `init`, `repo`) has its own adapter here.
- **`init/`** — Initialization and bootstrapping subsystem. Handles first-time project setup, configuration generation, and environment validation.
- **`repo/`** — CLI command adapter for managing repository artifact strategies, such as cloning, updating, or listing mirrors.
- **`cli-utils.ts`** — UI presentation utility for formatting language discovery results, conditional banner rendering, and configuration value parsing.
- **`document-languages.ts`** — Configuration module defining types and constants for document language selection in multilingual documentation tiers.
- **`help.ts`** — CLI help text renderer that produces formatted usage information for all commands.

## Key Implementation Areas

- **Command routing** in `index.ts` determines which handler to invoke based on user input.
- **Bootstrapping** in `init/` handles the full lifecycle of project initialization, including dependency checks and template generation.
- **Repository management** in `repo/` provides commands for working with remote and local mirror repositories.
- **Language discovery** utilities in `cli-utils.ts` and `document-languages.ts` support multilingual documentation workflows.
- **Help system** in `help.ts` ensures users can always access clear, structured documentation for any command.