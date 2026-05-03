# Quick Start

ArchSpine is designed to give AI coding agents a deterministic understanding of your repository, then enforce architecture boundaries as your code evolves.

## Try without installing

```bash
npx --yes archspine@latest try
```

This is the recommended first-touch path for cloned repositories. `try` is read-only: it reports whether the repository already carries `.spine` control-plane inputs and distributable snapshots, then prints the next explicit commands without mutating anything.

If you prefer a persistent local install, `spine` remains the primary CLI surface after installation.

## Initialize a repository

```bash
npx --yes archspine@latest init
```

This creates the `.spine/` control plane and installs the base metadata needed for indexing, rules, and cached repository state.

To remove ArchSpine initialization from the current repository in one step:

```bash
npx --yes archspine@latest remove
```

Use `npx --yes archspine@latest remove --yes` when you want to skip the confirmation prompt.

During initialization, ArchSpine can also inject a small Agent instructions block into one repository instructions file.
Use the default `AGENTS.md`, or choose an alternative filename such as `CLAUDE.md` or `GEMINI.md`.

```bash
npx --yes archspine@latest init --agent-file AGENTS.md
```

This is a one-time repository setup helper, not a security boundary.

`init` also prepares a small search-ignore file so default workspace search stays focused on source files and control-plane inputs instead of generated `.spine` outputs.
It also creates a commented `.spineignore` starter block with a small set of recommended semantic ignore defaults such as `.env`, certificate/key patterns, common cache directories, clearly secondary generated mirrors, and human-facing repository docs that already serve as the authoritative readable surface. Those defaults stay editable and deliberately keep code, schemas, and repository automation such as `.github/workflows/**` indexable by default.
It also chooses how `.spine` artifacts should be managed in Git:

- `distributable` is the recommended default for team-oriented repositories and keeps generated snapshots review-friendly
- `local` keeps runtime state and generated snapshots out of Git for a lighter local-only setup

If repository strategy needs to change later, re-running `spine init --artifact-strategy <mode>` is the supported transitional path today.

For scripting or CI bootstrap, pass the strategy explicitly:

```bash
npx --yes archspine@latest init --artifact-strategy distributable
```

If the repository already has a `package.json`, `init` now defaults to not injecting `spine:*` scripts. When you opt in, the injected helpers use `npx --yes archspine@latest ...` so clone recipients do not depend on a globally installed `spine` binary.

If you enable Git pre-commit sync during `init`, run the command at the root of a Git repository. Otherwise ArchSpine will finish initialization and tell you to either return to the Git root or run `git init` first.

ArchSpine supports a broader documentation-language list, including higher-variance multilingual outputs such as Vietnamese and Russian. Those languages remain selectable, but they depend more heavily on model quality, so review generated docs and move to a stronger model if results are not stable enough.

## Sync the semantic mirror

```bash
npx --yes archspine@latest build
```

Use plain `npx --yes archspine@latest sync` after that for incremental updates.

At the end of each `sync`, ArchSpine prints the resolved LLM provider and model used for that run. The latest sync summary in `.spine/manifest.json` also records the resolved provider/model pair and their resolution sources so you can audit what runtime actually produced the current mirror.

If you want to try the experimental derived view layer, enable it and run `sync` as usual:

```bash
npx --yes archspine@latest config set artifacts.experimentalViewLayer true
npx --yes archspine@latest sync
```

This produces:

- `.spine/view/public-surface.json`
- `.spine/view/risk-hotspots.json`

Treat these artifacts as experimental reading aids rather than stable protocol outputs.

If ArchSpine reports a protected generated-output violation and you want to rebuild only through the supported repair path, use:

```bash
npx --yes archspine@latest sync --repair-violations
```

This is an explicit repair mode. It does not run by default, and it may escalate to `spine build` when the current damage cannot be narrowed safely.

> **💡 Interactive UX**: During `sync`, dense task logging is folded by default into a minimal blinking progress indicator. You can hit `Space` at any time to expand all verbose details. It safely degrades to standard logging in CI or non-interactive environments.

If you are refreshing the distributable repository snapshot as a maintainer, run:

```bash
npx --yes archspine@latest publish
```

`sync` is the day-to-day machine runtime writer path and defaults to fast `json-only` index refresh. `publish` is the maintainer-oriented human snapshot refresh path for `.spine/index/**` and `.spine/atlas/**` and, when enabled, `.spine/view/**`: it re-runs lightweight sync and then attempts Atlas Markdown backfill when text-generation is available, and it requires a ready runtime baseline with no active, stale, or owner-unverifiable `.spine/.lock`.

For high-frequency workflows such as pre-commit hooks, the managed hook defaults to the hook sync path.

```bash
npx --yes archspine@latest sync --hook
```

If you want higher-quality incremental sync during pre-commit, switch the hook strategy instead of changing the main sync surface:

```bash
npx --yes archspine@latest hook set-mode heavy
```

## Audit architecture

```bash
npx --yes archspine@latest check
npx --yes archspine@latest fix
```

If you want to inspect the current LLM runtime posture:

```bash
npx --yes archspine@latest llm show
npx --yes archspine@latest llm show --verbose
```

For the main user-facing control surface, prefer:

```bash
npx --yes archspine@latest llm set mode standard
npx --yes archspine@latest llm set mode heavy
```

For day-to-day work, treat `spine sync` and `spine publish` as the main surface. `spine check` remains an independent governance path (not a required pre-step for `publish`). MCP stays read-only, and generated `.spine` outputs should not be your default workspace search target.

## Recommended environment

- `Node.js >= 20`
- A current LTS release
- run `spine llm setup` when you want full semantic summarization and fix suggestions

## Next steps

- [MCP Integration](../how-to/MCP)
- [Runbook](../how-to/RUNBOOK)
- [FAQ](../how-to/FAQ)
- [Cost & Usage Guide](../explanation/COST-USAGE)
- [View Layer Guide](../explanation/VIEW-LAYER)
- [Prompt Engine Design](../design/PROMPT-ENGINE)
- [Architecture Overview](../explanation/ARCHITECTURE-OVERVIEW)
- [Task Execution Model](../design/TASK-EXECUTION-MODEL)
- [LLM Benchmarks](../reference/LLM-BENCHMARKS)
- [Official Demo](../tutorials/DEMO)
- [Chinese docs](../zh-CN/)
