## `.spine` — Root Configuration & State Management

This directory acts as the central nerve center of the ArchSpine mirror system. It holds every setting and record needed to run a synchronization cycle, enforce architecture, and diagnose what happened during a sync.

### What Lives Here

| Path | Purpose |
|------|---------|
| `config.json` | System-wide settings for scanning policy, pre‑commit hooks, sync mode, LLM provider selection, and MCP context mode. |
| `languages.json` | A registry of file extensions and the languages they map to (e.g., `.ts` → TypeScript), enabling file‑type detection and language‑aware processing. |
| `manifest.json` | A human‑readable health check and sync‑state snapshot. It records the last sync timestamp, mode (full/incremental), completion status, number of indexed units, LLM provider/model used, active violation count, and sync duration. The authoritative state lives in `.spine/cache.db`. |
| `rules/` | Architectural rule definitions that enforce **layer isolation** (e.g., API handlers may import from `domain` but not from `infrastructure`) and **documentation standards** (TSDoc comments required on public domain classes/methods). |
| `runtime/` | Execution logs for each sync run: pipeline stage statuses and timings, lists of processed files (for traceability), and metadata needed for resumption and hook behavior. |

### Key Implementation Areas

- **Scanning & Hooks** – `config.json` controls which files are ignored, which pre‑commit hooks run, and how sync mode behaves.
- **Language Support** – `languages.json` is the single source of truth for file‑type ↔ language mapping.
- **Health & State** – `manifest.json` provides a quick overview of the last sync’s health; it is updated after every sync.
- **Architecture Enforcement** – `rules/` holds DSL rules that the system checks against each file to prevent violations of layered architecture and documentation requirements.
- **Execution Traceability** – `runtime/` gives a detailed, step‑by‑step account of each sync pipeline, essential for debugging and audit.