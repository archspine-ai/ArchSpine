# ArchSpine

<p align="center">
  <img src="./docs/public/readme-hero-en.png" alt="ArchSpine README hero" width="100%" />
</p>
<p align="center">
  English | <a href="./README.zh-CN.md">简体中文</a>
</p>
<p align="center">
  <img alt="CI" src="https://github.com/archspine-ai/archspine/actions/workflows/ci.yml/badge.svg" />
  <img alt="npm version" src="https://img.shields.io/npm/v/archspine?color=0f766e&label=npm" />
  <img alt="mcp ready" src="https://img.shields.io/badge/MCP-ready-0ea5e9" />
  <img alt="license" src="https://img.shields.io/badge/license-Apache%202.0-1f2937" />
</p>

**Don't let your codebase become an unmanageable black box in the AI era.**

Your repo now has a physical control plane—
**Git manages source code versions, ArchSpine governs engineering semantics.**

ArchSpine is an open-source protocol and toolchain that builds a physical `.spine/` structured control plane in your Git repository. It provides a stable, compressible, and enforceable architectural context for AI coding assistants via direct **local file access**.

Transform your codebase into an AI-queryable, enforceable, and auditable engineering system:

- `Local-First`: Agents read the local control plane directly in the workspace with zero integration overhead.
- `Deterministic context`: Provides a stable, compressed architectural map instead of blind repo-dumping.
- `Architecture guardrails`: Define redlines in `.spine/rules/` and statically enforce boundaries.

---

## 14.89M Tokens, Only $0.17: Extreme Performance Snapshot

The ArchSpine repository is fully dogfooding—we governed our own codebase and successfully identified and eliminated early god files.

The current `src/` directory consists of ~200+ files and ~20k lines of code. Running the full baseline reconstruction command `spine build` takes ~7.5 minutes, consuming **14.89M** Input Tokens and 2.47M Output Tokens. Costing merely **$0.17** (using DeepSeek V3), this low-cost investment provides long-term architectural safety, backed by thoughtful design and extreme optimization on the semantic boundary layer.

