<!-- spine-content-hash:67eb7dc064be9ecd6afd80adb5611f10aefd95dac66a99dfadc35091c086ca65 -->
# ArchSpine – Scan & Cleanup Orphan Files (Pipeline Stage)

## Role
This is a dedicated pipeline stage task responsible for scanning the file system and cleaning up orphaned or stale files within the ArchSpine tracked state. It ensures that the tracked state remains consistent with the actual filesystem by removing entries for files that no longer exist.

## Key Responsibilities
- Loads the language snapshot to determine which file extensions are tracked, using `LangRegistry`.
- Scans for all tracked files and changed files via the scanner service.
- Filters out files that no longer exist on disk (orphans) using filesystem checks.
- Calculates file hashes and determines whether manifest updates are needed via manifest services.

## Out of Scope
- CLI command parsing or argument handling.
- Orchestration of other pipeline stages or services.
- Direct filesystem mutation beyond cleanup of orphan entries.

## Notable Invariants
- Operates only on tracked files defined by the language snapshot or `LangRegistry`.
- Must not perform CLI command parsing or unrelated service orchestration (per task-stage-boundary rule).

## Public Surface
- **Class**: `ScanAndCleanupTask` (extends `SpineTask<ScanStageInput, ScanStageOutput>`)
- **Properties**:
  - `name`: `'Scan & Cleanup Orphan Files'`
  - `checkpointId`: `'scan-cleanup'`
- **Method**: `execute(ctx: TaskContext, input: ScanStageInput): Promise<ScanStageOutput>`

## Change Intent
- **Architectural**: Provides a dedicated pipeline stage for scanning and cleaning orphaned files, maintaining consistency between tracked state and the filesystem.
- **Recent**: Resolves lint errors and finalizes pipeline fixes before v1.0, ensuring the scan-cleanup stage integrates cleanly with the task execution framework.