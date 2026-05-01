<!-- spine-content-hash:c8ee286d6d83b88a58a80d34acf69105b40beefd5c046dee5c137bd09f88dd90 -->
# StateCommitTask — Pipeline Stage Summary

**Role:**  
A dedicated pipeline stage task responsible for committing synchronized file state (hashes and metadata) to the SQLite database after AST extraction and LLM summarization have completed successfully.

**Key Responsibilities:**
- Commits batched file state (hashes and metadata) to the SQLite database via the manifest system.
- Ensures database writes occur only after successful AST extraction and LLM summarization stages.
- Prevents write competition and partial failure contamination by coordinating with execution checkpoints.
- Logs commitment progress and updates checkpoint completion status.

**Out of Scope:**
- CLI command parsing
- Service orchestration beyond its own stage
- AST extraction or LLM summarization logic
- Direct file I/O or hash calculation

**Invariants:**
- Must implement stage-local work on top of core contracts and engines (`SpineTask`, `TaskContext`).
- Must not take over CLI command parsing or unrelated service orchestration.

**Public Surface:**
- `StateCommitTask` class

**Architectural Intent:**  
Provide a dedicated pipeline stage for atomic database commitment, ensuring data integrity after upstream processing. Recent refactoring of core task state contracts does not alter this stage's local focus.