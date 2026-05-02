<!-- spine-content-hash:eeb0dc6b5e5ab29fd2812926b4437e12ca1ac91fb7218e1568c7833ef5b41ce4 -->
# ArchSpine Fix Service (`FixService`)

The `FixService` is the service-layer orchestrator for the ArchSpine architectural fix pipeline. It manages the sequential execution of four stages: scanning & cleanup, AST extraction, LLM-driven correction, and validation. The service integrates with the runtime session and checkpoint system for durable execution tracking, and supports configurable retry logic (up to `MAX_FIX_RETRIES = 2` attempts).

## Key Responsibilities

- **Pipeline orchestration:** Uses `TaskRunner` to run the multi-stage fix pipeline.
- **Retry management:** Resets task state via `resetTaskState` and re-runs the pipeline up to the configured maximum retries.
- **Session & checkpoint integration:** Tracks and resumes execution state using `executionCheckpoint.startRun`.
- **Context preparation:** Creates task context (`createTaskContext`) for each run and recheck.
- **Metrics recording:** Logs usage metrics of the fix operation within the manifest.
- **LLM & execution profile resolution:** Resolves LLM settings (`GlobalLLMConfig`, `resolveLLMSettings`) and execution profile (`resolveExecutionProfileFromSettings`).
- **Error normalization:** Converts errors to `ArchSpineError` via `toArchSpineError` for consistent reporting.

## Notable Invariants & Out-of-Scope

- **Invariants:** The pipeline must abort after `MAX_FIX_RETRIES` retries. It must always use the runtime session and checkpoint system. The service lives under `src/services/`, not `src/infra/`.
- **Not responsible for:** Implementing individual tasks (`FixTask`, `ScanAndCleanupTask`, `ASTExtractionTask`, `ValidationTask`), low-level LLM client handling, file system scan policies, or configuration loading.

## Exported Surface

The main public API includes:
- `runFix` – entry point to execute the fix pipeline.
- `FixService` – the service class.
- `FixRunSummary` – return type summarizing the fix run.
- `FixServiceOptions` – configuration options.