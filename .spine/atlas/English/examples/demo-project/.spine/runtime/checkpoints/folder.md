<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/runtime/checkpoints","role":"This directory contains execution records for synchronization runs in the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory track the lifecycle and status of sync operations, record metadata about sync runs (full vs. incremental, hook mode, resume state), log per-stage progress and completion timestamps, capture filtered file paths and affected directories during scan-cleanup, and record AST extraction results per source file as well as summarization results per configuration or documentation file.","children":[{"filePath":"examples/demo-project/.spine/runtime/checkpoints/sync.json","role":"Execution record for a synchronization run in the ArchSpine mirror system","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:39.407Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `checkpoints/` — Sync Execution Records

This directory stores execution records for synchronization runs in the ArchSpine mirror system. Each checkpoint file captures the lifecycle and status of a sync operation, including metadata about the run type (full vs. incremental), hook mode, resume state, per-stage progress, completion timestamps, filtered file paths, affected directories during scan-cleanup, AST extraction results per source file, and summarization results per configuration or documentation file.

The directory currently contains a single notable child:

- **`sync.json`** — The execution record for a synchronization run. This file tracks all the details of a sync operation, from start to finish, and is used to resume interrupted syncs or audit past runs.

Key implementation areas include:
- **Run lifecycle tracking** — Recording start, progress, and completion of sync operations.
- **Metadata capture** — Storing run type, hook mode, and resume state.
- **File and directory logging** — Capturing filtered file paths and affected directories during scan-cleanup.
- **AST and summarization results** — Recording extraction results per source file and summarization results per config/doc file.