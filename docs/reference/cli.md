---
outline: deep
---

# CLI Reference

Full reference for the ArchSpine command-line interface. 14 active commands, grouped by function.

**Source:** `src/cli/index.ts` (dispatch), `src/cli/help.ts` (help text), `src/cli/commands/*.ts` (implementations).

## Top-Level Flags

| Flag                       | Description                       |
| -------------------------- | --------------------------------- |
| `--version`, `-v`          | Print version and exit            |
| `--help`, `-h`             | Print general help and exit       |
| `<cmd> --help`, `<cmd> -h` | Print help for a specific command |

## Exit Codes

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| `0`  | Success                                            |
| `1`  | Command failed (all errors default to exit code 1) |

Exit codes are set by `ArchSpineError.exitCode`, which defaults to `1`. Source: `src/core/errors.ts`.

## Command Reference

### Getting Started

Commands that work before initialization, designed for new users.

---

#### `init`

Initialize ArchSpine in the current repository.

**Usage:**

```bash
spine init [--agent-file <AGENTS.md|CLAUDE.md|GEMINI.md>]
           [--artifact-strategy <local|distributable>]
           [--inject-package-scripts | --no-inject-package-scripts]
```

**Flags:**

| Flag                          | Type   | Required | Default | Description                                                                  |
| ----------------------------- | ------ | -------- | ------- | ---------------------------------------------------------------------------- |
| `--agent-file`                | string | No       | —       | Agent instructions file to inject (`AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`) |
| `--artifact-strategy`         | string | No       | —       | Artifact management strategy (`local` or `distributable`)                    |
| `--inject-package-scripts`    | —      | No       | —       | Inject `npx`-based helper scripts into `package.json`                        |
| `--no-inject-package-scripts` | —      | No       | —       | Skip `package.json` script injection                                         |

**Behavior:**

1. Prompts for documentation languages.
2. Prompts for rule templates.
3. Prompts for Git hook setup.
4. Optionally prompts for LLM configuration.
5. Optionally injects an agent instructions file (`AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`).
6. Optionally injects `npx`-based helper scripts into `package.json`.
7. Creates `.spine/config.json` with the chosen settings.

After initialization, run `spine sync` to build the semantic index.

**Source:** `src/cli/commands/init.ts`

---

#### `try`

Zero-config preview: see what ArchSpine detects without API keys or a control plane.

**Usage:**

```bash
spine try
```

**Flags:** None (rejects arguments).

**Behavior:** Reads the repository to detect whether `.spine/` inputs and distributable snapshots already exist, discovers the language landscape, runs a sample AST extraction for up to three languages, and prints explicit next steps. Does not modify repository state.

**Source:** `src/cli/commands/try.ts`

---

#### `scan`

Preview the effective scan boundary or run a quick AST scan.

**Usage:**

```bash
spine scan --dry-run
spine scan --quick
```

**Flags:**

| Flag        | Type | Required        | Description                                                                                       |
| ----------- | ---- | --------------- | ------------------------------------------------------------------------------------------------- |
| `--dry-run` | —    | Yes (when used) | Preview the effective scan boundary and ignore chain without writing anything                     |
| `--quick`   | —    | Yes (when used) | Pure AST scan without LLM. Generates a knowledge graph to `.spine/view/data/knowledge-graph.json` |

The two flags are mutually exclusive. One must be provided.

**Behavior:**

- `--dry-run`: Reads the current `ScanPolicy` from `.spine/config.json` (or defaults), evaluates the ignore chain, computes the scan boundary, and prints the effective configuration.
- `--quick`: Scans the repository using AST extraction only. Reports file counts, language statistics, and module dependency information.

**Source:** `src/cli/commands/scan.ts`

---

### Daily Use

Primary workflow commands for day-to-day use.

---

#### `sync`

Incremental sync: refresh the semantic index and views from changed files.

**Usage:**

```bash
spine sync [--hook] [--repair-violations] [--retry-failed]
```

**Flags:**

| Flag                  | Type | Required | Default | Description                                                                                        |
| --------------------- | ---- | -------- | ------- | -------------------------------------------------------------------------------------------------- |
| `--hook`              | —    | No       | —       | Lightweight index-only refresh for pre-commit hooks. Skips semantic index regeneration             |
| `--repair-violations` | —    | No       | —       | Repair protected generated outputs. Escalates to a full build if violations exceed targeted bounds |
| `--retry-failed`      | —    | No       | —       | Re-run failed summarization or state-commit files from the latest sync checkpoint                  |

The three flags are mutually exclusive. Only one may be used at a time.

**Behavior:**

1. Checks for a valid semantic mirror baseline. A virgin state requires `spine build` first.
2. Detects language landscape changes since the last sync.
3. Runs incremental sync on changed files via the `SyncService`.
4. In hook mode, skips semantic index regeneration and prints a summary.
5. Refreshes V2 agent instruction blocks if an agent file is configured.

**Source:** `src/cli/commands/sync.ts`

---

#### `check`

Audit the project against architecture rules defined in `.spine/rules/`.

