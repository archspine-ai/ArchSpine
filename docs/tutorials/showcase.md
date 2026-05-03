# Showcase

This page is intentionally conservative: it highlights real examples only.

## Current examples

- **Official demo project**: a minimal repository that demonstrates rule violations, `spine check`, and `spine fix`.
- **Protocol docs**: the public `.spine` protocol and MCP architecture docs serve as the current reference implementation for integrations.

## Submission policy

If you are using ArchSpine in a public repository, open a docs issue with:

- repository link
- a short description of how ArchSpine is used
- whether you want to be listed by name

Until external examples are verified, this page should not imply adoption by third-party brands or teams.

## What the demo project covers

The bundled demo (`examples/demo-project/`) exercises the full governance loop:

- **`spine init`** — bootstrap `.spine/` in a fresh repo with distributable defaults
- **`spine sync`** — scan the codebase, build `.spine/index/` semantic mirrors
- **`spine check`** — detect architecture violations against `.spine/rules/`
- **`spine fix`** — apply automated fixes for known violation patterns
- **`spine mcp start`** — expose project structure as a read-only MCP surface
- **`spine publish`** — backfill `.spine/atlas/` and `.spine/view/` snapshots

Each command produces deterministic output scoped to the demo repo, making it a repeatable validation path for CI and onboarding.
