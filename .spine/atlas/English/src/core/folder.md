# Core Runtime Infrastructure (`src/runtime`)

This directory holds the foundational runtime scaffolding for the ArchSpine mirror system. It is responsible for configuration validation, error definition, pipeline orchestration, scan policy contracts, and task execution state management. The files are grouped into six implementation areas:

1. **Configuration Validation** – `config-schema.ts`  
   Provides runtime predicates and the primary `resolveSpineConfig` function (with a thin `validateSpineConfig` wrapper) that parses and validates the `SpineConfig` schema against canonical sets of allowed enum values. Returns a validated config or a list of issues.

2. **Error Definitions** – `errors.ts`  
   Centralizes all error code constants into a union type (`ArchSpineErrorCode`) for CLI, runtime, publish, and config domains, and defines the `ArchSpineErrorOptions` interface for structured error construction.

3. **Pipeline Orchestration** – `pipeline.ts`  
   The main task executor that runs generic `SpineTask` instances with full lifecycle management (start, completion, failure checkpoints), performance telemetry (duration, memory), and logging through the `runtimeIO` interface.

4. **Scanning Policy** – `scan-policy.ts`  
   Defines the `FileSource` union type and the `ScanPolicy` / `PartialScanPolicy` interfaces that govern file origins, ignore chains, and protocol inclusion/exclusion lists for mirror scanning.

5. **Task State Management** – `task-state.ts`  
   Exports factory functions (`createTaskArtifactsState`, `createTaskTelemetryState`, `createTaskState`) to initialize pipeline state objects, plus mutation helpers for resetting state, tracking LLM usage, recording performance metrics, managing runtime caches, and incrementing file counters (processed/skipped/failed). Also provides drift warning and diagnostic snapshot utilities.

6. **Type Contracts** – `task-types.ts` and `task.ts`  
   `task-types.ts` establishes statistical interfaces (`TaskStats`, `TaskStageMetric`), state containers, and input/output contracts for all pipeline stages. `task.ts` defines the `TaskContext` interface that supplies shared engines (Scanner, Aggregator, ContextEngine, RuleEngine, ASTExtractor) and infrastructure (Manifest, OutputManager) for dependency injection in task execution.

The most critical implementation areas are configuration validation (ensuring system integrity at startup), pipeline orchestration with telemetry (providing observability and lifecycle control), and task state management (the backbone for multi-stage execution tracking). These submodules are the core contract points that all higher-level mirror operations depend on.