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

ArchSpine is an open-source protocol and toolchain that builds a physical `.spine/` structured control plane inside your Git repository. Through direct **local file access** and CLI workflows, this architectural context can be understood safely, rapidly, and at low cost by AI coding assistants like Cursor and Claude.

It is not just another documentation generator. The goal is to make a codebase queryable, governable, and auditable for AI-assisted engineering:

- `Local-First`: eliminates complex integration barriers. Agents can read the local control plane directly in the workspace at maximum speed, removing the dependency on middleware.
- `Deterministic context`: give agents a stable architectural map instead of dumping the whole repository into a prompt.
- `Architecture guardrails`: define rules under `.spine/rules/` and statically enforce boundaries.

Start here:

- [Quick Start](./docs/quick-start.md)
- [MCP Integration](./docs/integrations/mcp.md)
- [Demo Walkthrough](./docs/examples/demo.md)
- [Runbook](./docs/guides/RUNBOOK.md)

## Why I Built ArchSpine

**As a student who wants to understand codebases:** I started learning programming in elementary school and have been doing it for eight years. I've always wanted to thoroughly understand codebases. AI made that possible, but before ArchSpine, I had to manually copy-paste code to get explanations, constantly losing context. It was incredibly frustrating. I started wondering: is there a way to get a panoramic semantic view all at once?

**As a vibe coder who wants to control codebase growth:** In 2025, while developing a game, I officially used vibe-coding to assist development. I found myself letting the agent "run first, review later," and gradually lost control over how the codebase "reproduced." I started wondering: is there a way for the agent and me to jointly read a controllable code mirror folder—a folder that records semantic evolution?

**As a coding agent (written by GPT-4.5 Pro!):** Facing a massive, unfamiliar repository, where do I find dependencies? Should I modify this underlying library? In the past, this was all guesswork. With ArchSpine, I can directly pull the local `.spine/` control plane. It gives me a stable global view, module boundaries, and bottom-line constraints. It prevents me from going off-track and helps me understand human intentions more accurately, letting me safely and efficiently write code within red lines.

