<!-- spine-content-hash:ddfcec642fb8336dc8045887a380a2dca7a572452cb8b780fe779b94d40cbec2 -->
# LiteSummarizationTask

**Role:** Pipeline task for lightweight source code summarization, processing filtered files from the extraction stage and delegating to a dedicated summarization method.

## Key Responsibilities

- Processes filtered source files from the extraction stage output.
- Identifies unsupported files and skeleton files to skip processing.
- Uses `LangRegistry` to determine if a file is a source file eligible for summarization.
- Reads file content and delegates summarization to a dedicated `summarizeFile` method.
- Tracks task usage, skipped files, failed files, and processed files via task-state functions.
- Manages concurrency with `pLimit` for parallel file processing.

## Out of Scope

- CLI command parsing or argument handling.
- Orchestration of services unrelated to the summarization pipeline stage.
- Direct interaction with external APIs or databases beyond file system reads.

## Invariants

- Task modules should implement stage-local work on top of core contracts and engines.
- Task modules should not take over CLI command parsing or unrelated service orchestration.

## Public Surface

- `LiteSummarizationTask` class (exported)

## Change Intent

**Architectural intent:** Provide a lightweight, concurrency-controlled summarization task that operates strictly within the pipeline stage boundary, processing only files from the extraction stage and delegating summarization to a dedicated method.

**Recent change intent:** Fix lint warnings and type errors, and add CI workflow support.