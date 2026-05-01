<!-- spine-content-hash:666de6c593535145ddf00b0665a7638c9f205a37f99e3f52cf370bbe91d86477 -->
# ArchSpine – FixStageTask

## Role
SpineTask implementation for the automated LLM-driven architectural violation fixing stage.

## Key Responsibilities
- Groups architectural rule violations by source file for batch processing.
- Generates LLM prompts to produce fix patches for each violated file using AST analysis.
- Applies generated patches to source files after validation using diff utilities.
- Rechecks fixed files to ensure violations are resolved by re-evaluating rules.

## Notable Invariants
- Must implement the SpineTask contract for the fix stage.
- Must operate on stage-local data (violations) provided via TaskContext.
- Must delegate LLM prompt construction to the fix-prompt engine.
- Must not assume control flow outside its stage boundary.

## Negative Scope (Out of Scope)
- CLI command parsing or argument handling.
- Orchestration of unrelated pipeline stages or services.
- Direct LLM API calls; relies on the fix-prompt engine for prompt generation.
- Persistence of task state beyond the provided TaskContext.

## Most Important Exported / Externally Visible Behavior
This task is a discrete stage in the Spine pipeline that automatically remediates architectural rule violations by generating and applying LLM-produced code patches. It does not expose a public API surface beyond its SpineTask contract.