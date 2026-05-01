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

- [Strategy](STRATEGY)
- [Task Execution Model](TASK-EXECUTION-MODEL)
- [Git Artifact Strategy](GIT-ARTIFACT-STRATEGY)
- [Prompt Engine](PROMPT-ENGINE)
