# Architecture Overview

This document records the current architecture that ArchSpine has converged on after the execution-model and state-boundary cleanup.

It is intentionally descriptive, not aspirational. The goal is to keep the current product shape stable while making the runtime model explicit.

## 1. Runtime boundaries

ArchSpine keeps a simple split:

- CLI is the user-facing entrypoint
- services own orchestration and lifecycle
- tasks handle one stage at a time
- infrastructure owns I/O, persistence, LLM, and host integration

That split matters because ArchSpine is a governance tool, not just a code generator.
The runtime must stay predictable enough for repository control-plane work.

## 2. Explicit stage flow

The main pipeline is now described by typed stage contracts instead of implicit shared state.

Current flows:

- `scan -> ast -> validate`
- `scan -> ast -> summarize -> state-commit -> reverse-index -> aggregation`
- `violations -> fix -> recheck scan -> revalidate`

Stage data moves through explicit input and output objects.
That avoids order coupling and makes each stage easier to test and reuse.

## 3. Shared state policy

`TaskContext.state` is telemetry only.

It is used for:

- usage counters
- warnings
- diagnostics snapshots

It is not the place where pipeline data is passed from one stage to the next.

Transient runtime artifacts live in `TaskContext.runtimeCache` instead:

- file skeletons
- unsupported file markers
- pending commit buffers

`runtimeCache` is run-local storage, not a cross-stage contract.

## 4. Service orchestration

`check-service`, `sync-service`, and `fix-service` are the orchestration layer.

They decide:

- which tasks run
- what input each task receives
- how retries reset local runtime state
- when locks are acquired or released

This keeps workflow logic out of task internals and keeps retries explicit.

## 5. Writer boundary

The trusted writer boundary remains strict:

- ArchSpine CLI/runtime is the authoritative writer for official `.spine` outputs
- MCP is read-only
- normal local agents are suggestion sources, not `.spine` writers
- this boundary is a collaboration and runtime-safety contract, not a hardened same-permission isolation layer

Protected outputs remain:

- `.spine/index/**`
- `.spine/atlas/**`
- `.spine/cache.db*`
- `.spine/.lock`

## 6. Artifact classification

`.spine/` is treated as a controlled repository control plane plus generated outputs.

The current artifact classes are:

- control-plane artifacts, such as `.spine/config.json` and `.spine/rules/**`
- local runtime state, such as `.spine/cache.db*` and `.spine/.lock`
- distributable snapshot artifacts, such as `.spine/index/**`, `.spine/atlas/**`, `.spine/manifest.json`, and `.spine/languages.json`

In the current product line, the default semantic mirror is intentionally not a second copy of all repository docs. Human-facing repository docs usually stay authoritative at their original paths, while code, schemas, repository automation, and `.spine` control-plane assets remain the primary mirrored surface.

That is why:

- `spine init` manages `.gitignore` and `.gitattributes`
- runtime state stays out of Git
- generated snapshots can be review-friendly when distributed

## 7. Current product posture

The current line is optimized for:

- deterministic extraction
- explicit governance
- durable semantic memory
- CLI-first workflows
- local MCP consumption

That makes ArchSpine usable today while preserving enough structure for future daemon or hosted MCP entry points.

## Related docs

- [Task Execution Model](../design/TASK-EXECUTION-MODEL)
- [Git Artifact Strategy](../design/GIT-ARTIFACT-STRATEGY)
- [Prompt Engine](../design/PROMPT-ENGINE)

---

# Strategy

ArchSpine is positioned as a semantic control plane for AI-assisted software engineering. The goal is not to generate prettier docs; it is to make repository structure explicit, queryable, and governable.

## The problem

Large repositories decay in predictable ways:

- God files absorb too much logic
- responsibilities blur across layers
- historical intent disappears as teams change

Traditional prompt-based AI workflows make this worse because they treat repository understanding as an ad hoc reconstruction problem.

## The thesis

ArchSpine addresses that problem with three core ideas:

1. deterministic extraction
2. explicit governance
3. durable semantic memory

### Deterministic extraction

Use AST-derived structure as the stable base so agents are not guessing at syntax or dependencies.

### Governance

Let teams declare architectural rules in `.spine/rules/`, then audit and repair against those rules.

### Semantic memory

Persist role, responsibility, and drift information so repository intent survives beyond individual contributors.

