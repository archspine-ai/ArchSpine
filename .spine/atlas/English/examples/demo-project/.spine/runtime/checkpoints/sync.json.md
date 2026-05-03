# ArchSpine Sync Pipeline Checkpoint Configuration Summary

This document summarizes the execution checkpoint record used by the ArchSpine sync pipeline. Unlike a traditional configuration file that modifies system behavior, this checkpoint file is an authoritative trace of a specific sync command run. It logs initiation, progress, and final state, including per-stage timestamps and per-file completion status. Operators rely on it for resumption, debugging, and audit.

## What This Configuration Controls

The checkpoint itself does not control pipeline behavior; it records the outcome of a pipeline execution. However, the parameters within it determine how the system interprets past runs and whether it can recover from interruptions. The key parameters to monitor are:

- **schemaVersion**: Must always be `"1.0"`. Any deviation will cause the runtime to misread or reject the checkpoint.
- **command**: Identifies which CLI command produced this checkpoint (e.g., `"sync"`). This tells the runtime which pipeline stages to expect and how to re-enter during resumption.
- **runId**: A unique string (often timestamp-based) that correlates this checkpoint to a specific execution. Used to prevent duplicate processing and to support resumption via `resumedFromRunId`.
- **status**: The overall run status — `"completed"`, `"failed"`, `"running"`, or `"pending"`. This flag drives downstream logic: a `"failed"` status may trigger repair/resume workflows; `"running"` may block new runs.
- **startedAt / updatedAt**: ISO 8601 timestamps marking when the run started and when the checkpoint was last modified. Essential for time-bound diagnostics, detecting stale checkpoints, and ensuring coherency under concurrent access.
- **metadata**: Contains contextual flags:
  - `full` – whether this was a full sync or incremental.
  - `hookMode` – whether triggered by a git hook.
  - `resumedFromRunId` – the previous run being continued.
  - `resumeCandidateCount` – number of viable resume points found. A zero count may indicate a clean start or a failure to locate a previous checkpoint.
- **stages**: A map of pipeline stage names (e.g., `"Reconcile State & Cache"`, `"scan-cleanup"`, `"ast-extraction"`, `"summarization"`) to their status and timing. Each stage records its own `status`, `startedAt`, `completedAt`, and `updatedAt`. The `scan-cleanup` stage may include `data` (filtered files and affected directories). The `ast-extraction` and `summarization` stages include `items` — a per-file map of completion objects (status, timestamps). Stages execute sequentially; a failed stage blocks downstream stages.

## Operational Risks and Stability Concerns

This file is a critical runtime artifact. Its integrity directly affects the system’s ability to:

- Resume interrupted runs without skipping or repeating work
- Provide accurate diagnostic information
- Avoid duplicate processing or incorrect status reporting

**Corruption or inconsistency** is the primary risk. If the checkpoint file becomes corrupted or falls out of sync with actual pipeline progress (e.g., due to disk failure or non-atomic writes), subsequent runs may skip stages, reprocess completed work, or misreport status. **Never edit this file manually**; the runtime must always update it atomically.

**Concurrency and write contention**: High write concurrency can lead to partial updates. The runtime should use file locking or atomic write patterns. Disk failures pose the greatest danger.

**Dependency on prior runs**: The `resumedFromRunId` and `resumeCandidateCount` fields create a chain of dependency. If a referenced `runId` is missing or its checkpoint is corrupted, resumption will silently fail — the system may start a fresh run or behave unexpectedly. Operators should monitor that prior checkpoints remain accessible and valid.

**All timestamps must be valid ISO 8601** and satisfy `startedAt ≤ completedAt` for every stage and item. Violations can confuse diagnostics and may indicate a bug or data corruption.

In summary, treat this checkpoint file as a read-only record during normal operation, updated atomically by the runtime, and routinely backed up to guard against the risks described above.