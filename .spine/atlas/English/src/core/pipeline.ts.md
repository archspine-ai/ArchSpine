<!-- spine-content-hash:13f96e255117c7a870b56158cb9dff521317d44336252b66cb847d99080e9102 -->
# ArchSpine – TaskRunner

## Role
Core runtime orchestrator for executing SpineTask instances with lifecycle management and performance telemetry.

## Key Responsibilities
- Instantiates with a `TaskContext` to provide execution environment for tasks.
- Executes generic `SpineTask` instances using their `.execute` method with provided input.
- Records task stage start, completion, and failure checkpoints via the `executionCheckpoint` interface.
- Logs task execution progress and errors through the `runtimeIO` interface.
- Captures performance metrics (duration, memory usage) and records them via `recordTaskStageMetric`.

## Notable Invariants
- Depends only on core pipeline contracts (`SpineTask`, `TaskContext`) and internal metric utilities.
- Must remain decoupled from CLI entry points or UI layers.
- Lifecycle events (start, complete, fail) are checkpointed and logged consistently.

## Negative Scope (Out of Scope)
- CLI command parsing or argument handling
- Task definition or implementation
- Persistence of task state beyond checkpoint recording
- External service integration beyond provided context interfaces

## Most Important Exported Behavior
- **Class:** `TaskRunner`
- **Constructor:** `constructor(context: TaskContext)`
- **Method:** `run<I, O>(task: SpineTask<I, O>, input: I): Promise<O>` – executes a task with lifecycle tracking and telemetry.