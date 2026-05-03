# Current Capabilities

This page summarizes what the current `v1.0.x` line already implements today.

It is intentionally narrower than the design docs: this page describes shipped behavior, not roadmap intent.

## Core workflow

ArchSpine currently supports the full repository control-plane loop:

- `spine init` bootstraps `.spine/` config, rule templates, Git strategy choices, and optional host integration files.
- `spine build` performs a full baseline rebuild for initialization, recovery, and trusted regeneration.
- `spine sync` performs the normal incremental runtime refresh for day-to-day development.
- `spine publish` refreshes the distributable snapshot and backfills human-readable Atlas Markdown from the current index baseline.
- `spine check` and `spine fix` enforce and repair rule-governed repository constraints.
- `spine remove` removes ArchSpine-managed repository integration.

## Runtime boundaries

The current writer split is explicit:

- `sync` is the local runtime refresh boundary.
- `publish` is the maintainer-facing distribution snapshot boundary.
- MCP remains read-only and does not write `.spine`.
- MCP surface now includes explicit status and health tools (`spine_get_sync_status`, `spine_get_baseline_status`, `spine_get_violations_summary`) to inform agents about runtime freshness and governance status.

In the current line, ordinary incremental `sync` defaults to a machine-first refresh centered on `.spine/index/**`, while `publish` is responsible for Atlas Markdown backfill.

## Failure recovery

The current release line includes several explicit recovery behaviors:

- `spine sync --repair-violations` repairs protected generated outputs when policy can safely narrow the repair scope.
- `spine sync --retry-failed` re-runs only failed `summarization` and `state-commit` files from the latest sync checkpoint instead of forcing a full rebuild.
- `spine publish` can backfill missing or stale Atlas Markdown when the index baseline already exists.

The practical split is:

- use `publish` when Atlas docs are stale or missing
- use `sync --retry-failed` when the sync pipeline itself failed on a limited file set
- use `build` when the runtime baseline is incomplete or broader recovery is required

## Atlas behavior

Atlas generation is now hardened in two important ways:

- stale `.spine/atlas/<locale>/` directories are pruned when the configured project locale set shrinks
- if a summarization request asks for markdown output but the model returns no markdown block for any requested locale, the file is marked failed instead of being recorded as a misleading partial success

This prevents two common failure modes:

- old locale trees such as `English/` lingering after the repo was reduced to Chinese only
- `.spine/index/**` being updated while the matching Atlas markdown silently fails to materialize

## View layer

The experimental view layer is already implemented as a derived reading aid under `.spine/view/`.

Current outputs:

- `public-surface.json`
- `risk-hotspots.json`

Current behavior:

- `public-surface` and `risk-hotspots` are enabled by default when the experimental view layer is on
- these outputs are non-authoritative reading aids, not the primary source of truth

## LLM runtime

The current CLI already exposes:

- provider/model setup and inspection
- runtime `mode` as the main user-facing control surface
- diagnostics and traceability in the runtime manifest and sync summary
- local-LLM-compatible provider configuration through the existing LLM command surface

## Recommended reading order

If you are orienting a repository or evaluating the shipped product surface, read in this order:

1. [Quick Start](../tutorials/quick-start)
2. [Runbook](../how-to/RUNBOOK)
3. [View Layer](../explanation/VIEW-LAYER)
4. [MCP Integration](../how-to/MCP)
5. [Protocol](../reference/PROTOCOL)

## Feature Maturity Matrix

| Feature Module                           | Config Key / Entry                                        | Exposure Level              | Maturity              | Description                                                                                                                                                                                 |
| :--------------------------------------- | :-------------------------------------------------------- | :-------------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Experimental View Layer**              | `artifacts.experimentalViewLayer`<br>`spine view` command | Opt-in                      | **Experimental**      | Functional, but artifact format is not finalized; view collections and naming conventions may change before v1.1                                                                            |
| **Risk Hotspots View (risk-hotspots)**   | `artifacts.enabledViews`                                  | View child                  | **Experimental**      | Part of View Layer; marked `experimental: true` in code                                                                                                                                     |
| **Public Surface View (public-surface)** | `artifacts.enabledViews`                                  | View child                  | **Experimental**      | Part of View Layer; marked `experimental: true` in code                                                                                                                                     |
| **God Mode**                             | `spine god` command                                       | CLI command                 | **Non-Production**    | Explicitly commented as "not a production feature"; used for manual offline holistic review, artifacts are one-off docs without backward compatibility guarantees, overwritten on each run  |
| **MCP Enhanced Tools**                   | MCP STDIO Server                                          | Protocol Integration        | **Stable**            | Officially released features; `spine_get_sync_status`, `spine_get_baseline_status`, `spine_get_violations_summary` are part of the core MCP protocol, not experimental features             |
| **Semantic-First Mode**                  | Internal to `heavy` mode                                  | **Internal Implementation** | **Stable (Internal)** | Underlying LLM prompt execution path automatically activated in `heavy` mode, completely transparent to the user; should not be exposed, users only need to care about `llm.mode` selection |

### Future Plans

| Feature        | Expected Status Change                                                | Target Version |
| :------------- | :-------------------------------------------------------------------- | :------------- |
| View Layer     | Remove `experimental` tag, enter stable API                           | v1.1           |
| God Mode       | Evaluate whether to keep, or explicitly position as a `debug` command | v1.1           |
| Semantic-First | Maintain as internal implementation, do not expose to users           | Ongoing        |