**Usage:**

```bash
spine check
```

**Flags:** None.

**Behavior:** Loads rules from `.spine/rules/`, matches them against tracked files using picomatch glob patterns, and reports violations grouped by file and rule. Exits with code 1 if any violations or validation failures are found.

**Note:** `spine check` is experimental. For architectural governance, consider using MCP tools to read the `.spine/` control plane directly.

**Source:** `src/cli/commands/check.ts`

---

#### `info`

Show workspace configuration, sync status, and protocol summary.

**Usage:**

```bash
spine info [--verbose]
```

**Flags:**

| Flag        | Type | Required | Default | Description                                                                          |
| ----------- | ---- | -------- | ------- | ------------------------------------------------------------------------------------ |
| `--verbose` | —    | No       | —       | Show detailed runtime resolution of LLM settings, including the source of each value |

**Behavior:** Prints a snapshot of workspace configuration, sync data, and protocol version. Without `.spine/`, shows available info and indicates what is missing.

**Source:** `src/cli/commands/info.ts`

---

#### `view`

Show, update, or manually generate views. Also provides a web dashboard and semantic drift history.

**Usage:**

```bash
spine view <subcommand> [args]
```

**Subcommands:**

| Subcommand | Arguments     | Description                                                                                  |
| ---------- | ------------- | -------------------------------------------------------------------------------------------- |
| `show`     | none          | Print view status: layer on/off, configured views, effective views, and available views list |
| `set`      | none          | Open interactive view selector prompt                                                        |
| `enable`   | `<view-id>`   | Enable a single view ID                                                                      |
| `disable`  | `<view-id>`   | Disable a single view ID                                                                     |
| `describe` | `<view-id>`   | Inspect a registered view definition                                                         |
| `generate` | none          | Manually derive all enabled views from the current index                                     |
| `serve`    | `[port]`      | Start a web dashboard (default port: 7899)                                                   |
| `history`  | `<file-path>` | View the semantic drift history of a specific file                                           |

**Available view IDs** (source: `src/services/view/view-registry.ts`):

| View ID                | Title                | Full Sync | LLM | Outputs                                                                              |
| ---------------------- | -------------------- | --------- | --- | ------------------------------------------------------------------------------------ |
| `public-surface`       | Public Surface       | no        | no  | `public-surface.json`, `public-surface.md`                                           |
| `risk-hotspots`        | Risk Hotspots        | no        | no  | `risk-hotspots.json`, `risk-hotspots.md`                                             |
| `architecture-diagram` | Architecture Diagram | yes       | no  | `architecture-diagram.json`, `architecture-diagram.html`, `architecture-diagram.svg` |
| `project-health`       | Project Health       | no        | no  | `project-health.md`                                                                  |
| `agent-briefing`       | Agent Briefing       | no        | no  | `agent-briefing.md`                                                                  |
| `change-impact`        | Change Impact        | no        | no  | `change-impact.json`, `change-impact.md`                                             |

**Source:** `src/cli/commands/view.ts`, `src/services/view/view-registry.ts`

---

### MCP Integration

Commands for connecting AI agents to the ArchSpine control plane.

---

#### `mcp`

Configure or start the MCP server for IDE and agent integration.

**Usage:**

```bash
spine mcp <start|setup>
```

**Subcommands:**

| Subcommand | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `start`    | Start the MCP server on STDIO transport using the JSON-RPC protocol      |
| `setup`    | Auto-detect and configure MCP for Claude Code, Claude Desktop, or Cursor |

**Behavior (setup):** Detects the IDE and writes the appropriate MCP configuration files. For Claude Code, writes to `.claude/mcp.json` or `.mcp.json`. For Claude Desktop, writes to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent platform path. For Cursor, writes to `~/.cursor/mcp.json`.

**Behavior (start):** Starts the ArchSpine MCP server on STDIO. The server is read-only and does not write `.spine/` protocol artifacts.

**Source:** `src/cli/commands/mcp.ts`

---

#### `skill`

Install or uninstall the ArchSpine Claude Code agent skill.

**Usage:**

```bash
spine skill <install|uninstall>
```

**Subcommands:**

| Subcommand  | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `install`   | Install the ArchSpine agent skill to `~/.claude/skills/archspine/` |
| `uninstall` | Remove the ArchSpine agent skill                                   |

When installed, Claude Code agents automatically consult the `.spine/` control plane when entering repositories that use ArchSpine.

**Source:** `src/cli/commands/skill.ts`

---

### Configuration

Commands for managing settings, rules, and lifecycle.

---

#### `config`

Read or write persisted configuration values.

**Usage:**

```bash
spine config <get|set> <key> [value]
```

**Subcommands:**

| Subcommand | Arguments       | Description                 |
| ---------- | --------------- | --------------------------- |
| `get`      | `<key>`         | Read a configuration value  |
| `set`      | `<key> <value>` | Write a configuration value |

**Supported keys:**

