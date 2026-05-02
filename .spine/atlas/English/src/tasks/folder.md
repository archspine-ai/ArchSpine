<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/tasks","role":"Pipeline task orchestration and execution layer for the ArchSpine mirror system.","responsibility":"Implements and coordinates all pipeline stages including scanning, AST extraction, lightweight and full summarization, architectural validation, automated fixing, documentation backfill, reverse indexing, view derivation, and state commitment. Each task module encapsulates a specific stage, manages its lifecycle (checkpoints, concurrency, caching), and produces structured output for downstream stages.","children":[{"filePath":"src/tasks/aggregate.ts","role":"Core pipeline task for hierarchical content aggregation across directories and projects.","fileKind":"source"},{"filePath":"src/tasks/ast-extra.ts","role":"Core pipeline task for AST extraction and symbol registration within the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/tasks/document-backfill.ts","role":"Pipeline task module for backfilling project documentation by generating markdown content from JSON data via LLM prompts, with content hash tracking for idempotency.","fileKind":"source"},{"filePath":"src/tasks/fix.ts","role":"SpineTask implementation for the automated LLM-driven architectural violation fixing stage in the pipeline.","fileKind":"source"},{"filePath":"src/tasks/lite-summarize.ts","role":"Pipeline task for lightweight source code summarization, processing filtered files from the extraction stage and delegating to a dedicated summarization method.","fileKind":"source"},{"filePath":"src/tasks/post-commit-derivation.ts","role":"Pipeline stage task orchestrating post-commit derivation of views, aggregations, and reverse indices.","fileKind":"source"},{"filePath":"src/tasks/reconcile.ts","role":"ArchSpine reconciliation task that synchronizes the manifest's file status with the actual repository state, validates index document compatibility, and updates cache metadata.","fileKind":"source"},{"filePath":"src/tasks/reverse-index.ts","role":"Core pipeline task for constructing reverse dependency edges from forward dependency index files.","fileKind":"source"},{"filePath":"src/tasks/scan-cleanup.ts","role":"Pipeline stage task for scanning the file system and cleaning up orphaned or stale files within the ArchSpine tracked state.","fileKind":"source"},{"filePath":"src/tasks/state-commit.ts","role":"Pipeline stage task for committing synchronized file state (hashes and metadata) to the SQLite database after AST extraction and LLM summarization.","fileKind":"source"},{"filePath":"src/tasks/summarize.ts","role":"ArchSpine summarization pipeline task module that orchestrates LLM-based semantic summary generation from source code extraction outputs.","fileKind":"source"},{"filePath":"src/tasks/validate.ts","role":"ArchSpine validation task orchestrator for LLM-powered architectural rule compliance checking.","fileKind":"source"},{"filePath":"src/tasks/view-derivation.ts","role":"Pipeline task stage that orchestrates the derivation of multiple architectural views (public surface, risk hotspots, architecture diagram) from committed changes using the ViewService facade.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T10:11:08.494Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/tasks` — Pipeline Task Orchestration Layer

This directory contains the full set of pipeline task modules that drive the ArchSpine mirror system’s processing stages. Each module encapsulates a single stage’s logic — from scanning the file system and extracting AST symbols, to generating lightweight and full summaries, validating architectural rules, applying automated fixes, backfilling documentation, building reverse indexes, deriving architectural views, and committing state changes to the SQLite database.

## Child Modules and Groupings

- **Scanning & Reconciliation**  
  `scan-cleanup.ts`, `reconcile.ts` — inspect the actual file system, clean orphaned entries, and synchronize the manifest with repository state.

- **AST Extraction**  
  `ast-extra.ts` — extracts AST-level symbols and registers them in the mirror’s symbol index.

- **Summarization (Lightweight & Full)**  
  `lite-summarize.ts`, `summarize.ts` — produce concise and then comprehensive semantic summaries via LLM calls.

- **Validation & Automated Fixing**  
  `validate.ts`, `fix.ts` — check architecture rule compliance and attempt LLM-driven corrections.

- **Documentation Backfill**  
  `document-backfill.ts` — generates missing markdown documentation from JSON data using LLM prompts, with content‑hash deduplication.

- **Reverse Indexing**  
  `reverse-index.ts` — constructs reverse dependency edges from forward index files.

- **View Derivation & Post-Commit Derivation**  
  `view-derivation.ts`, `post-commit-derivation.ts` — derive architectural views (public surface, risk hotspots, diagram) and run after state commit to generate aggregates and indices.

- **State Commitment**  
  `state-commit.ts` — writes hashes and metadata to the SQLite database after extraction and summarization.

- **Aggregation**  
  `aggregate.ts` — performs hierarchical content aggregation across directories and projects.

## Key Implementation Areas

- **Lifecycle Management** – each task handles checkpoints, concurrency, and caching to enable partial re‑runs and efficient incremental processing.
- **LLM Integration** – used in summarization, validation, fixing, and documentation backfill, with prompt templates and response parsing.
- **Persistence Abstraction** – state commit and reconciliation interact with SQLite via a unified data access layer.
- **Idempotency** – content hashing (in `document-backfill.ts`) and manifest comparisons ensure tasks are safe to re‑run.

Together these modules form a modular, extensible pipeline where each stage consumes the output of its predecessor and produces structured data for the next.