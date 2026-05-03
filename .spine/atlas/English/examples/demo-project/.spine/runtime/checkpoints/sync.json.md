# ArchSpine Sync Run Record – Configuration Summary

This document describes the structure and meaning of a run record produced by the ArchSpine mirror system after executing a synchronization operation. Operators use these records to verify the success of syncs, debug failures, and understand system behavior.

## What the Configuration Controls

The `command` field dictates the operation performed. When `"sync"` is present, the full synchronization pipeline runs. The `status` field shows the final outcome: `"completed"` means the pipeline finished without error. A non‑completed status (e.g., `"failed"`, `"aborted"`) indicates a problem that likely requires investigation before dependent processes can proceed.

The `metadata` section contains three critical switches:

- **`full`** – When `true`, the system performs a full state reconciliation instead of an incremental update. A full sync is resource‑intensive but safe; it catches all changes. Operators should be aware that frequent full syncs may degrade performance.
- **`hookMode`** – When `false`, the run was initiated manually or programmatically. If `true`, it was triggered by a file‑system hook. This matters for audit and for deciding whether to re‑trigger hooks.
- **`resumedFromRunId`** – If present, this run continues the work of a prior run (e.g., after a crash). This supports crash recovery and avoids duplicate processing. Operators should verify that the resumed run’s start time is later than the original’s, and note any missing files.

The `stages` object tracks each pipeline phase: reconciliation, cleanup, AST extraction, and summarization. Each stage has its own timestamps and status. A failure in any stage aborts the whole run. The `items` under AST extraction and summarization list exactly which files were processed and their individual statuses.

## Operational Risks & Stability Concerns

- **Recovery logic** – The presence of `resumedFromRunId` indicates the system can recover from interruptions. However, if the resumption logic is faulty, files may be skipped or processed twice. Always cross‑check the file list against expectations.
- **Full sync resource usage** – `full: true` means a complete scan of the state, which is safe but can be heavy on I/O and memory. Monitor system load when full syncs run.
- **Stage‑wise failure** – Because the pipeline aborts on any stage failure, a single slow or broken stage can block the entire sync. Watch stage timestamps for unusually long durations.
- **Filtered files** – The `scan‑cleanup` stage outputs a `filteredFiles` list. This list is used for audit and for later processing. If filtering rules are incorrect, essential files may be excluded. Validate that the list contains all expected files and omits only intentionally skipped ones.
- **Time ordering** – Each stage’s `startedAt` must precede its `completedAt`, and stages must execute in order. Any deviation (e.g., overlapping timestamps) may indicate a bug or data corruption.

This record provides full transparency into a sync run and is the primary source for monitoring system health and diagnosing anomalies.