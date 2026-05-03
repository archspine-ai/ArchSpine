---
layout: home

hero:
  name: ArchSpine
  text: Deterministic context and architecture guardrails for AI coding agents.
  tagline: Upgrade your Git repo with a `.spine/` control plane for MCP, rule-based governance, and AI-friendly code navigation.
  actions:
    - theme: brand
      text: Get Started
      link: tutorials/quick-start
    - theme: alt
      text: MCP Integration
      link: how-to/MCP
    - theme: alt
      text: View Demo
      link: tutorials/DEMO

features:
  - title: Deterministic context
    details: Build a structured semantic mirror under `.spine/` so AI agents can navigate your codebase without consuming the whole repository as prompt context.
  - title: Architecture guardrails
    details: Declare invariants in `.spine/rules/` and audit layer boundaries before AI-generated changes spread architecture drift.
  - title: Git-aware onboarding
    details: Default to distributable `.spine` snapshots for team-facing repositories, while keeping local-only mode available for lighter setups during `spine init`.
  - title: MCP-ready workflows
    details: Mount local project structure, responsibilities, and rule data into Cursor, Claude, and other MCP clients over STDIO.
  - title: Experimental view layer
    details: Optionally derive `.spine/view/public-surface.json` and `.spine/view/risk-hotspots.json` as fast-reading aids without changing the main sync contract.
  - title: Measurable prompt engine
    details: Use runtime modes, diagnostics, and corpus benchmarks instead of tuning generation behavior blindly.
---

## Demo Workflow

Use the built-in demo project to show the full loop:

```bash
npm run build
cd examples/demo-project
rm -rf .spine/index .spine/atlas
rm -f .spine/cache.db .spine/cache.db-shm .spine/cache.db-wal .spine/manifest.json .spine/languages.json .spine/.lock
node ../../dist/cli/index.js llm --project set provider mock
node ../../dist/cli/index.js sync
node ../../dist/cli/index.js check
node ../../dist/cli/index.js fix
node ../../dist/cli/index.js publish
```

- **Demos & References:**
  - [Official Demo](tutorials/DEMO)
  - Governance recording source: [`scripts/demo.tape`](https://github.com/iZoy/archSpine/blob/main/scripts/demo.tape)
  - Project capability recording source: [`scripts/project-demo.tape`](https://github.com/iZoy/archSpine/blob/main/scripts/project-demo.tape)
- **Deep Docs:**
  - [Runbook](how-to/RUNBOOK)
  - [FAQ](how-to/FAQ)
  - [Cost & Usage Guide](explanation/COST-USAGE)
  - [Current Capabilities](reference/CURRENT-CAPABILITIES)
  - [View Layer Guide](explanation/VIEW-LAYER)
  - [God Mode Guide](explanation/GOD-MODE)
- **Localization:**
  - [简体中文 (Chinese docs)](zh-CN/)

::: info Note
In `v1.0.x`, `sync` is the machine-first synchronization step and `publish` is the Atlas refresh boundary. The `.spine/view/**` artifacts remain experimental.
:::

## Why this matters

Most AI coding tools still work by over-feeding source files into prompts and hoping the model reconstructs your architecture. ArchSpine changes the interaction model:

- it turns repository structure into a queryable control plane
- it makes rules explicit before edits happen
- it gives MCP clients a stable, local source of truth
- it defaults repositories toward distributable `.spine` Git behavior during initialization while keeping local-only mode available

## Current runtime posture

The current `1.0.x` line already includes:

- `mode` as the primary runtime control surface: `standard`, `heavy`
- advanced overrides still exist, but the normal product surface is `mode=standard|heavy`
- diagnostics snapshots for prompt and relevance decisions
- fixed corpus and comparison harnesses for prompt-policy regression
- a heavier validate path that can prioritize semantic stability before markdown generation
- a public CI split where the default gate stays product-focused and research bench coverage runs separately on demand

Use the runbook for operational details, the architecture overview and task-execution model for runtime boundaries, and the prompt-engine design docs for the architecture rationale.

## Works well with

- Cursor
- Claude Desktop
- Claude Code / CLI
- custom MCP clients that support STDIO transports
