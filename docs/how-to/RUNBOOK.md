# ArchSpine Runbook

This runbook documents the current `v1.0.x` CLI and protocol behavior. It is written against the implementation that exists today, not against future roadmap ideas.

## Day 1: Quick start

ArchSpine builds a `.spine/` control plane in your repository. In `v1.0`, `spine sync` is machine-first: it defaults to a `json-only` strategy that refreshes `.spine/index/` quickly, while human-readable Markdown in `.spine/atlas/` is refreshed by `spine publish`. The runtime can also derive experimental JSON reading views under `.spine/view/` when enabled.

Writer boundary (v1.0 minimal):

- ArchSpine CLI/runtime is the authoritative writer for official `.spine` outputs.
- MCP is a read-only semantic surface and does not write `.spine`.
- Local IDE/CLI agents are suggestion sources by default, not `.spine` writers.

Formal writer paths in the current line:

- `spine sync` (default incremental): refreshes the machine runtime mirror (`.spine/index/**`, `.spine/cache.db*`, `.spine/.lock`) with `generationStrategy=json-only`; no Atlas Markdown is regenerated on this path
- `spine build`: heavyweight baseline build path for first-run initialization, recovery, and trusted `.spine` rebuilds
- when experimental view output is enabled, the `sync` writer path may also write `.spine/view/public-surface.json` and `.spine/view/risk-hotspots.json`
- `spine sync --hook`: writes the hook-oriented runtime subset (`.spine/index/**`, `.spine/cache.db*`, `.spine/.lock`) and refreshes the same baseline without Atlas regeneration
- `spine check` / `spine fix`: remain trusted write paths for local runtime state in `.spine/cache.db*` and `.spine/.lock`
- `spine publish`: maintainer-oriented publish workflow that runs publish preflight, performs a lightweight sync refresh for JSON indexes, then attempts Atlas backfill through `DocumentBackfillTask` when text-generation is available; if enabled, the same publish flow also refreshes `.spine/view/**`. It requires an existing `.spine` runtime baseline (`manifest.json` + `protected-output-baseline.json`) and fails closed if `.spine/.lock` is present, stale, or not owner-verifiable

### Initialize a repository

```bash
spine init
```

Recommended choices during interactive setup:

- select the documentation languages you want to generate
- choose `Distributable snapshot` if the repository is meant to carry semantic snapshots as shared assets
- install the recommended rule templates
- enable Git hooks if you want automatic sync on commit

Language note:

- ArchSpine keeps high-stability documentation languages in the default list and places some higher-variance multilingual outputs behind a visible separator in the interactive picker
- languages such as French, German, Portuguese (Brazil), Vietnamese, and Russian are still supported, but they depend more heavily on model quality
- the current policy is allow-with-warning rather than hard blocking: users may choose them, but should review generated docs and switch to a stronger multilingual model if quality is not acceptable

`spine init` bootstraps configuration, rule templates, hook preference, and language snapshot data. It can also (optionally) inject ArchSpine agent instructions into one repository instructions file, inject minimal `spine:*` workflow scripts into `package.json`, and prepare a small search-ignore file so generated `.spine` outputs do not dominate default workspace search. It does not run the first build automatically.

`init` also chooses a repository artifact strategy for Git integration:

- `local`: ignore local runtime state and generated semantic snapshots in Git by default
- `distributable`: ignore only local runtime state, and mark generated `.spine` snapshots as generated files in `.gitattributes`

If repository strategy needs to change later, re-running `spine init --artifact-strategy <mode>` is the supported transitional path today.

For non-interactive setup, you can select the strategy up front:

```bash
spine init --artifact-strategy distributable
```

If repository strategy needs to change later, re-running `spine init --artifact-strategy <mode>` is the supported transitional path today.

If you want to choose the target instructions filename up front, use:

```bash
spine init --agent-file AGENTS.md
```

Supported filenames are typically `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`. This is a one-time setup helper only; it is not a security boundary.

The injected instructions should push local agents toward MCP-first context reads and away from broad search across generated `.spine/index/**` and `.spine/atlas/**` content.

