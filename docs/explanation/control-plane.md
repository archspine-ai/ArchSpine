# Control Plane

## Why `.spine/` Is a Physical Directory

ArchSpine stores its entire control plane as files on disk — `.spine/` is a directory you can open, read, diff, and commit. This is a deliberate architectural choice: the control plane IS the artifact, not a view into one.

The control plane pattern separates **control data** (`.spine/` — rules, semantic index, views, knowledge graph) from **source code**, while colocating both in the same repository. This means the architecture description lives next to the code it describes, evolves with the same commits, and travels through the same git workflows. No external service holds the canonical state.

## Alternatives Considered

### External Services

Storing architectural data in a SaaS database would make querying faster and enable real-time updates. But it would also:

- Couple the architecture description to a specific vendor's uptime
- Create a synchronization problem between the code at a given commit and the architectural data that describes it
- Make it impossible to review architecture changes in pull requests
- Introduce a network dependency into every architecture check

### Embedded Databases

Using SQLite or similar as the primary store would improve query performance for large graphs. But the database file would be opaque to git diff, making it impossible to review what changed between syncs. ArchSpine does use better-sqlite3 as a **local cache** (`.spine/index/.cache/`) for intermediate pipeline state, but the canonical outputs are always JSON and Markdown files that diff cleanly.

### Code Wikis

Wiki pages drift. They are authored separately from code, updated on a different schedule, and rarely reflect the actual state of the repository. ArchSpine's control plane is **generated from code** — not written by hand — so it stays in sync with reality.

## What Goes in `.spine/`

| Path                 | Nature       | Purpose                                     |
| -------------------- | ------------ | ------------------------------------------- |
| `.spine/config.json` | Human-edited | Project configuration, LLM provider         |
| `.spine/rules/**`    | Human-edited | Architecture rules that gate PRs            |
| `.spine/index/**`    | Generated    | Semantic index of every file                |
| `.spine/view/**`     | Generated    | Derived views (diagrams, reports, briefing) |

## The Tradeoff

Git-native distribution means query performance is limited to file I/O rather than indexed database queries. For a 10,000-file repository, loading the full semantic index into memory takes milliseconds — well within acceptable bounds. The benefit is that every `git pull` brings the architecture description without any network call to an external service, and every `git diff` shows exactly how the architecture changed.
