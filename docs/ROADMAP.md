# ArchSpine Roadmap

> Git-native architectural intelligence for the AI era — an open protocol and toolchain that builds a `.spine/` control plane inside every repository.

## What's Delivered (v1.0.0)

### Core Pipeline

- **Semantic Indexing** — AST extraction + LLM summarization produces per-file `.spine/index/*.json` with roles, responsibilities, invariants, and dependency edges for every tracked file.
- **Localized Descriptions** — Per-file semantic summaries in `localized.English` JSON within `.spine/index/*.json`.
- **Incremental & Full Sync** — Changed-file detection with content-hash caching; full rebuilds regenerate the entire control plane.
- **Interrupt Recovery** — Checkpoint-based resume so long-running syncs survive network failures without losing progress.

### Architecture Governance

- **Rule Engine** — Glob-matched architecture rules in `.spine/rules/*.yml` (YAML). Rules define layer boundaries, dependency constraints, and protected output directories.
- **Automated Checking** — `spine check` validates the codebase against rules and surfaces violations with severity levels.
- **Protected Outputs** — Directories marked as protected are guarded against unauthorized writes; violations are surfaced in sync summaries.

### Knowledge Graph (v2)

- **Module-Level Graph** — `buildGraph()` aggregates per-file dependency edges into a module topology with fanIn/fanOut/violationCount metrics, written to `.spine/view/knowledge-graph.json`.

### Diagnostics Engine

- **Cycle Detection** — DFS-based cycle finder identifies circular dependencies with full path chains and cycle IDs.
- **Dead Code Heuristics** — Zero-fanIn analysis flags modules with no incoming dependencies, annotated with confidence levels.
- **Hub Detection** — P95 percentile fanIn ranking surfaces architectural chokepoints.
- All diagnostics written to `.spine/view/diagnostics/{cycles,dead-code,hubs}.json`.

### MCP Tools (21 total)

| Tool                            | Description                                          |
| ------------------------------- | ---------------------------------------------------- |
| `spine_query_invariants`        | Query architecture invariants by ID or file          |
| `spine_query_responsibilities`  | Search modules by role/responsibility keywords       |
| `spine_match_semantic`          | Semantic search: find modules by keyword             |
| `spine_query_graph`             | Query module graph by from/to/type/compliant/layer   |
| `spine_get_module_context`      | Full module dossier: deps + violations + diagnostics |
| `spine_get_file_context`        | Full governance context for a single file            |
| `spine_get_change_impact`       | BFS impact radius for a given file                   |
| `spine_get_drift_history`       | View semantic drift events for a file                |
| `spine_get_sync_status`         | Check if the control plane is stale                  |
| `spine_get_baseline_status`     | Baseline health and publish readiness                |
| `spine_get_violations_summary`  | Summary of all rule violations                       |
| `spine_get_diagnostics`         | Get cycles / dead-code / hubs reports                |
| `spine_get_config`              | Read configuration values                            |
| `spine_get_view_data`           | Read generated view data (JSON)                      |
| `spine_list_resource_templates` | List available `spine://` resources                  |
| `spine_preview_scan`            | Preview what files would be indexed                  |
| `spine_run_scan`                | Trigger scan directly from MCP                       |
| `spine_run_sync`                | Trigger sync directly from MCP                       |
| `spine_get_semantic_diff`       | Compare two files at the architecture level          |
| `spine_check_operation`         | Validate file operations against rules               |

### Views (9 producers)

| View                 | Output                                       | Description                                                            |
| -------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| public-surface       | `.spine/view/public-surface.json`            | Public API surface: CLI, MCP, config, routes, exported modules         |
| risk-hotspots        | `.spine/view/risk-hotspots.json`             | Scored risk ranking with additive scoring factors                      |
| architecture-diagram | `.spine/view/pages/architecture-diagram.svg` | Deterministic layered SVG with compliance-colored edges                |
| agent-briefing       | `.spine/view/pages/agent-briefing.md`        | 6-section project dossier for AI agents                                |
| project-health       | `.spine/view/pages/project-health.md`        | 5-section health report: topology, cycles, dead code, hubs, violations |
| SPINE.md             | `.spine/SPINE.md`                            | Self-describing entry point for agents discovering `.spine/`           |

### Agent Distribution

- **Claude Code Skill** — `spine skill install` places a skill definition that guides agents to read `.spine/` artifacts and use MCP tools. Reminder policy: max once per repo per day.
- **Agent Instruction Injection** — `spine init` / `spine sync` injects V2 briefing blocks into `AGENTS.md` / `CLAUDE.md`, activating only when `.spine/` exists.

### CI Integration

- GitHub Actions template (`.github/workflows/spine-sync.yml.example`)
- GitLab CI template (`.gitlab-ci.spine.yml.example`)

### Multi-Language AST Support

TypeScript, Go, Python, Rust, Java, C, C++, Ruby, PHP, Swift, Kotlin, Scala, Elixir (16 languages).

---

## What's Next

### Phase A: Smarter Agent Consumption

- **Agent Tool Recommendations** — Teach the skill to suggest the right MCP tool for a given question (e.g., "what depends on X?" → `spine_query_graph`).
- **Multi-Agent Briefing** — Per-directory agent briefing files for monorepos, so an agent focused on `packages/auth/` doesn't need the full repository briefing.
- **Change Impact in PR Workflows** — Automated `spine_get_change_impact` posting on PRs so reviewers see the blast radius before reading code.

### Phase B: Code Wiki

A Qoder-alternative wiki generator that produces one page per module:

- Module overview with role/responsibility/constraints
- Compliance dashboard (active violations, severity, trends)
- Dependency diagrams with violation edges highlighted
- Public API contracts (signatures, schemas, error patterns)
- Change history and drift events

**Differentiator vs. Qoder**: ArchSpine wikis are git-native, auto-refreshed on every sync, and cross-reference architecture rules — no separate app, no manual maintenance.

### Phase C: Pluggable Producer SDK

- Stable `ViewProducer` interface with standard input/output contracts
- `spine view create <name>` scaffolding command
- Community producer registry (git repo, not a website): `awesome-archspine-views`
- Producer distribution via npm packages or single-file scripts

### Phase D: Decision Intelligence

- **Change Impact View** — On-demand: "if I change this file, what breaks?" Full transitive dependency tree + affected tests + affected rules.
- **Module Contract Extraction** — Per-module API contracts: function signatures, type interfaces, I/O schemas, error handling patterns.
- **Semantic Search Index** — Structured search across all indexed semantics: "which module handles authentication?" answered without grep.

---

## What We Won't Build

- **No SaaS platform** — Git is the distribution channel. `.spine/` is just files.
- **No proprietary model** — We do data, not models. Any LLM provider works.
- **No real-time sync** — Follow the `spine sync` rhythm. Commit → sync → push.
- **No non-git support** — The control plane lives in the repo; no git = no distribution.