Default semantic mirror boundary in the current line:

- keep code, schemas, `.github/workflows/**`, and `.spine` control-plane files as the main semantic inputs
- keep human-facing repository docs such as `docs/**`, `README*`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, and `CODE_OF_CONDUCT.md` authoritative in place and out of the default `.spine` mirror unless a repository chooses otherwise

### Remove ArchSpine from a repository

```bash
spine remove
```

`spine remove` removes the local `.spine/` directory, deletes the ArchSpine-managed block from `.git/hooks/pre-commit`, and rolls back ArchSpine-managed host integrations such as injected agent-instructions blocks, generated `.ignore` entries, managed `.gitignore` / `.gitattributes` blocks, and default `spine:*` scripts when they still match ArchSpine-managed content. It does not touch user-owned hook logic outside that managed block or custom host content that has diverged from the managed defaults.
Use `spine remove --yes` to skip the confirmation prompt in non-interactive flows.

### Build the first semantic mirror

```bash
spine build
```

After that, use incremental sync for day-to-day work:

```bash
spine sync
```

Current sync reporting:

- the CLI summary prints the resolved LLM provider and model used for that sync
- `.spine/manifest.json` persists the latest resolved provider/model pair together with resolution sources
- this data is for runtime traceability; it is not an execution lock or policy boundary
- if a normal incremental `sync` processes one or more files without regenerating Atlas, ArchSpine writes `.spine/.stale` as a consistency watermark
- when `.spine/.stale` exists, maintainers should run `spine publish` before committing distributable docs

If the latest sync checkpoint contains file-level failures and you want a narrow retry instead of a full rebuild, use:

```bash
spine sync --retry-failed
```

Current retry-failed posture:

- retries only failed `summarization` and `state-commit` items from the latest `.spine/runtime/checkpoints/sync.json`
- does not infer candidates from atlas gaps, manifest state, or console logs
- is intentionally separate from `publish`: retry-failed repairs sync pipeline failures, while publish backfills atlas markdown from an existing index baseline
- cannot be combined with `--hook` or `--repair-violations`

Recovery routing quick guide:

- Atlas docs are stale or missing, but `.spine/index/**` is already present: run `spine publish`
- the sync pipeline failed on a limited file set and you want a narrow retry: run `spine sync --retry-failed`
- protected generated outputs were edited outside a trusted writer path and you want explicit repair: run `spine sync --repair-violations`
- the runtime baseline is incomplete, corrupted, or the failure scope is broad enough that narrow repair is not trustworthy: run `spine build`

If a protected generated output was changed outside a trusted writer path and you want ArchSpine to repair it explicitly, use:

```bash
spine sync --repair-violations
```

Current repair posture:

- ordinary `spine sync` still reports protected output violations but does not auto-overwrite them
- `--repair-violations` is the explicit recovery path
- ArchSpine attempts targeted repair first when the violated generated outputs can be mapped back to a safe source subset
- if policy judges the damage broader or structurally unsafe, repair escalates to a full rebuild requirement instead of silently masking the state

If you want to enable the experimental reading views, use either project config or an environment override before running `sync`:

```bash
spine config set artifacts.experimentalViewLayer true
spine sync
```

or:

```bash
SPINE_EXPERIMENTAL_VIEW_LAYER=true spine sync
```

Current experimental view outputs:

- `.spine/view/public-surface.json`
- `.spine/view/risk-hotspots.json`

These outputs are derived, non-authoritative, and not part of the stable artifact promise for the first open-source `v1.0` release.

For repository distribution snapshot refresh (maintainer flow):

```bash
spine publish
```

Current boundary model:

