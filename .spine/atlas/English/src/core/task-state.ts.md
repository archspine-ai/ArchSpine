<!-- spine-content-hash:71783ea5b9fceb937902a653168c302eff6bf4fc2169d6e282897051a93648aa -->
# ArchSpine Core Pipeline State Module

## Role
Core pipeline state factory and mutation module providing initialization functions and runtime state management for the ArchSpine task execution pipeline.

## Key Responsibilities
- Exports factory functions (`createTaskArtifactsState`, `createTaskTelemetryState`, `createTaskState`) to initialize pipeline state objects with default Map and telemetry structures.
- Provides `resetTaskState` to reinitialize a `TaskContext`'s state and runtime cache, accepting optional overrides.
- Tracks LLM usage via `addTaskUsage`, accumulating token counts and cost into telemetry.
- Records per-stage performance metrics (duration, heap, RSS) via `recordTaskStageMetric`, updating min/max/count.
- Maintains runtime caches for file skeletons, unsupported files, and pending commits via set/get/queue helpers.
- Increments telemetry counters for processed, skipped, and failed files via `markTaskProcessedFile`, `incrementTaskSkipped`, `incrementTaskFailed`.
- Manages drift warnings and diagnostic snapshots for summarize and validate stages via `addTaskDriftWarning`, `pushSummarizeDiagnostics`, `pushValidateDiagnostics`.

## Notable Invariants
- Core pipeline state factories must not depend on CLI entry code (core-pipeline-isolation).
- All state mutations operate on a `TaskContext` object, ensuring centralized state management.
- Telemetry counters and metrics are updated atomically via helper functions.

## Negative Scope (Out of Scope)
- CLI argument parsing or command invocation logic.
- File system I/O or external service calls.
- Pipeline stage orchestration or sequencing logic.
- User-facing output formatting or logging.

## Public Surface (Exported Functions)
- `createTaskArtifactsState`
- `createTaskTelemetryState`
- `createTaskState`
- `resetTaskState`
- `addTaskUsage`
- `recordTaskStageMetric`
- `markTaskProcessedFile`
- `incrementTaskSkipped`
- `incrementTaskFailed`
- `setUnsupportedTaskFile`
- `hasUnsupportedTaskFile`
- `setTaskSkeleton`
- `getTaskSkeleton`
- `queueTaskCommit`
- `addTaskDriftWarning`
- `pushSummarizeDiagnostics`
- `pushValidateDiagnostics`