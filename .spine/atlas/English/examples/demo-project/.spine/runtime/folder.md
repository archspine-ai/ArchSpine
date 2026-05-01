<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/runtime","role":"Execution checkpoint records for synchronization runs in the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory track the lifecycle and status of sync operations, record metadata about sync runs (full vs. incremental, hook mode, resume state), log per-stage progress and completion timestamps, capture filtered file paths and affected directories during scan-cleanup, and record AST extraction results per source file as well as summarization results per configuration or documentation file.","children":[{"filePath":"examples/demo-project/.spine/runtime/checkpoints","role":"This directory contains execution records for synchronization runs in the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:01:40.750Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Runtime Checkpoints

The `runtime` directory is the operational nerve center of the ArchSpine mirror system. It stores execution checkpoint records for every synchronization run, capturing the full lifecycle and status of sync operations.

## Structure

The directory contains a single subfolder:

- **`checkpoints/`** — This folder holds all execution records for synchronization runs. Each record tracks metadata about the sync operation, including whether it was a full or incremental run, the hook mode used, and the resume state. It logs per-stage progress with completion timestamps, captures filtered file paths and affected directories during scan-cleanup, and records AST extraction results per source file as well as summarization results per configuration or documentation file.

## Key Implementation Areas

The checkpoint system is critical for:
- **Sync lifecycle tracking** — Recording when runs start, progress through stages, and complete
- **Run metadata** — Distinguishing full vs. incremental runs, hook modes, and resume states
- **File-level granularity** — Capturing which files were scanned, cleaned, extracted via AST, and summarized
- **Operational debugging** — Providing a complete audit trail for troubleshooting sync issues