- `sync` updates local runtime `.spine` state for day-to-day development and defaults to fast machine-oriented JSON refresh.
- `publish` refreshes the repository distribution snapshot for `.spine/index/**`, `.spine/atlas/**`, and, when enabled, `.spine/view/**`.
- `publish` is the canonical human-doc refresh boundary: it attempts Atlas Markdown backfill after a lightweight sync refresh when text-generation is available.
- before atlas-writing summarization, stale `.spine/atlas/<locale>/` directories that are no longer configured are pruned automatically
- if markdown output was requested but the model returns no markdown block for any target locale, the affected file is marked failed instead of being treated as a partial success
- the default distribution snapshot is centered on code, schemas, repository automation, and `.spine` control-plane semantics rather than mirroring human-facing repository docs
- `publish` runs preflight checks first (runtime baseline must exist, and runtime lock must be clear).
- if `.spine/.lock` exists, publish fails closed for active locks, stale locks, owner-unverifiable locks, and corrupt or unsupported legacy lock payloads alike; only clear the lock after confirming no ArchSpine process is still running
- `.spine/.lock` only provides local runtime mutual exclusion and does not carry Git semantics.
- default recommendation: run `spine sync` during normal development, then run `spine publish` before release/merge windows whenever distributable Atlas docs must be current.

Publish troubleshooting (maintainer quick reference):

- `[PUBLISH_RUNTIME_MISSING]`: `.spine/` does not exist yet. Run `spine init`, then `spine build`, then retry `spine publish`.
- `[PUBLISH_RUNTIME_BASELINE_INCOMPLETE]`: runtime baseline is incomplete. Rebuild it with `spine build` before publishing.
- `[PUBLISH_LOCK_ACTIVE]`: `.spine/.lock` is active, stale, owner-unverifiable, or stored in a corrupt/unsupported legacy format. Confirm no ArchSpine process is still running before clearing the lock or rebuilding runtime state.
- `[PUBLISH_SNAPSHOT_INCOMPLETE]`: publish ran but the distributable snapshot is still incomplete. Re-run `spine build`, then retry `spine publish`.

Runtime and MCP troubleshooting (maintainer quick reference):

- `[RUNTIME_LOCK_ACTIVE]`: another ArchSpine process is holding `.spine/.lock`. Wait for it to finish before retrying `spine sync`, `spine check`, or `spine fix`.
- `[RUNTIME_LOCK_OWNER_UNVERIFIABLE]`: lock ownership cannot be verified on this host. Confirm no ArchSpine process is still running before clearing `.spine/.lock`.
- `[RUNTIME_LOCK_CORRUPT]`: `.spine/.lock` content is malformed or from an unsupported legacy format. Confirm no ArchSpine process is still running, then remove the lock and rebuild runtime state if needed.
- `[RUNTIME_DB_OPEN_FAILED]` / `[RUNTIME_DB_INIT_FAILED]`: the local SQLite runtime could not be opened or initialized. Rebuild it with `spine build`.
- `[RUNTIME_DB_READONLY]`: the local SQLite runtime is read-only. Use a trusted ArchSpine write path or repair the local `.spine` runtime permissions before retrying.
- `[MCP_RUNTIME_MISSING]`: MCP was asked to read from a repo with no `.spine` runtime. Run `spine init` and `spine build` first.
- `[MCP_RUNTIME_BASELINE_INCOMPLETE]`: MCP tool calls require a synced runtime baseline. Run `spine build` before retrying the MCP query.
- `[MCP_RESOURCE_INVALID_CONTENT]` / `[MCP_TOOL_INDEX_INVALID_CONTENT]`: `.spine/index/**` content is present but invalid. Rebuild the runtime mirror with `spine build`.
- `[MCP_READ_FAILED]`: MCP failed to read a resource (e.g. `spine://project`).
- `[MCP_TOOL_EXECUTION_FAILED]`: An MCP tool execution failed.
- `[MCP_TOOL_UNKNOWN]`: The requested MCP tool is unknown.

Protected output violation troubleshooting:

- violation warnings now describe protected generated-output edits more precisely instead of using a broad external-mutation label
- runtime files such as `.spine/.lock` and `.spine/cache.db*` are protected runtime state, but they do not count as protected generated-output violations
- use `spine sync --repair-violations` only when you intentionally want ArchSpine to rebuild violated generated outputs
- if repair cannot be safely narrowed, follow the CLI guidance and run `spine build`

Host deployment convention (current minimum contract):

