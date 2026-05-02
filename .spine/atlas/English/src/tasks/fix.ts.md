<!-- spine-content-hash:d15b57c1890b9f1f4422795a4551c2fe52892bf205a43ea96025eec90b8d7d24 -->
## FixTask – Architectural Auto-Fix Stage

**Role**  
`FixTask` is a `SpineTask<FixStageInput, FixStageOutput>` that implements the automated LLM-driven architectural violation fixing stage in the processing pipeline. It is triggered after architectural rule violations have been detected and is responsible for generating and applying fix patches.

**Key Responsibilities**  
- Groups architectural rule violations by source file so that each file can be processed in a batch.  
- For each violated file, generates an LLM prompt using AST analysis (via `@ast-grep/napi`) to produce a fix patch.  
- Validates generated patches with `createTwoFilesPatch` (diff utility) before applying them to the source file.  
- Rechecks fixed files by re‑evaluating the architectural rules to confirm all violations are resolved.  
- Manages a checkpoint lifecycle (`started`, `completed`, `skipped`, `failed`) for every file fix attempt.  
- Aggregates final results into a `FixStageOutput` object containing patched violations and those that could not be fixed.

**Notable Invariants**  
- Violations must be grouped by source file before fix prompts are generated.  
- No patch is applied without prior validation to prevent file corruption.  
- After applying a patch, the file is always rechecked for remaining violations.  
- The stage strictly adheres to the task‑stage‑boundary rule: it does not handle CLI argument parsing or unrelated orchestration.

**Negative Scope (Out‑of‑Scope)**  
- Command‑line parsing or argument handling.  
- Any service orchestration outside the fix stage.  
- UI or terminal rendering beyond basic logging via `ctx.runtimeIO`.  
- Direct rule loading or engine instantiation (the stage uses `ctx.ruleEngine`).

**Public Surface**  
- Class `FixTask extends SpineTask<FixStageInput, FixStageOutput>`  
- `name = 'Architectural Auto-fix'`  
- `checkpointId = 'fix'`  
- Constants: `MAX_SCANS`, `MAX_FILE_SIZE_BYTES`