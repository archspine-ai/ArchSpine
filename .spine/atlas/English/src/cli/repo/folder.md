<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/repo","role":"CLI command adapter for managing repository artifact strategies.","responsibility":"Parses and validates artifact strategy input from CLI arguments, coordinates strategy checks and application via the repository admin service, provides user-facing console feedback, and integrates with system configuration for persisted and initialization strategies.","children":[{"filePath":"src/cli/repo/strategy.ts","role":"CLI command adapter for repository artifact strategy management within the ArchSpine system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.342Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/cli/repo` — Repository Artifact Strategy CLI Adapter

This directory contains the CLI command adapter responsible for managing repository artifact strategies in the ArchSpine system. It acts as the bridge between user-facing command-line arguments and the underlying repository admin service.

## Key Component

- **`strategy.ts`** — The sole source file in this directory. It parses and validates artifact strategy input from CLI arguments, coordinates strategy checks and application via the repository admin service, provides user-facing console feedback, and integrates with system configuration for persisted and initialization strategies.

## Implementation Focus

The adapter handles three critical areas:
1. **Input parsing and validation** — Converting raw CLI arguments into structured strategy commands.
2. **Service coordination** — Delegating strategy checks and application to the repository admin service.
3. **User feedback** — Providing clear console output about strategy operations and their results.

This module is a thin, focused adapter that ensures clean separation between CLI presentation and business logic.