- ordinary agents can work in a writable repository for normal source edits
- `.spine/index/**`, `.spine/atlas/**`, `.spine/cache.db*`, and `.spine/.lock` should remain read-only by default
- when enabled, `.spine/view/**` is written by the same trusted writer path and should be treated as protected generated output as well
- trusted `spine` write paths temporarily unlock those protected outputs before writing and re-lock them immediately after
- this is a host-assisted safety boundary for reducing accidental same-user writes during normal development, not a claim of isolation against a malicious same-permission process
- treat that boundary as a collaboration contract and runtime safety mechanism, not as strong host-enforced isolation against same-permission tools

### Configure an LLM provider

`sync`, `check`, and `fix` need a provider for full semantic behavior:

```bash
spine llm setup
```

`spine init` can also collect the provider during first-time setup.

Useful follow-up commands:

```bash
spine llm show
spine llm show --verbose
spine llm set provider openai
spine llm set api-key sk-xxxx
spine llm set model gpt-4o-mini
spine llm set base-url https://openrouter.ai/api/v1
spine llm set mode standard
spine llm set mode heavy
spine llm clear api-key
```

Current guidance:

- use `mode` as the primary control surface:
  `standard` is the default day-to-day mode for generating `.spine`
  `heavy` is slower and costlier, but more robust for high-confidence generation and checks
- keep compatibility overrides out of the default path unless you are explicitly debugging runtime behavior

Review guidance:

- `.spine/index/**` and `.spine/atlas/**` are generated semantic artifacts and are marked as generated files in GitHub review
- ArchSpine treats `.spine/index/**`, `.spine/atlas/**`, `.spine/view/**`, `.spine/cache.db*`, and `.spine/.lock` as protected outputs
- protected outputs are re-locked after `sync`; trusted ArchSpine write paths unlock before write and lock again after write
- `.spine/config.json` and `.spine/rules/**` remain normal review targets because they define the control surface
- `status`, `check`, `fix`, and `info` warn if generated protected outputs changed outside the last ArchSpine write path
- direct-edit detection is a warning layer for generated-output drift, not a full proposal/review gate

Open-source CI and test layering:

- the default public CI gate is intentionally product-facing and runs `npm run test:unit`, `npm run validate`, `npm run docs:build`, and `npm run pack:check`
- research-only prompt-policy and benchmark coverage lives under `research/bench/**` and is intentionally kept outside the default PR gate
- use `npm run test:research` when maintainers want to rerun corpus, comparison, and strategy-harness checks explicitly
- the repository ships a separate manual GitHub Actions workflow, `Research Bench`, for that research-only suite so public contributors are not blocked by internal policy-evaluation checks

Soft gate retention guidance:

- keep the read-only protected-output boundary, trusted unlock/relock flow, and MCP read-only posture as hard requirements in the current line
- keep the baseline file and external-mutation warning layer until a stronger host-enforced mediation exists
- do not remove the warning layer just because protected outputs are already locked; today it still provides the explicit evidence trail for out-of-band edits

Environment variables still override persisted settings when you explicitly need a one-off runtime override.
Use the local-model path in [Local LLM Guide](../how-to/LOCAL-LLM) if you need Ollama or LM Studio.

Use `spine llm show --verbose` or `spine info --verbose` only when you want to inspect how the current mode resolves at runtime.

### Command dependency matrix

Requires an LLM provider to be fully effective:

- `spine sync`
- `spine publish`
- `spine check`
- `spine fix`

Depends only on local `.spine` assets or repository state:

- `spine status`
- `spine scan --dry-run`
- `spine hook on|off`
- `spine config get|set`
- `spine languages show|set`
- `spine usage`
- `spine info`
- `spine remove`
- `spine mcp start`

## Architecture governance

### Audit the repository

```bash
spine check
```

If a rule is violated, ArchSpine records the violation in local state and prints the affected file and rule information.

Compatibility overrides still exist for internal debugging and migration support, but they are intentionally outside the normal user-facing setup flow.

### Review an interactive fix

```bash
spine fix
```

`fix` reads active violations from the local manifest-backed state used by `check`, proposes a patch, and asks for confirmation before writing changes.