(Performance results can be seen directly in this repository's `.spine/atlas/` structural mirrors and `.spine/view/` macro summaries.)

---

## Why I Built ArchSpine

**As a student wanting to understand codebases**
I've been programming for eight years and always wanted to thoroughly understand codebases—AI made that possible. But before ArchSpine, I had to manually copy-paste for explanations, constantly losing context. I wondered: could I get a panoramic semantic view all at once?

**As a Vibe Coder wanting to control Vibe code**
In 2025, while developing with vibe-coding, I let agents "run first, review later." I gradually lost control over the "proliferation" of the codebase—cross-layer calls and messy interfaces. I wondered: could agents and I jointly read a controllable folder recording semantic changes?

**As a Coding Agent** _(Written by a Model)_
Facing a massive, unfamiliar repository, where do I find dependencies? Should I modify the core library? It used to be guesswork. With ArchSpine, I pull the local `.spine/` control plane—global vision, module boundaries, and hard constraints. I stay on track and understand human intention more accurately.

**As a Non-technical PM (or Tech Lead)**
I don't need to understand code logic, but I can read the architecture and responsibility maps in `.spine/`! Through regular `spine status` and `spine history` audits, if there are 0 violations and core responsibilities haven't drifted, I know the architecture is healthy. I use these tangible artifacts to verify the team is on the right track.

---

## The AI Technical Debt Crisis

AI is writing code faster than ever, but a hidden problem is spreading: **invisible technical debt**. When you let agents run loose, they inevitably break module boundaries. This seems harmless once, but accumulates into an uncontrollable mess. The root cause: **agents lack stable, enforceable architectural context.**

Traditional solutions (like prompt files or RAG) provide "advice," but advice is optional. Agents can simply ignore them.

ArchSpine's answer: **build a physical Semantic Baseline locally**. This isn't a documentation file; it's a machine-verifiable control plane. Agents read boundaries and redlines before acting; humans audit architectural drift before merging.

## Three Core Mechanisms: From Baseline to Governance

ArchSpine's engineering collaboration capabilities are built on three progressive mechanisms that form a closed-loop governance system:

- **Semantic Baseline — Auditing Debt**: Consolidates the real architectural boundaries and module responsibilities, establishing a true source of codebase context.
- **Semantic Change Tracking — Early Warning**: Instead of just tracking line-level diffs, it persistently tracks semantic drift across architecture and module dimensions.
- **Semantic Audit — Intercepting Violations**: When an AI modifies code or triggers a merge, it evaluates these actions against customized redlines in `.spine/rules/` to automatically intercept violations.

Agents no longer face a pile of discrete source code and a "please follow" suggestion; they operate within an engineering system with strict context and clear constraints.

## Workflow: build → sync → publish

Three core commands cover the full lifecycle from initial baseline to daily maintenance:

<p align="center">
  <img src="./docs/public/spine-build.gif" alt="ArchSpine Build Demo" width="100%" />
</p>

| Command         | Position         | When to use                                   | Output                                                |
| --------------- | ---------------- | --------------------------------------------- | ----------------------------------------------------- |
| `spine build`   | Full Baseline    | First init, `.spine/` corruption, or recovery | `.spine/index/**` + baseline + cache                |
| `spine sync`    | Daily Refresh    | High-frequency use during development         | `.spine/index/**` updates (no Atlas docs by default) |
| `spine publish` | Pre-release Docs | Before version release or merge windows       | `.spine/atlas/**` Markdown docs + view artifacts    |

Decision Tree:

| Symptom                                          | Command                          |
| ------------------------------------------------ | -------------------------------- |
| Just ran `spine init`, no semantic mirror yet    | `spine build`                    |
| Atlas docs outdated/missing, but index exists    | `spine publish`                  |
| Some files failed to sync                        | `spine sync --retry-failed`      |
| Protected artifacts edited externally            | `spine sync --repair-violations` |
| Runtime baseline incomplete or corrupted         | `spine build` (Full rebuild)     |

**Boundary Model**: `sync` is machine-first (fast JSON refresh), `publish` is human-first (Atlas Markdown backfill), and `build` is for initialization and recovery. Each has a clear purpose and is not a substitute for the others.

## Mental Model

This diagram shows ArchSpine's position in the AI collaboration stack: it is deeply integrated into the "Structured Codebase Representation" and "Engineering Workflow" layers.

<p align="center">
  <img src="./docs/public/ai-collab-codebase-understanding-layered-map-en.svg" alt="Layered map of codebase understanding in AI collaboration" width="100%" />
</p>
<p align="center">
  <sub>ArchSpine lives closer to the structured codebase layer: rules, responsibilities, indexes, and repository context become a queryable governance plane.</sub>
</p>

## Recommended Adoption Mode

For the current `v1.0.x` phase, the most effective path is: **Local-First, Instant Impact**. Running `try` → `init` → `build` → `check` → `fix` directly in the workspace is the most efficient zero-config method. `.spine/` is a local physical asset that agents read directly, just like code.

MCP exists as a seamless protocol extension for complex client ecosystems requiring standardized access.

## 30-Second Quick Start

```bash
npx --yes archspine@latest try
npx --yes archspine@latest init
npx --yes archspine@latest build
npx --yes archspine@latest check
```

- `Node.js >= 20` (LTS recommended)
- `spine init` only bootstraps config; run `spine build` for the first semantic mirror
- `spine init` supports Git artifact strategies: `local` (runtime state kept out of Git) and `distributable` (snapshots kept in Git and marked as generated)
- For full `sync / check / fix` capabilities, run `spine llm setup` after `spine init`

## God Mode

`spine god` generates a single-file semantic archive `.spine/<repo-name>-god.md`—compressing the entire repository state into one Markdown file containing summaries, file lists, responsibilities, dependencies, and drift states. Designed for human review, demos, and experiments.

## MCP Integration

ArchSpine can expose the local `.spine` control plane over a STDIO MCP server:

```bash
spine mcp start
```

**Claude Desktop**: Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "archspine": {
      "command": "node",
      "args": ["/absolute/path/to/archspine/dist/cli/index.js", "mcp", "start"]
    }
  }
}
```

**Claude Code / CLI**:

```bash
claude mcp add archspine node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

