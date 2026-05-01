<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/core","role":"Core L2 aggregation logic and pipeline orchestration for the ArchSpine mirror system.","responsibility":"Defines the central validation contracts, error handling, task execution pipeline, scanning policies, and state management that collectively enable the ArchSpine system to collect, validate, deduplicate, and process data from multiple L1 sources into a canonical L2 mirror state.","children":[{"filePath":"src/core/compat","role":"This directory contains the core L2 aggregation logic for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/core/config-schema.ts","role":"Core validation contract and constants definition for the ArchSpine configuration schema.","fileKind":"source"},{"filePath":"src/core/errors.ts","role":"Core infrastructure module providing centralized error code constants and error option type definitions for the ArchSpine system.","fileKind":"source"},{"filePath":"src/core/pipeline.ts","role":"Core runtime orchestrator for executing SpineTask instances with lifecycle management and performance telemetry.","fileKind":"source"},{"filePath":"src/core/scan-policy.ts","role":"Core TypeScript type definition module establishing the scanning policy configuration contract for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/core/task-state.ts","role":"Core pipeline state factory and mutation module providing initialization functions and runtime state management for the ArchSpine task execution pipeline.","fileKind":"source"},{"filePath":"src/core/task-types.ts","role":"Core TypeScript contract definitions for ArchSpine pipeline task state, metrics, and stage boundaries.","fileKind":"source"},{"filePath":"src/core/task.ts","role":"Core interface defining the dependency injection context for ArchSpine task execution.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T07:20:46.666Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/core` — ArchSpine Core L2 Aggregation & Pipeline Orchestration

This directory is the central nervous system of the ArchSpine mirror system. It defines the validation contracts, error handling, task execution pipeline, scanning policies, and state management that collectively enable ArchSpine to collect, validate, deduplicate, and process data from multiple L1 sources into a canonical L2 mirror state.

## Notable Children

- **`compat/`** — A subdirectory containing core L2 aggregation logic (further details inside).
- **`config-schema.ts`** — The validation contract and constants for the ArchSpine configuration schema.
- **`errors.ts`** — Centralized error code constants and error option type definitions.
- **`pipeline.ts`** — The runtime orchestrator that executes `SpineTask` instances with lifecycle management and performance telemetry.
- **`scan-policy.ts`** — TypeScript type definitions establishing the scanning policy configuration contract.
- **`task-state.ts`** — Pipeline state factory and mutation module providing initialization functions and runtime state management.
- **`task-types.ts`** — Contract definitions for pipeline task state, metrics, and stage boundaries.
- **`task.ts`** — Interface defining the dependency injection context for task execution.

## Key Implementation Areas

- **Pipeline orchestration** (`pipeline.ts`, `task-state.ts`, `task-types.ts`, `task.ts`) — The core execution flow that drives all mirror operations.
- **Validation & error handling** (`config-schema.ts`, `errors.ts`) — Contracts and error infrastructure that ensure data integrity.
- **Scanning policies** (`scan-policy.ts`) — Configuration contracts that govern how L1 sources are scanned.
- **Aggregation logic** (`compat/`) — The submodule responsible for merging and deduplicating data from multiple sources.