### Maintain rules

Current rule files should live under `.spine/rules/` as YAML:

```yaml
version: 1
rules:
  - ruleId: layer-isolation
    title: API must not import Infra directly
    appliesTo:
      - src/api/**
    severity: error
    summary: API files must depend on services or ports, not infra implementations.
```

## AI collaboration

### Start the MCP server

```bash
spine mcp start
```

Current MCP surface:

- read-only semantics only (no `.spine` write API, no repo file write API)
- for ordinary agent work, prefer MCP reads and control-plane files over broad search across generated `.spine/index/**` and `.spine/atlas/**`

- listed resource: `spine://project`
- readable URI patterns: `spine://folder/{path}`, `spine://file/{filePath}`
- tools:
  - `spine_query_invariants`
  - `spine_query_responsibilities`
  - `spine_preview_scan`
  - `spine_get_drift_history`
  - `spine_get_sync_status`
  - `spine_get_baseline_status`
  - `spine_get_violations_summary`
  - `spine_list_resource_templates`

### Optional context gating

If you want agents to follow a stronger reading order:

```bash
spine config set mcp.contextMode project-first
```

Supported values:

- `off`
- `project-first`
- `search-first`

## Automation and efficiency

### Toggle Git hooks

- disable and remove the managed hook block: `spine hook off`
- install or refresh the managed hook block and enable it: `spine hook on`
- change hook sync strategy: `spine hook set-mode <hook|standard|heavy>`
- skip one commit: `SPINE_PRECOMMIT=false git commit -m "wip"`

`spine hook on` now installs the hook if needed. `spine hook off` removes the ArchSpine-managed block from `.git/hooks/pre-commit` so the repository is not left with stale managed hook content. `spine hook set-mode` controls whether the managed hook runs the lightweight hook sync path, a standard incremental sync, or a heavy incremental sync.

### Update documentation languages

```bash
spine languages show
spine languages set
```

`show` prints the configured documentation languages and the latest language discovery snapshot when available. `set` reopens the interactive multi-select used during initialization so users can adjust output languages after `init`.

### Read and write config

```bash
spine config get hooks.preCommit
spine config get hooks.syncMode
spine config set hooks.preCommit false
spine config set hooks.syncMode heavy
```

### Hook sync path

```bash
spine sync --hook
```

This refreshes index and cache state without regenerating Atlas docs. It is the default managed-hook path and is intended for high-frequency local index refreshes.

If you want the managed pre-commit hook to run a full incremental sync instead, use `spine hook set-mode standard` or `spine hook set-mode heavy`. Those modes reuse the normal `spine sync` path and only differ in runtime mode.

### God mode dossier

```bash
spine god
```

God mode is a separate human-only command. It does not hook into normal `sync`, and it writes a single oversized dossier to `.spine/<repo-name>-god.md`.

This mode is intentionally non-production:

- it is a joke mode for human reading
- it overwrites the previous `.spine/<repo-name>-god.md` on every run
- it should not be treated as part of the normal machine-facing control plane

### Diagnostics

```bash
spine status
spine history <file_path>
spine languages show
spine usage
spine info
spine scan --dry-run
```

Use these to inspect sync state, historical semantic drift, language detection, token usage, current workspace summary, and effective scan boundaries.

For prompt and validate troubleshooting, also use:

- `SPINE_DIAGNOSTICS_MODE=debug spine check`
- `spine llm show`

Diagnostics snapshots are written under `.spine/diagnostics/` only when diagnostics mode is explicitly enabled.

## Troubleshooting

### Lock collision

If you see a lock collision, stale lock warning, or owner-unverifiable lock warning, confirm no other ArchSpine process is running before deleting `.spine/.lock`.

### Unexpected scan coverage

Run `spine scan --dry-run` first, then inspect:

- `.gitignore`
- `.spineignore`
- `.spineignore.local`
- `scanPolicy.fileSource`

### Language detection surprises

Use `spine languages show` to inspect configured documentation languages, detected languages, parser availability, and unmapped extensions.
