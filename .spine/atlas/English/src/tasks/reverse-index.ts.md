<!-- spine-content-hash:79d2295362c3ad8b3b19cd2fee511c09c39b19211cde3aa955568f771490fd9f -->
# ArchSpine – ReverseIndexingTask

## Role
Core pipeline task for constructing reverse dependency edges from forward dependency index files.

## Key Responsibilities
- Checks if reverse indexing is already complete and skips when no new commits exist.
- Iterates over all tracked files to read cached forward dependency index documents.
- Validates index document compatibility and reports read issues via infrastructure utilities.
- Constructs reverse edge mappings from target to dependent source files.

## Notable Invariants & Negative Scope
- Task must only perform stage-local work on top of core contracts and engines.
- Task must not take over CLI command parsing or unrelated service orchestration.
- Out of scope: CLI command parsing or argument handling, unrelated service orchestration or cross-stage coordination, direct file system mutation beyond index reading and reverse edge construction.

## Most Important Exported / Externally Visible Behavior
- **Class:** `ReverseIndexingTask` (extends `SpineTask<CommitStageOutput, void>`)
- **name property:** `'Reverse Dependency Indexing'`
- **checkpointId property:** `'reverse-index'`
- **execute method:** `execute(ctx: TaskContext, input: CommitStageOutput): Promise<void>`