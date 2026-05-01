<!-- spine-content-hash:7f7810704c0660b198c5d7b6d6403e13185e9393662b7ca85c0b70a660857dd5 -->
# ArchSpine Check Service

## Role
Service facade orchestrating the ArchSpine 'check' command pipeline, coordinating scanning, AST extraction, validation, and usage recording within a managed runtime session.

## Key Responsibilities
- Orchestrates the sequential execution of scanning, cleanup, AST extraction, and validation tasks via a TaskRunner.
- Manages runtime session lifecycle and execution checkpoints for resumable operations using `runWithRuntimeSession` and `deriveCheckResumeCandidateFiles`.
- Records usage metrics and validation summaries into the project manifest via `context.manifest.recordUsage`.
- Handles errors, logs stage-specific metrics (file counts, byte sizes), and formats byte counts for human-readable output.

## Notable Invariants & Negative Scope
- The check pipeline must always execute within a runtime session managed by `runWithRuntimeSession`.
- Execution checkpoints must be derived via `deriveCheckResumeCandidateFiles` before starting a run.
- Usage metrics must be recorded into the manifest after pipeline completion.
- **Out of scope:** Direct file system I/O (delegated to RuntimeIO), LLM client configuration and secret resolution (delegated to infra/llm and infra/secrets), task implementation details (scanning, AST extraction, validation logic), and execution profile resolution (delegated to runtime-execution-profile).

## Public Surface
- `CheckService`
- `CheckServiceOptions`