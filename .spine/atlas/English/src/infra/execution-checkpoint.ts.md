<!-- spine-content-hash:243b7c73c82f6983045b4b1ec981df6ff21d9e05facbee216128e1a9a00b5bde -->
# ArchSpine Execution Checkpoint State Manager

**Role:** Infrastructure layer execution checkpoint state manager, providing type definitions, validation, filesystem persistence, and resume candidate derivation for the ArchSpine checkpoint retry system.

**Key Responsibilities:**
- Defines TypeScript union types for run, stage, and item statuses (e.g., `ExecutionCheckpointRunStatus`).
- Defines interfaces for checkpoint item, stage, and full state (`ExecutionCheckpointState`).
- Exports a class `ExecutionCheckpointStore` that loads, saves, validates, and manages checkpoint state via filesystem I/O.
- Provides utility functions to query state: `isResumableCheckpoint`, `getStageData`, `getStageItemsByStatus`.
- Provides derivative functions to compute resume/failed/check-resume candidate file lists from state.
- Validates checkpoint state integrity against status enums and structural schemas (inferred from usage of `isRecord`, `ITEM_STATUSES.has`).

**Out of Scope:**
- Orchestration of task execution or service logic.
- User interface or CLI interaction.
- System dependency injection or configuration loading.

**Invariants:**
- Checkpoint state must be validated before use; invalid state should produce warnings or errors.
- Filesystem operations must handle I/O errors gracefully and not crash the process.
- Resume candidate derivation must be deterministic based solely on the checkpoint state.

**Most Important Exported Behavior:**
The module's public surface includes the types `ExecutionCheckpointRunStatus`, `ExecutionCheckpointStageStatus`, `ExecutionCheckpointItemStatus`, and interfaces `ExecutionCheckpointItemState`, `ExecutionCheckpointStageState`, `ExecutionCheckpointState`. Key functions are `isResumableCheckpoint(state)`, `getStageData(state, stageId)`, `getStageItemsByStatus(state, stageId, statuses)`, and the three resume candidate derivation functions: `deriveSyncResumeCandidateFiles`, `deriveSyncFailedCandidateFiles`, `deriveCheckResumeCandidateFiles`. The `ExecutionCheckpointStore` class is the primary persistence manager.