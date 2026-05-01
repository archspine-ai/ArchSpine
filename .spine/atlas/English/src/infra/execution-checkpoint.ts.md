<!-- spine-content-hash:71c124bd778b30b95c5622ad508792c41c9f8354830eb488a386ffa530bb038d -->
# ArchSpine – Execution Checkpoint Store

## Role
Infrastructure layer persistence store for execution checkpoint state management, validation, and filesystem I/O.

## Key Responsibilities
- Defines TypeScript types and interfaces for execution checkpoint state (run, stage, item statuses and states).
- Provides a store class (`ExecutionCheckpointStore`) to load, save, and validate checkpoint state from/to filesystem.
- Validates checkpoint state integrity against expected status enums and structural schemas.
- Manages checkpoint state lifecycle (initialization, updates, serialization) with filesystem I/O.

## Notable Invariants & Negative Scope
- Must remain a pure persistence and validation layer for checkpoint state.
- Must not absorb service/task/engine orchestration concerns.
- Should expose stable low-level capabilities and facades.
- **Out of scope:** Orchestrating execution workflows or business logic; directly invoking scanner or engine runtime processes; providing high-level API facades for external consumers (remains a low-level store).

## Most Important Exported / Externally Visible Behavior
- `ExecutionCheckpointStore` – the primary class for loading, saving, and validating checkpoint state.
- `ExecutionCheckpointItemState`, `ExecutionCheckpointStageState`, `ExecutionCheckpointState` – core state interfaces.
- `ExecutionCheckpointRunStatus`, `ExecutionCheckpointStageStatus`, `ExecutionCheckpointItemStatus` – status enums used for validation.