**As a non-technical project manager who wants to track progress (this one's a mock!):** I don't need to understand the underlying code logic, but I can read the module architecture and responsibility maps generated in `.spine/`! Through regular `spine status` and `spine history` audits, as long as it reports 0 violations and module core responsibilities haven't drifted off course, I know the architecture is still healthy. I can use these tangible artifacts to verify the dev team is heading in the right direction.

## From `AGENT.md` To Repo-Scale Understanding

Many teams have already seen that a single Markdown file like `AGENT.md` can materially shape agent behavior. Even one explicit instruction surface reduces drift.

ArchSpine extends that idea from one file to the whole repository. **So why do we need to place a physical `.spine/` folder directly in the project directory?**

Because **local direct read is always the fastest path**. Instead of blocking AI with complex middleware or extra integrations, having the whole-repo context resting locally means Agents can use their native file-reading abilities to ingest structured assets. Built upon this physical control plane, ArchSpine enables three core mechanics of AI engineering collaboration:

- **Semantic Baseline**: scans and consolidates the real architectural boundaries and module responsibilities, establishing a true source of codebase context.
- **Semantic Change Tracking**: instead of just tracking line-level text diffs, it persistently tracks semantic drift across architecture and module dimensions.
- **Semantic Audit**: when an AI modifies code or triggers a merge, it evaluates these actions against customized redlines to automatically intercept and review boundary violations.

That gives the agent more than advice. It gives the agent an engineering environment with strict context and enforceable boundaries.

## Mental Model

This diagram shows where ArchSpine sits in the AI collaboration stack: not as generic chat memory, and not as plain project instructions, but as the structured codebase layer that stays close to real engineering workflow.

<p align="center">
  <img src="./docs/public/ai-collab-codebase-understanding-layered-map-en.svg" alt="Layered map of codebase understanding in AI collaboration, showing ArchSpine in the structured codebase and workflow-aligned region" width="100%" />
</p>
<p align="center">
  <sub>ArchSpine lives closer to the structured codebase layer: rules, responsibilities, indexes, and repository context become a queryable governance plane.</sub>
</p>

## Why ArchSpine

- **Make large repositories legible to AI**: ArchSpine derives a semantic mirror across files, folders, and responsibilities so agents can navigate with less context drift.
- **Put guardrails before codegen**: agents can inspect invariants and module boundaries before editing code.
- **Built for real workflows**: incremental sync, rule enforcement, Git Hooks, MCP querying, and interactive fix suggestions are part of the core experience.

## Recommended Adoption Mode

For the current `v1.0.x` stage, ArchSpine's product focus is: **local-first, fastest impact**.

The best first-use path for individual developers is to run ArchSpine directly in the repository with `try`, `init`, `build`, `check`, and `fix`. Your `.spine/` directory is a local physical asset that Agents can read and understand directly, just like any regular code file. **This is the most efficient method and requires zero extra configuration.**

ArchSpine also fully supports exposing context via MCP, which provides a standardized access method for complex client ecosystems and specific environments. For the current phase, our mainline flow focuses on the direct local-read workflow—allowing AI to understand your `.spine/` through native file access—while MCP operates alongside it as a seamless protocol extension.

## 30-Second Quick Start

```bash
npx --yes archspine@latest try
npx --yes archspine@latest init
npx --yes archspine@latest build
npx --yes archspine@latest check
```

<p align="center">
  <img src="./docs/public/spine-build.gif" alt="ArchSpine Build Demo" width="100%" />
</p>

Recommended environment:

- `Node.js >= 20`
- A current LTS release
- `npx --yes archspine@latest try` is the recommended first-touch path for cloned repositories because it is read-only and zero-install
- Configure the LLM during `spine init`, or run `spine llm setup` later for full `sync / check / fix` semantics
- ArchSpine supports additional documentation languages such as Vietnamese and Russian; some multilingual outputs require stronger models for stable quality, so review the generated docs and upgrade the model when needed
- `spine init` only bootstraps configuration; run `spine build` to build the first semantic mirror
- `spine init` now also selects how `.spine` artifacts should be managed in Git:
  `local` keeps runtime state and generated snapshots out of Git by default, while `distributable` keeps generated snapshots reviewable in Git and marks them in `.gitattributes`
- Use `spine init --artifact-strategy distributable` when you want a non-interactive distributable snapshot setup
- `init` no longer injects package.json helper scripts by default; when you opt in, the helpers call `npx --yes archspine@latest ...`
- If repository strategy needs to change later, re-running `spine init --artifact-strategy <mode>` is the supported transitional path today
- Run `spine remove` when you want to remove ArchSpine initialization from a repository in one step; use `spine remove --yes` to skip confirmation

## Read the .spine/ in this repo

You can navigate directly to the `.spine/atlas/` directory in this repository to read its structural mirror and code semantics, or check the `.spine/view/` directory for macro summaries and risk diagnostics.
The ArchSpine repository is completely **dogfooding** its own design. In the v0.9.0 iteration, we relied on the `.spine/view/` risk analysis feature to accurately identify potential architecture risks, eliminated "God files", ruthlessly split files with overlapping responsibilities, and re-established extremely clear module boundaries.

**Performance snapshot:**
The `src/` directory of this repo (the actual build scope also includes `test/`, etc.) currently consists of:

> Total: 206 files, 18640 code lines, 267 comments, 2488 blanks, 21395 lines tracking

At this scale, **running the full-repo baseline reconstruction command `spine build`—even configured to simultaneously output both English and Simplified Chinese architecture mirrors—took only ~7.5 minutes to complete. This "semantic investment" providing long-term architecture safety cost a total of ~14.89 million Input Tokens and ~2.47 million Output Tokens (costing merely 1.22 RMB / ~$0.17 using DeepSeek V3).**

Behind this impressive performance lies thoughtful architecture design and extreme optimization on the semantic boundary layer.

## MCP Integration

ArchSpine can expose the local `.spine` control plane over a STDIO MCP server:

Boundary note: MCP is a read-only semantic surface in ArchSpine and does not write official `.spine` artifacts.

```bash
spine mcp start
```

### Claude Desktop

Add this to `claude_desktop_config.json`:

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

### Cursor

Add a `stdio` MCP server in `Settings -> Features -> MCP`:

```json
{
  "name": "ArchSpine",
  "type": "stdio",
  "command": "node",
  "args": ["/absolute/path/to/archspine/dist/cli/index.js", "mcp", "start"]
}
```

### Claude Code / CLI

```bash
claude mcp add archspine node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

Agents can then read:

- `spine://project`
- `spine://folder/{path}`
- `spine://file/{filePath}`

And call these MCP capabilities:

- `spine_query_invariants`
- `spine_query_responsibilities`
- `spine_preview_scan`
- `spine_get_drift_history`

For the public integration guide, see [docs/integrations/mcp.md](./docs/integrations/mcp.md).

## CLI Capabilities

Current stable commands:

```bash
spine init
spine try
spine remove
spine remove --yes
spine llm setup
spine sync
spine sync --hook
spine sync --retry-failed
spine sync --repair-violations
spine build
spine check
spine fix
spine status
spine history
spine scan --dry-run
spine publish
spine hook on
spine hook off
spine hook set-mode heavy
spine languages show
spine languages set
spine usage
spine info
spine mcp start
```

See the full operational guide in [docs/guides/RUNBOOK.md](./docs/guides/RUNBOOK.md). In `v1.0.x`, `sync` remains the machine-first JSON refresh path, `publish` remains the Atlas backfill boundary, and `.spine/view/**` remains experimental. For the public docs path, start from [docs/index.md](./docs/index.md); the Chinese public entry is [docs/zh-CN/index.md](./docs/zh-CN/index.md).

## Docs

- [English Docs Home](./docs/index.md)
- [Chinese Docs Home](./docs/zh-CN/index.md)
- [English Runbook](./docs/guides/RUNBOOK.md)
- [God Mode Guide](./docs/guides/GOD-MODE.md)
- [Documentation Inventory](./docs/README.md)
- [Protocol Specification v1.0.0](./docs/specs/PROTOCOL.md)
- [MCP Integration](./docs/integrations/mcp.md)
- [Official Demo](./docs/examples/demo.md)
- [Powered by ArchSpine](./docs/community/powered-by.md)

## Community

Join our community to get support, share ideas, and help shape the future of ArchSpine:

[![Discord](https://img.shields.io/discord/1310167660993085481?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/RjfSVKfRzH)
[![QQ Group](https://img.shields.io/badge/QQ%20Group-1098273420-12b7f5?logo=tencent-qq&logoColor=white)](https://jq.qq.com/?_wv=1027&k=RjfSVKfRzH)

## Support And Security

- Usage questions, setup problems, and documentation gaps: start with [SUPPORT.md](./SUPPORT.md)
- Security vulnerabilities: report privately through [SECURITY.md](./SECURITY.md)
- Community expectations: see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## Contributing

If you plan to change runtime behavior, protocol assets, or docs structure, start with [CONTRIBUTING.md](./CONTRIBUTING.md). Contributions are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Licensed under [Apache License 2.0](./LICENSE).
