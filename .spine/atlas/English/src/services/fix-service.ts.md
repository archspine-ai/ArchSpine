<!-- spine-content-hash:99ed34c4f9bf9d7b786c12f9dd119990791549aa0af1a003805bdca66359ddde -->
# ArchSpine FixService

## Role
Service-layer orchestrator for the ArchSpine architectural fix pipeline, managing the sequential execution of scanning, AST extraction, LLM-driven correction, and validation tasks with runtime session integration.

## Key Responsibilities
- Orchestrates the multi-stage fix pipeline including scanning, AST extraction, LLM-driven correction, and validation via a TaskRunner.
- Manages fix retry logic with a configurable maximum attempts (`MAX_FIX_RETRIES = 2`).
- Integrates with the runtime session and checkpoint system to track fix execution state.
- Records usage metrics of the fix operation within the manifest.
- Resolves LLM settings and execution profiles from configuration and secrets.
- Handles error recovery by converting generic errors to `ArchSpineError` with appropriate error codes.

## Out of Scope
- Direct LLM invocation or prompt construction (delegated to `FixTask` and `ASTExtractionTask`).
- Low-level file I/O or database operations (handled by infra modules).
- User interface or CLI command handling.

## Invariants
- `FixService` must be instantiated with a valid `FixServiceOptions` including `Config`, `Secrets`, and `RuntimeIO`.
- The fix pipeline always runs within a runtime session (`runWithRuntimeSession`).
- Retry logic is bounded by `MAX_FIX_RETRIES` (2).
- All errors are normalized to `ArchSpineError` before propagation.

## Public Surface
- `FixService` class (exported)
- `FixRunSummary` interface (exported)
- `FixServiceOptions` interface (exported)