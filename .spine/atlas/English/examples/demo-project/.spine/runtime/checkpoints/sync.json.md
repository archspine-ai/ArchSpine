<!-- spine-content-hash:003960ae6498f00bd529e285183c402b1ae9adf3699433f6f0c54c57de41e0e2 -->
# ArchSpine Sync Run Record

## Role
This file is an **execution record** for a single synchronization run in the ArchSpine mirror system. It captures the full lifecycle, status, and diagnostic metadata of a sync operation.

## Key Responsibilities
- Track the lifecycle and status of a sync operation (pending → running → completed/failed).
- Record metadata about the sync run: whether it is a full or incremental sync, whether it was hook-triggered, and any resume state.
- Log per-stage progress and completion timestamps for each phase of the sync.
- Capture filtered file paths and affected directories during the scan-cleanup stage.
- Record AST extraction results per source file.
- Record summarization results per configuration or documentation file.

## Notable Invariants
- The `status` field must be one of: `pending`, `running`, `completed`, `failed`.
- The `runId` must be unique per execution.
- All stage entries must have a `status` and timestamps consistent with the run lifecycle.
- The `metadata.full` flag determines whether the sync is a full or incremental run.
- The `metadata.hookMode` flag must be `false` for normal runs; `true` indicates a hook-triggered run.

## Negative Scope / Out of Scope
This record is a **diagnostic artifact**, not a configuration file. It does not directly affect system behavior. However, corruption or absence of this record may prevent the system from resuming interrupted syncs or auditing past operations.

## Most Important Exported / Externally Visible Behavior
- The `resumedFromRunId` and `resumeCandidateCount` fields are critical for recovery; incorrect values may cause the system to attempt resume from an invalid state.
- The `filteredFiles` list in the scan-cleanup stage determines which files are processed; an empty or incorrect list may cause critical files to be skipped.
- Per-file statuses in the AST extraction and summarization stages allow the system to detect partial failures; if a file is marked `failed`, the system should retry or alert.

## Stability and Risks
This run record is a diagnostic artifact, not a configuration file. It does not directly affect system behavior. However, if the run record is corrupted or missing, the system may lose the ability to resume interrupted syncs or audit past operations. The `resumedFromRunId` and `resumeCandidateCount` fields are critical for recovery; if they are incorrect, the system may attempt to resume from an invalid state. The `filteredFiles` list in scan-cleanup determines which files are processed; if it is empty or incorrect, critical files may be skipped. The per-file statuses in ast-extraction and summarization allow the system to detect partial failures; if a file is marked `failed`, the system should retry or alert.