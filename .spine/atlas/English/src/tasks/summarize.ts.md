<!-- spine-content-hash:f6d13151caa484955a2da150b4c980aebf2af0812d328fa1d0c8729c7e1f25df -->
# ArchSpine Summarization Task Module

## Role
This module implements the summarization stage of the ArchSpine pipeline. It orchestrates LLM-based semantic summary generation from source code extraction outputs, acting as the bridge between raw extracted code and structured semantic representations.

## Key Responsibilities
- Implements the `SpineTask` interface to drive the summarization pipeline stage, consuming `ExtractionStageOutput` and producing `SummarizationStageOutput`.
- Filters source files from extraction stage outputs, skipping unsupported or non-source files via `LangRegistry.isSourceFile`.
- Builds prompt artifacts for each file using `buildSourcePromptArtifacts` to provide relevant LLM context.
- Manages concurrency with `pLimit` to control parallel summarization tasks.
- Constructs `SpineSemantic` and `SpineSkeleton` objects with proper schema versioning and generator metadata.
- Resolves previous semantic context for drift detection during summarization.

## Out of Scope
- CLI command parsing or argument handling.
- Direct file system traversal or source file discovery.
- Language-specific AST extraction or parsing logic.
- Service orchestration beyond the summarization pipeline stage.

## Invariants
- Must implement the `SpineTask` interface from `core/task.js`.
- Must consume `ExtractionStageOutput` and produce `SummarizationStageOutput`.
- Must use `LangRegistry` to validate source file types before processing.
- Must respect the task-stage-boundary rule by focusing on stage-local work.

## Public Surface
- `SpineTask` interface implementation
- `SummarizationStageOutput` type
- `buildSourcePromptArtifacts` function
- `LangRegistry.isSourceFile` method

## Change Intent
The architectural intent is to provide a reusable, concurrency-controlled task module for the summarization pipeline stage that integrates with core contracts and supports drift detection via previous semantic context. Recent changes resolved lint errors and finalized pipeline fixes before v1.0, ensuring alignment with the core task interface and protocol types.