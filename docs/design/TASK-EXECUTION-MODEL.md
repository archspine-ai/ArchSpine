# Task Execution Model

This document explains how ArchSpine runs `scan`, `check`, `fix`, and `sync` today.
The goal is to keep the runtime deterministic while preserving the current product shape:

- CLI remains the entrypoint
- services own orchestration and lifecycle
- tasks do one stage of work at a time
- shared state is narrowed instead of used as a hidden data bus

## Why this matters

ArchSpine does not gain much from a loose, implicit pipeline.
The project exists to make repository semantics explicit and governable, so the execution model should follow the same rule.

The main risks this model avoids are:

- order coupling between tasks
- hidden dependencies on mutable state
- retries that leak stale runtime data
- runtime logic that becomes hard to reuse in other entry points

## The current model

### 1. Stage input and output are explicit

Each task accepts a typed input and returns a typed output.

That means a pipeline step depends on the previous stage through data contracts, not through a shared object that has to be remembered in the right order.

Examples:

- `scan` produces the file selection that feeds extraction
- AST extraction produces skeleton and support metadata that feeds summarize and validate
- summarize produces pending commit data that feeds state commit
- state commit produces the committed selection that feeds reverse index and aggregation
- fix consumes a typed violation set and returns files to recheck

### 2. `TaskContext.state` is telemetry only

The shared `state` object is now reserved for execution telemetry:

- usage counters
- warning records
- diagnostics snapshots

It is no longer the primary place where pipeline data moves from one task to another.

### 3. `TaskContext.runtimeCache` holds transient artifacts

Some tasks still need short-lived runtime artifacts during a single run.

Those live in `runtimeCache`, not in `state`:

- file skeletons
- unsupported file markers
- pending commit buffers

`runtimeCache` is treated as run-local storage, not as the pipeline contract.

### 4. Services own orchestration

`check-service`, `sync-service`, and `fix-service` decide:

- which tasks run
- what typed input each task receives
- how retries are reset
- when locks are acquired or released

That keeps orchestration in the service layer instead of scattering it across tasks.

### 5. CLI stays thin

The CLI should parse arguments, choose the service, and present user-facing output.
It should not become the place where pipeline rules, stage wiring, or retry state live.

## Current pipeline shape

The main flows are now explicit:

- `scan -> ast -> validate`
- `scan -> ast -> summarize -> state-commit -> reverse-index -> aggregation`
- `violations -> fix -> recheck scan -> revalidate`

This is intentional.
The pipeline reads like a data flow instead of a series of side effects.

## Build vs Sync vs Publish lifecycle in the task model

- `build` is the heavy baseline lifecycle. It establishes or rebuilds the trusted `.spine` baseline for first-run setup, recovery, and major semantic shifts.
- `sync` is optimized as the machine lifecycle. In non-full mode, runtime overrides enforce `generationStrategy=json-only`, so the loop prioritizes index freshness and AI-agent map quality.
- `publish` is the human lifecycle boundary. It runs preflight, refreshes JSON via lightweight sync, attempts Atlas Markdown backfill through `DocumentBackfillTask` when text-generation is available, and refreshes `.spine/view/**` as part of the same flow when that experimental layer is enabled.
- When a non-full, non-hook incremental sync processes files without Atlas regeneration, the runtime sets `.spine/.stale` so agents and MCP clients can detect documentation lag.

## Dual-layer short-circuit behavior in summarize/aggregation

- **L1 pre-LLM skip**: summarize checks whether current AST `skeletonHash` matches previous indexed identity. If yes, it recovers the previous semantic block and bypasses LLM generation entirely.
- **L2 post-LLM propagation gate**: after LLM generation, summarize computes `semanticHash`. The current implementation uses that hash to decide whether the file contributes to summarize-stage `affectedDirs`; later aggregation may still re-run when parent index artifacts are older than rewritten child JSON.
- Together these gates reduce token usage and aggregation churn while preserving deterministic machine outputs for sync-first workflows.

## What this buys us

- less hidden coupling between steps
- easier unit testing for each stage
- clearer retry behavior
- simpler future server or daemon entry points
- lower risk when adding new tasks

## What not to do

Avoid reintroducing the old implicit pattern.

- Do not pass new pipeline facts through ad hoc fields on `TaskContext.state`
- Do not make tasks depend on side effects from an earlier task unless that dependency is expressed in the input type
- Do not use `runtimeCache` as a cross-stage contract
- Do not put CLI interaction inside task logic when it can live in runtime I/O or the service layer

## Related docs

- [Prompt Engine](PROMPT-ENGINE)
