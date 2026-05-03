# ArchSpine Pipeline Tasks

This directory contains the concrete task implementations that drive the ArchSpine pipeline execution graph. Each file represents a single pipeline stage responsible for a specific processing step, from filesystem scanning to state commitment. The tasks are designed to execute in a defined order, support resumability through checkpoints, and can be run concurrently where appropriate.

## Role and Responsibility

The tasks collectively implement the core pipeline phases: scanning, reconciliation, AST extraction, summarization (both full and lightweight), validation, fix generation, aggregation, reverse indexing, view derivation, and final state commitment. They ensure that ordered execution is maintained and that the pipeline can be resumed from any checkpoint in case of interruption.

## Grouping of Notable Children

The tasks can be grouped by the pipeline phase they belong to:

### Scanning and Reconciliation
- **`scan-cleanup.ts`** – Scans the filesystem for orphaned and changed files, updates the manifest accordingly.
- **`reconcile.ts`** – Synchronizes the manifest with the actual repository state, validates index documents, and updates cache metadata.

### AST Extraction
- **`ast-extra.ts`** – Extracts AST skeletons from source files, registers them in the runtime cache, and handles unsupported files.

### Summarization
- **`summarize.ts`** – Full LLM-based semantic summary generation from extraction output.
- **`lite-summarize.ts`** – Lightweight summarization that processes filtered files and delegates to a dedicated method.

### Validation and Fixing
- **`validate.ts`** – Orchestrates LLM-powered architectural rule compliance checks, normalizes violations.
- **`fix.ts`** – Generates and applies automated patches for architectural violations using LLM and AST analysis.

### Aggregation and Indexing
- **`aggregate.ts`** – Hierarchical content aggregation of directories and projects.
- **`reverse-index.ts`** – Constructs reverse dependency edges from forward dependency index files.

### Derivation and Commitment
- **`view-derivation.ts`** – Derives architectural views (public surface, risk hotspots, architecture diagram) based on configuration.
- **`post-commit-derivation.ts`** – Orchestrates view derivation, aggregation, and reverse indexing after the main commit stage.
- **`state-commit.ts`** – Commits file state and metadata to the SQLite database after extraction and summarization.

### Auxiliary
- **`document-backfill.ts`** – Backfills project documentation by generating markdown from JSON data via LLM, with idempotency support.

## Key Implementation Areas

The most important implementation concerns are:
- **Checkpoint-based resumability** – Every task integrates with the execution checkpoint system to allow the pipeline to resume from a saved state.
- **Concurrency control** – Tasks like `summarize.ts`, `fix.ts`, and `document-backfill.ts` use `p-limit` to regulate parallel execution and respect API rate limits.
- **Idempotency and state tracking** – Tasks carefully manage file states (started, skipped, completed, failed) and use hash comparisons to avoid redundant work.
- **Integration with external LLM services** – Several tasks depend on AI models for summarization, validation, fix generation, and documentation; they include prompt building, structured response parsing, and token usage tracking.

Concrete submodules such as `aggregate.ts`, `ast-extra.ts`, `fix.ts`, and `state-commit.ts` are considered the core building blocks of the pipeline and should be referenced directly when discussing pipeline architecture.