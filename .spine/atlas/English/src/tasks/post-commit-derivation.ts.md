<!-- spine-content-hash:1a1308272f006dd420efe7f0c7bf5a3bcc0d3dc00a2901b513f50ae938fadc95 -->
# PostCommitDerivationTask — Source Summary

**Role:** Pipeline stage task orchestrating post-commit derivation of views, aggregations, and reverse indices.

**Key Responsibilities:**
- Orchestrates sequential execution of `AggregationTask`, `ReverseIndexingTask`, and `ViewDerivationTask` via `TaskRunner`.
- Clears stale view artifacts before derivation using `ViewService.clearViewArtifacts`.
- Iterates over `VIEW_DEFINITIONS` to derive per-view artifacts.
- Acts as the post-commit stage in the ArchSpine pipeline, consuming `CommitStageOutput` and producing `void`.

**Notable Invariants:**
- Must be executed after the commit stage completes successfully.
- Must clear view artifacts before running derivation tasks to avoid stale state.
- Must run sub-tasks in the defined order: aggregation, reverse indexing, then view derivation.

**Negative Scope (Out of Scope):**
- Does not handle CLI command parsing or user input.
- Does not implement individual aggregation, indexing, or view derivation logic.
- Does not manage database connections or schema migrations.
- Does not perform authentication or authorization.

**Most Important Exported / Externally Visible Behavior:**
- `PostCommitDerivationTask` (class, extends `SpineTask<CommitStageOutput, void>`)
- `name` property: `'Post-Commit Derivation'`
- `checkpointId` property: `'post-commit-derivation'`