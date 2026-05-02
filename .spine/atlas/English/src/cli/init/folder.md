<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","responsibility":"Collectively, these components handle the complete setup of an ArchSpine-managed repository, including configuration bootstrapping, runtime initialization, LLM credential setup, file scanning, language discovery, and git hook installation, all coordinated through shared type contracts.","children":[{"filePath":"src/cli/init/repository-bootstrap.ts","role":"CLI command adapter for bootstrapping an ArchSpine configuration and artifacts in a target repository.","fileKind":"source"},{"filePath":"src/cli/init/runtime-bootstrap.ts","role":"CLI runtime bootstrap orchestrator that initializes the ArchSpine system and triggers the build pipeline.","fileKind":"source"},{"filePath":"src/cli/init/types.ts","role":"TypeScript module defining shared type contracts for the ArchSpine initialization and repository bootstrapping subsystem.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.789Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Init Directory Summary

The `src/cli/init` directory houses the initialization and bootstrapping subsystem of the ArchSpine project. Its components collectively manage the complete setup of an ArchSpine-managed repository, covering configuration bootstrapping, runtime initialization, LLM credential setup, file scanning, language discovery, and git hook installation. Coordination is achieved through shared type contracts.

## Key Files

- **repository-bootstrap.ts** – A CLI command adapter responsible for bootstrapping ArchSpine configuration and initial artifacts into a target repository. It sets up the base structure and required files.
- **runtime-bootstrap.ts** – The runtime bootstrap orchestrator that initializes the ArchSpine system and triggers the build pipeline. It handles the sequence of startup operations.
- **types.ts** – Defines the shared TypeScript type contracts used throughout the initialization and repository bootstrapping subsystem. These types ensure consistency across the various bootstrap components.

## Important Implementation Areas

- Configuration bootstrapping and artifact generation
- Runtime initialization and build pipeline triggering
- Shared type contracts for cross-component communication
- Integration points for LLM credentials, file scanning, and language discovery

The module provides a clear separation between the orchestration logic (runtime-bootstrap), the adapter layer for repository setup (repository-bootstrap), and the type definitions that glue them together.