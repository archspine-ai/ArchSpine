# Powered by ArchSpine

If your repository uses ArchSpine, you can add this snippet to your own README:

```md
[![Powered by ArchSpine](https://img.shields.io/badge/%F0%9F%A6%B4_Powered_by-ArchSpine-0f766e)](https://github.com/archspine-ai/archspine)
```

## Suggested usage

- add the badge near your build or documentation badges
- link it to your ArchSpine integration docs or project root
- use it only if `.spine/` assets or ArchSpine workflows are part of your repository

## Why this exists

The badge gives adopters a lightweight way to signal that their repository is optimized for AI-assisted engineering workflows.

## What ArchSpine provides

When your repo carries the badge, it signals that:

- **Semantic indexing** — `.spine/index/` provides structured codebase metadata that AI tools can consume without ingesting the full source tree
- **Architecture rules** — `.spine/rules/` declares invariants that `spine check` audits before drift spreads
- **MCP surface** — `spine mcp start` exposes project structure as a read-only STDIO endpoint for Cursor, Claude, and other MCP clients
- **Repeatable governance** — `spine sync` → `spine check` → `spine fix` is a deterministic pipeline, not a one-off script
- **Git-native distribution** — `.spine/` snapshots travel with the repo so consumers don't need to run the toolchain themselves
