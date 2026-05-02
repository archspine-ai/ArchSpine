<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/runtime","role":"Execution checkpoint records for synchronization runs in the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory track the lifecycle and status of sync operations, record metadata about sync runs (full vs. incremental, hook mode, resume state), log per-stage progress and completion timestamps, capture filtered file paths and affected directories during scan-cleanup, and record AST extraction results per source file as well as summarization results per configuration or documentation file.","children":[{"filePath":"examples/demo-project/.spine/runtime/checkpoints","role":"This directory contains execution records for synchronization runs in the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:01:40.750Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.spine/runtime` — Execution Checkpoint Records

This directory houses the lifecycle tracking and status metadata for synchronization runs within the ArchSpine mirror system. It is the operational memory that records every sync operation’s progress, outcome, and ancillary data.

## Notable Children

- **`checkpoints/`** — A folder storing per-run execution records. Each checkpoint captures whether the sync was full or incremental, which hook mode was active (e.g., `pre-commit` or `post-commit`), whether the run was resumed from a previous interruption, per‑stage progress timestamps, filtered file paths affected during scan‑cleanup, AST extraction results for each source file, and summarization results for configuration or documentation files.

## Implementation Areas

The most important concerns realized here are:

- **Sync lifecycle recording** – Tracking start, stage transitions, and completion of mirror runs.
- **Metadata persistence** – Storing run type (full/incremental), hook context, and resume state to enable crash recovery.
- **Filter & scan logging** – Capturing which files were filtered and which directories were touched during cleanup scans.
- **AST extraction records** – Per‑source‑file detail of what was extracted by the structural parser.
- **Summarization records** – Per‑config or per‑doc file summaries generated during the LLM pipeline stage.

Together, these submodules ensure that every mirror operation is fully auditable and recoverable, and that the system can report detailed history for diagnostics or rollback decisions.