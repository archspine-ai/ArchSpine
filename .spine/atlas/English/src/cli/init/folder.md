<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","responsibility":"Collectively, these components handle the complete setup of an ArchSpine-managed repository, including configuration bootstrapping, runtime initialization, LLM credential setup, file scanning, language discovery, and git hook installation, all coordinated through shared type contracts.","children":[{"filePath":"src/cli/init/repository-bootstrap.ts","role":"CLI command adapter for bootstrapping an ArchSpine configuration and artifacts in a target repository.","fileKind":"source"},{"filePath":"src/cli/init/runtime-bootstrap.ts","role":"CLI runtime bootstrap orchestrator that initializes the ArchSpine system and triggers the build pipeline.","fileKind":"source"},{"filePath":"src/cli/init/types.ts","role":"TypeScript module defining shared type contracts for the ArchSpine initialization and repository bootstrapping subsystem.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.789Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Initialization Subsystem (`src/cli/init`)

This directory contains the **bootstrapping and initialization** subsystem for the ArchSpine project. It is responsible for the complete setup of an ArchSpine-managed repository, from configuration generation to runtime startup.

## Key Components

- **`repository-bootstrap.ts`** – CLI command adapter that bootstraps ArchSpine configuration and artifacts into a target repository. This is the entry point for setting up a new project.
- **`runtime-bootstrap.ts`** – Orchestrates the runtime initialization of the ArchSpine system, including triggering the build pipeline after setup.
- **`types.ts`** – Defines shared TypeScript type contracts used across the initialization and bootstrapping subsystem, ensuring consistency between components.

## Implementation Areas

The subsystem handles:
- Configuration bootstrapping
- Runtime initialization
- LLM credential setup
- File scanning and language discovery
- Git hook installation

All components are coordinated through the shared type contracts defined in `types.ts`.