**Cursor**: Add a `stdio` server in `Settings -> Features -> MCP`.

Agents can read `spine://project`, `spine://folder/{path}`, `spine://file/{filePath}`, and call capabilities like `spine_query_invariants`, `spine_query_responsibilities`, etc. Full guide: [docs/how-to/MCP.md](./docs/how-to/MCP.md).

## CLI Capabilities

Commands grouped by function. Full guide: [RUNBOOK](./docs/guides/RUNBOOK.md).

**Configuration**

| Command                                 | Description                                             |
| --------------------------------------- | ------------------------------------------------------- |
| `spine try`                             | Read-only preview (zero install, no changes)            |
| `spine init`                            | Init `.spine/` dir, config, rules, and hooks            |
| `spine init --artifact-strategy <mode>` | Specify Git strategy (`local` or `distributable`)       |
| `spine remove`                          | Remove `.spine/` and all managed configs                |
| `spine llm setup`                       | Configure LLM providers                                 |
| `spine languages show/set`              | View/Set output language                                |
| `spine repo check`                      | Detect drift between config and managed files           |

**Build & Sync**

| Command                          | Description                               |
| -------------------------------- | ----------------------------------------- |
| `spine build`                    | Full rebuild (First init / Recovery)      |
| `spine sync`                     | Daily refresh (Machine-first, JSON)       |
| `spine sync --hook`              | Lightweight Hook mode (for pre-commit)    |
| `spine publish`                  | Generate human-readable Atlas docs        |

**Audit & Fix**

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `spine check`          | Check violations based on `.spine/rules/`   |
| `spine fix`            | Propose and apply fixes for violations      |
| `spine scan --dry-run` | Pre-scan without writing changes            |

**Information**

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `spine status`         | View current baseline status                |
| `spine usage`          | View Token consumption and costs            |
| `spine history <file>` | View semantic history of a specific file    |

**Hook Management**

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `spine hook on/off`         | Install/Uninstall pre-commit hooks  |
| `spine hook set-mode heavy` | Set hook to heavy mode              |

## Docs

- [English Docs Home](./docs/index.md)
- [Chinese Docs Home](./docs/zh-CN/index.md)
- [Quick Start](./docs/tutorials/quick-start.md)
- [Runbook](./docs/how-to/RUNBOOK.md)
- [God Mode Guide](./docs/explanation/GOD-MODE.md)
- [MCP Integration](./docs/how-to/MCP.md)
- [Demo Walkthrough](./docs/tutorials/DEMO.md)
- [Protocol Specification v1.0.0](./docs/reference/PROTOCOL.md)
- [Powered by ArchSpine](./docs/explanation/POWERED-BY.md)

## Community

[![Discord](https://img.shields.io/discord/1310167660993085481?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/RjfSVKfRzH)
[![QQ Group](https://img.shields.io/badge/QQ%20Group-1098273420-12b7f5?logo=tencent-qq&logoColor=white)](https://jq.qq.com/?_wv=1027&k=RjfSVKfRzH)

## Support And Security

- Usage questions and setup problems: see [SUPPORT.md](./SUPPORT.md)
- Security vulnerabilities: report via [SECURITY.md](./SECURITY.md)
- Community expectations: see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before changing runtime, protocol, or docs.

## License

Licensed under [Apache License 2.0](./LICENSE).
