<!-- spine-content-hash:cf13e45975a8d33f0dc6427f9088b023e2327f786a2ab128011f9805347cccd5 -->
## FixTask – Architectural Auto-fix Stage

The `FixTask` class (extending `SpineTask<FixStageInput, FixStageOutput>`) implements the automated LLM-driven architectural violation fixing stage in the pipeline. Its primary role is to automatically repair source files that break architectural rules by generating and applying patches produced by a language model.

### Key Responsibilities
- Groups architectural rule violations by source file to enable batch processing.
- Generates LLM prompts tailored to each violated file, using AST analysis via `@ast-grep/napi`, to produce fix patches.
- Validates generated patches using `createTwoFilesPatch` (diff utility) before applying them to source files.
- Rechecks fixed files by re-evaluating the rules through the rule engine to confirm violations are resolved.
- Manages a checkpoint lifecycle for each file fix (states: started, completed, skipped, failed).
- Aggregates results into `FixStageOutput`, listing both patched violations and those that remain unfixable.

### Out of Scope
- CLI command parsing and argument handling.
- Service orchestration outside of this fix stage.
- UI or terminal rendering beyond basic logging via `ctx.runtimeIO`.
- Direct rule loading or engine instantiation (uses `ctx.ruleEngine` instead).

### Invariants & Notable Behavior
- Violations **must** be grouped by source file before generating any fix prompts.
- Patches **must** be validated before application to prevent file corruption.
- After applying a patch, the fixed file **must** be rechecked to ensure all violations are resolved.
- The stage respects task-stage boundary rules: it does not take over unrelated CLI or orchestration tasks.

### Change Intent
- **Architectural intent:** Automatically fix architectural rule violations using LLM-generated patches within a confined pipeline stage.
- **Recent fixes:** Resolved TTY hang in FixTask, checkpoint retry crash, `--yes` propagation, and Windows compatibility issues.

### Public Surface
- `FixTask` class: `SpineTask<FixStageInput, FixStageOutput>`
- `name = 'Architectural Auto-fix'`
- `checkpointId = 'fix'`
- Constants: `MAX_SCANS`, `MAX_FILE_SIZE_BYTES`