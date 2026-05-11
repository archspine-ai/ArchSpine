# ArchSpine Semantic Protocol Specification (v1.0.0)

This specification describes the current `v1.0.x` implementation of ArchSpine: the `.spine/` directory model, the index contract, and the runtime behaviors that are already shipped today.

## 1. Machine-first design

`.spine/` is first a structured semantic object with derived human-readable views for indexed repository inputs. The goal is to make repository semantics consumable by IDEs, agents, CI systems, and governance tooling.

In the current open-source line, the default semantic mirror is intentionally centered on code, schemas, repository automation, and the `.spine` control plane itself. Human-facing repository docs such as `docs/**`, `README*`, `CONTRIBUTING.md`, and `SECURITY.md` usually remain authoritative in their original location and are excluded from the default `.spine` mirror unless a repository opts in differently.

## 2. Physical layout

```text
.spine/
├── manifest.json       # Human-readable summary view
├── cache.db            # Core SQLite state store
├── index/              # Machine-readable semantic index
│   └── src/
│       └── auth.ts.json
├── view/               # Derived JSON reading layer (opt-in)
│   ├── public-surface.json
│   └── risk-hotspots.json
└── rules/              # Architecture rules in YAML
```

Protected outputs in the current line:

- `.spine/index/**`
- `.spine/view/**`
- `.spine/cache.db*`
- `.spine/.lock`

ArchSpine CLI/runtime is the authoritative writer for these official `.spine` outputs. MCP and ordinary local agents are not formal `.spine` writers.

Runtime-local but non-distributable `.spine` files also include:

- `.spine/protected-output-baseline.json`

These files are operational state, not semantic snapshot outputs.

## 3. Core runtime mechanisms

### 3.1 Sync engine

- `ScanPolicy` defines file sources and ignore-chain behavior
- repo paths are normalized to repo-relative POSIX-style paths
- state updates are committed atomically through SQLite-backed flows
- `.gitignore`, `.spineignore`, and `.spineignore.local` are composed through an ordered ignore chain
- the default product boundary keeps code, schemas, and repository automation such as `.github/workflows/**` indexable while usually excluding human-facing repository docs from the semantic mirror
- incremental sync uses Git and hash-aware change detection
- deleted source files are cleaned up as orphaned index entries

### 3.2 Skeleton-first extraction

- AST extraction captures deterministic import/export structure
- semantic generation builds on top of skeleton facts instead of replacing them
- recent Git intent can be injected to explain why a file changed

### 3.2.1 Dual-layer semantic short-circuiting

- **L1 (pre-LLM)**: ArchSpine hashes AST import/export structure as `skeletonHash`. If it is unchanged from the previous unit, LLM summarization is bypassed entirely (0 token usage for that file).
- **L2 (post-LLM)**: if `skeletonHash` changed, ArchSpine still computes `semanticHash` from semantic role/responsibility/public-surface footprint. This hash currently gates whether the file is added to summarize-stage `affectedDirs`; later folder/project aggregation may still run if index-document mtimes indicate parent artifacts are stale.
- This two-layer design keeps `sync` fast and token-efficient while preserving semantic correctness in aggregation.

### 3.3 Layered aggregation

- file level: role, responsibilities, invariants, graph edges
- folder level: `folder.json` plus derived `folder.md`
- project level: `project.json` plus derived `project.md`

### 3.4 View derivation

When `artifacts.viewLayer=true` or `SPINE_VIEW_LAYER=true`, the post-aggregation writer path may also derive:

- `public-surface.json`
- `risk-hotspots.json`

This layer is:

- derived from indexed and aggregated signals
- non-authoritative
- intended for fast comprehension
- intentionally outside the stable public artifact contract for the first open-source `v1.0` release

### 3.5 Writer path inventory and boundary contract

Current trusted writer paths:

- `spine sync` (default): refreshes local machine runtime state (`.spine/index/**`, `.spine/cache.db*`, `.spine/.lock`) and protected-output baseline updates
- `spine build`: heavyweight baseline rebuild path that can regenerate all `.spine/` artifacts
- when enabled, the trusted `sync` writer path may also write `.spine/view/**`
- `spine sync --hook`: refreshes the hook-oriented runtime subset and the same baseline
- `spine check` / `spine fix`: update local runtime state in `.spine/cache.db*` and coordinate with `.spine/.lock`
- `spine publish`: maintainer publish workflow that first runs publish preflight, performs a lightweight sync refresh for JSON indexes, then refreshes `.spine/view/**` when the view layer is enabled. It requires an existing runtime baseline (`.spine/manifest.json` plus `.spine/protected-output-baseline.json`) and fails closed if `.spine/.lock` is active, stale, not owner-verifiable, or stored in a corrupt/unsupported legacy format

Current host deployment convention:

- ordinary agents run in a writable repository for normal source work
- protected `.spine` outputs remain read-only by default
- `.spine/view/**` follows the same protected-output posture when enabled
- trusted `spine` write paths temporarily unlock and then re-lock those outputs
- the baseline file plus mutation warnings are soft-gate layers for exposing out-of-band edits, not a replacement for strong host isolation
- this model reduces accidental same-user writes in normal workflows; it does not claim to stop malicious same-permission processes

### 3.6 MCP observability surface

ArchSpine exposes a Model Context Protocol (../how-to/MCP) server over STDIO for AI tool integration.

- **Posture**: Read-only. The MCP surface does not provide `.spine` or general repository write APIs.
- **Resource model**: Maps the `.spine` directory structure to semantic URIs (`spine://project`, `spine://folder/{path}`, `spine://file/{filePath}`).
- **Observability tools**: Exposes runtime status, sync freshness, architectural invariants, and governance violations to agents via a standard tool schema.
- **Context gating**: Supports optional gating modes (`project-first`, `search-first`) to enforce structured context acquisition patterns for connected agents.

## 4. Index contract

Each indexed file is stored as a `SpineUnit` in `.spine/index/<path>.json`.

Key slices:

1. identity: file path, hash, language, file kind, scope
2. semantic: role, responsibilities, out-of-scope statements, invariants, public surface, and **localized content** (translations).
3. skeleton: deterministic AST facts
4. graph: dependency edges and related structure
5. provenance: generation metadata

Additional runtime signals:

- `ruleViolations`
- `driftDetected`
- `driftReason`
- `_thinking`: (Validation mode only) Chain-of-Thought scratchpad.

## 5. v0.4 changes

Compared with v0.3, the `v0.4` line introduced:

- **Headless Generation**: Shifting from prose generation to data-centric JSON extraction.
- **Deterministic View Generation**: Local rule-based view generation from indexed data.
- **Multilingual Indexing**: Support for the `localized` field in `SpineSemantic` to hold multiple language summaries.
- **Intelligence Primitives**: Integration of Few-Shot examples and Chain-of-Thought (CoT) reasoning for higher precision.
- SQLite-backed state via `cache.db`
- centralized tracking of violations and usage logs
- `manifest.json` as a summary view rather than the only source of truth
- protocol and implementation version alignment
- semantic drift detection and persisted drift history
- stronger transactional write behavior and lock handling

## 6. SQLite tables

Current core tables:

- `files`
- `violations`
- `usage_logs`
- `drift_events`
- `symbols`

## 7. Runtime characteristics in the current line

The shipped `v1.0.x` line already includes:

- task-based execution flows with explicit stage input/output contracts
- `TaskContext.state` reserved for telemetry, with transient stage artifacts held in `runtimeCache`
- serial task orchestration with timing and logging
- file-lock coordination on top of SQLite transactions
- CLI surfaces that expose runtime progress and health clearly

## 8. Manifest summary view

`manifest.json` is a human-readable summary surface, not the primary source of truth. In the current line it includes a sync summary with:

- sync mode and duration
- aggregate counters and token usage snapshots
- latest resolved LLM provider/model metadata

The sync LLM summary records:

- `provider`
- `providerSource`
- `model`
- `modelSource`

This metadata is intended for runtime traceability so users can see which resolved model produced the current `.spine` state.