### Execution model

The runtime must match the strategy:

- pipeline steps should use explicit stage input/output contracts
- shared runtime state should stay narrow and readable
- transient artifacts should be kept separate from telemetry
- orchestration should live in services, not leak into task internals

This keeps ArchSpine deterministic enough to govern, while still being practical for CLI-first workflows and future MCP or daemon-style entry points.

## Open core boundary

Open-source layer:

- `.spine` protocol
- extractors
- base CLI
- local aggregation
- local MCP support

Commercial extensions, if pursued later, should focus on organization-scale control-plane value rather than basic repository generation.

## Strategic moat

ArchSpine sits inside four high-value workflow moments:

1. commit-time sync and repository hygiene
2. CI and PR-time governance
3. agent context retrieval through MCP
4. onboarding and repository comprehension

## Long-term goal

Make `.spine` feel as standard to AI-readable repositories as `package.json` feels to JavaScript projects.

## Related docs

- [Architecture Overview](../explanation/ARCHITECTURE-OVERVIEW)
- [Task Execution Model](../design/TASK-EXECUTION-MODEL)

---

# Engineering Principles & Technical Hardening

ArchSpine is built with industrial-grade resilience to ensure that architectural governance remains consistent even in large-scale, volatile development environments. This document outlines the core engineering principles and optimizations implemented in the current `v1.0.x` line.

## 1. Atomic Increment Detection (Hash Bypass)

To maintain a sub-second response time for Git Hooks, ArchSpine implements a "Fast-Path" for file change detection.

- **Mechanism**: The system stores the `mtime` (last modified time) and `size` of every tracked file in the local SQLite `cache.db`.
- **Optimization**: During the hashing phase, `Manifest.calculateHash` performs a shallow metadata check. If the disk metadata matches the database record, the system bypasses the expensive SHA-256 calculation and returns the cached hash.
- **Reliability**: This approach is independent of Git state, allowing the system to detect changes even if the developer bypasses pre-commit hooks or manually modifies files.

## 2. Graph Self-Healing (Resilience)

The architectural dependency graph (Reverse Index) is the foundation of ArchSpine's semantic reasoning. Ensuring its integrity is a top priority.

- **State Persistence**: The completion status of the reverse index is persisted in `.spine/manifest.json`.
- **Auto-Recovery**: If a sync operation is interrupted (e.g., process kill, power loss), the `ReverseIndexComplete` flag remains `false`. On the next run, the `ReverseIndexingTask` will force a full graph reconstruction regardless of file changes.
- **Consistency**: This prevents "Semantic Divergence" where the file summaries and the dependency graph become out of sync.

## 3. Memory-Safe Indexing (Streaming)

Processing repositories with 10,000+ files requires careful memory management to avoid Node.js OOM (Out of Memory) errors.

- **Selective Caching**: During graph construction, the `ReverseIndexingTask` only loads the `identity` and `graph` metadata from the index JSONs, skipping large fields like full content summaries or token usage arrays.
- **Atomic Rewriting**: Full `SpineUnit` objects are only reloaded from disk at the exact moment a write is required for a specific node, and are instantly discarded thereafter.
- **Scalability**: This ensures the peak memory footprint stays within 512MB-1GB even for massive codebases.

## 4. Root-Level Scan Pruning (Performance)

Scanning large projects with deep `node_modules` or `dist` folders can be a bottleneck in filesystem-based environments.

- **Recursive Pruning**: The `Scanner.walkFileSystem` method performs proactive pruning. Before recursing into a directory, it queries the `ScanPolicy` and `.gitignore` rules.
- **Short-Circuit**: If a directory is ignored at the root (e.g., `node_modules/`), the scanner prunes the entire branch immediately, avoiding thousands of unnecessary `stat` calls and recursive depth-checks.

## 5. Industrial-Grade Concurrency

ArchSpine utilizes a layered parallel model to maximize throughput during full or incremental syncs.

- **Depth-Parallel Aggregation**: Directories at the same depth in the filesystem tree are aggregated in parallel (concurrency: 20), effectively bubbling up semantic context to the root.
- **Exponential Backoff**: All LLM calls are wrapped in a resilient retry utility that handles socket resets, DNS issues, and API rate limits (429) using a jittered exponential backoff strategy (3 retries).
