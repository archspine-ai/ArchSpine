<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine","role":"Root configuration and rule directory for the ArchSpine project mirror system.","responsibility":"Centralizes project-wide configuration (LLM, MCP, hooks, scanning, artifacts) and architectural rulebooks that enforce layered module structure, import boundaries, naming conventions, and coding standards across the entire monorepo.","children":[{"filePath":".spine/config.json","role":"Central configuration file for the ArchSpine project mirror system, defining project metadata, LLM/MCP settings, hook behavior, artifact strategy, scan policy, and initialization state.","fileKind":"config"},{"filePath":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:57.227Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.spine` — Root Configuration & Rule Directory

The `.spine` directory is the central configuration and rule hub for the ArchSpine project mirror system. It holds all project-wide settings that govern how the system operates, including LLM and MCP configurations, hook behaviors, artifact strategies, scan policies, and initialization state. This directory also contains the architectural rulebooks that enforce layered module structure, import boundaries, naming conventions, and coding standards across the entire monorepo.

## Notable Children

- **`config.json`** — The central configuration file for the ArchSpine project mirror system. It defines project metadata, LLM/MCP settings, hook behavior, artifact strategy, scan policy, and initialization state. This is the primary entry point for customizing how the mirror system behaves.

- **`rules/`** — A directory containing the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project. These rules enforce layered module structure, import boundaries, naming conventions, and coding standards across the entire monorepo.

## Key Implementation Areas

- **Configuration Management** — The `config.json` file is the single source of truth for all system settings. Modifications here affect LLM integration, MCP behavior, hook execution, artifact generation, and scanning operations.

- **Rule Enforcement** — The `rules/` directory contains the rulebooks that ensure consistent architectural patterns and coding standards. These rules are critical for maintaining the integrity of the layered module structure and import boundaries.

- **System Initialization** — The configuration file tracks initialization state, making it essential for understanding the current setup and any pending setup steps.