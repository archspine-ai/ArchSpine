# ArchSpine Tasks Directory

This directory contains the core pipeline execution tasks that collectively drive the end-to-end mirror system stages. Each file implements a `SpineTask` responsible for a distinct phase: filesystem scanning and reconciliation, AST extraction, semantic summarization, architectural validation and automated fixing, aggregation, reverse indexing, view derivation, documentation backfill, state commitment, and post-commit orchestration.

**Key groupings and submodules:**

- **Scanning & reconciliation** – `scan-cleanup.ts` (orphan/change detection, output cleanup), `reconcile.ts` (manifest–filesystem sync, index document validation).
- **AST extraction** – `ast-extra.ts` (language detection, skeleton extraction, export registration).
- **Summarization** – `summarize.ts` (LLM-driven semantic summaries), `lite-summarize.ts` (lightweight variant for performance).
- **Validation & fixing** – `validate.ts` (LLM-powered architectural rule checks, violation normalization), `fix.ts` (automated patch generation and revalidation via AST-grep).
- **Aggregation** – `aggregate.ts` (hierarchical directory/project content aggregation with depth ordering).
- **Indexing & derivation** – `reverse-index.ts` (builds reverse dependency edges from forward indexes), `view-derivation.ts` (public surface, risk hotspots, architecture diagram views via `ViewService`).
- **Documentation** – `document-backfill.ts` (LLM-based markdown generation from JSON, hash-idempotent).
- **State management** – `state-commit.ts` (batched hash/metadata commit to SQLite after extraction and summarization).
- **Post-commit orchestration** – `post-commit-derivation.ts` (sequential execution of aggregation, reverse indexing, and view derivation after commits).

**Important implementation areas:** The extraction, summarization, and validation stages are the most computationally intensive, relying on concurrent processing (`p-limit`) and checkpoint resumability. The fixing stage integrates `@ast-grep/napi` for structural patches. All stages coordinate through a shared execution checkpoint and manifest for idempotency and partial-failure isolation.