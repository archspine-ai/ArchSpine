<!-- spine-content-hash:1380be2216ac28161f2e053b7b87af0c464a34bad0fede2658bb3ff017ffea1c -->
# ASTExtractionTask — Core Pipeline Task

**Role:** Core pipeline task for AST extraction and symbol registration within the ArchSpine mirror system.

**Key Responsibilities:**
- Identifies source files using `LangRegistry.isSourceFile` and resolves their programming language via `resolveLanguage`.
- Extracts AST skeletons from supported source files using the configured extractor (`ctx.extractor.extract`).
- Registers extracted skeletons into the runtime cache and task state via `setTaskSkeleton`.
- Handles unsupported files by logging warnings, updating the manifest to skip them, and marking them as unsupported via `setUnsupportedTaskFile`.
- Manages file state transitions (started, skipped, removed) through execution checkpoint and manifest operations.
- Forces re-extraction of files marked in `ctx.forcedSyncFiles` by clearing their export records and recalculating hashes.

**Notable Invariants & Negative Scope:**
- Task modules should implement stage-local work on top of core contracts and engines, and should not take over CLI command parsing or unrelated service orchestration.
- Out of scope: CLI command parsing or argument handling, service orchestration beyond the extraction stage boundary, direct filesystem scanning or discovery (delegated to `ScanStage`), language registration or language registry configuration.

**Most Important Exported / Externally Visible Behavior:**
- `ASTExtractionTask` (class extending `SpineTask<ScanStageOutput, ExtractionStageOutput>`)
- `name = 'AST Extraction & Symbol Registration'`
- `checkpointId = 'ast-extraction'`
- `execute(ctx: TaskContext, input: ScanStageOutput): Promise<ExtractionStageOutput>`