| Key                      | Type     | Description                                                 |
| ------------------------ | -------- | ----------------------------------------------------------- |
| `llm.provider`           | string   | LLM provider name (for example, `openai`, `anthropic`)      |
| `llm.model`              | string   | Model name (for example, `gpt-4o`)                          |
| `llm.baseURL`            | string   | Custom API base URL                                         |
| `hooks.preCommit`        | boolean  | Enable or disable pre-commit sync                           |
| `hooks.syncMode`         | string   | Hook sync strategy (`hook`)                                 |
| `artifacts.strategy`     | string   | Artifact distribution strategy (`local` or `distributable`) |
| `artifacts.viewLayer`    | boolean  | Enable or disable the view layer                            |
| `artifacts.enabledViews` | string[] | List of enabled view IDs                                    |

**Source:** `src/cli/commands/config.ts`

---

#### `llm`

Manage global or project LLM settings.

**Usage:**

```bash
spine llm [--global | --project] <show|setup|set|clear|test>
```

**Flags:**

| Flag        | Type | Required | Default | Description                                                  |
| ----------- | ---- | -------- | ------- | ------------------------------------------------------------ |
| `--global`  | —    | No       | Yes     | Target the global config (`~/.config/archspine/config.json`) |
| `--project` | —    | No       | —       | Target the project config (`.spine/config.json`)             |

**Subcommands:**

| Subcommand | Description                                                           |
| ---------- | --------------------------------------------------------------------- |
| `show`     | Print current LLM settings and their resolution sources               |
| `setup`    | Interactive LLM setup wizard                                          |
| `set`      | Set a specific LLM field (`provider`, `model`, `base-url`, `api-key`) |
| `clear`    | Clear a specific LLM field (`api-key`)                                |
| `test`     | Test the current LLM configuration                                    |

**Examples:**

```bash
spine llm show
spine llm setup
spine llm --project set provider openai
spine llm --global clear api-key
```

**Source:** `src/cli/commands/llm.ts`

---

#### `rules`

Pre-load architecture rule templates to `.spine/rules/`.

**Usage:**

```bash
spine rules add <template-name>
```

**Subcommands:**

| Subcommand | Arguments         | Description                                      |
| ---------- | ----------------- | ------------------------------------------------ |
| `add`      | `<template-name>` | Add a pre-built rule template to `.spine/rules/` |

**Available templates:**

| Template                | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `no-core-to-cli`        | Core modules cannot be imported by CLI modules          |
| `no-cross-layer`        | Strict layer isolation with unidirectional dependencies |
| `no-circular-deps`      | Circular dependency detection                           |
| `public-surface-stable` | Public API surface must remain backward compatible      |
| `test-must-exist`       | Every module must have adjacent tests                   |

**Examples:**

```bash
spine rules add no-cross-layer
spine rules add no-circular-deps
```

**Source:** `src/cli/commands/rules.ts`

---

#### `remove`

Remove `.spine/` state and all ArchSpine-managed files from the repository.

**Usage:**

```bash
spine remove [--yes]
```

**Flags:**

| Flag    | Type | Required | Default | Description                  |
| ------- | ---- | -------- | ------- | ---------------------------- |
| `--yes` | —    | No       | —       | Skip the confirmation prompt |

**Behavior:** Deletes the `.spine/` directory, removes the ArchSpine-managed Git hook block from `.git/hooks/`, and cleans up managed entries in agent instructions files, `.gitignore`, `.gitattributes`, `.spineignore`, `.ignore`, and `package.json` scripts.

**Source:** `src/cli/commands/remove.ts`

---

### Recovery

---

#### `build`

Full rebuild of the semantic mirror baseline from scratch.

**Usage:**

```bash
spine build
```

**Flags:** None (rejects arguments).

**Behavior:**

1. Uses strict validation and semantic-first generation.
2. Rebuilds `.spine/index/` from scratch.
3. Uses full sync (not hook mode).

Use for new repositories, major refactors, runtime recovery, or whenever the trusted baseline must be rebuilt. For everyday use, prefer `spine sync`.

**Source:** `src/cli/commands/build.ts`

---

## Redirected Commands

The following commands were once top-level commands but have been redirected to subcommands. They still work as aliases but are hidden from the general help output.

| Old Command     | New Usage              |
| --------------- | ---------------------- |
| `spine publish` | `spine sync --publish` |
| `spine status`  | `spine info status`    |
| `spine usage`   | `spine info --usage`   |
| `spine hook`    | `spine config hook`    |
| `spine repo`    | `spine config repo`    |
| `spine history` | `spine view history`   |

The following commands have been **removed** and are no longer available:

- `spine god` — removed
- `spine fix` — removed

## Environment Variables

| Variable          | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `SPINE_PROVIDER`  | Fallback LLM provider when project config is unset  |
| `SPINE_API_KEY`   | API key for LLM authentication                      |
| `SPINE_MODEL`     | Fallback model when project config is unset         |
| `SPINE_BASE_URL`  | Fallback base URL when project config is unset      |
| `SPINE_PRECOMMIT` | Override pre-commit sync toggle (`true` or `false`) |
