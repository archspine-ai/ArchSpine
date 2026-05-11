# Connect MCP to Your Agent

ArchSpine exposes the `.spine/` control plane over STDIO using the **Model Context Protocol (MCP)**. This guide covers everything you need to connect your AI agent -- whether you use Claude Desktop, Claude Code, or Cursor.

## What Is MCP?

MCP is an open protocol that lets AI agents discover and call tools, read resources, and use prompts from a server. ArchSpine runs an MCP server over STDIO that exposes the full .spine/ control plane: semantic index, dependency graph, architecture rules, derived views, and more.

The MCP server is a **pass-through** to data that `spine sync` has already computed. It makes no LLM calls at runtime.

## Prerequisites

- Node.js >= 20
- A repository with `.spine/` initialized (`spine init` completed)
- For the full toolset: `spine sync` should have been run at least once

## Quick Setup

The fastest way to connect is the auto-detection command:

```bash
spine mcp setup
```

This command scans your system for supported MCP clients, detects which ones already have ArchSpine configured, and writes the correct settings for all targets.

**What it detects and configures:**

| MCP Client               | Config File                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| Claude Code (project)    | `.mcp.json` in your repository root                               |
| Claude Code (global)     | `~/.claude/mcp.json`                                              |
| Claude Desktop (macOS)   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json`                     |
| Cursor                   | `~/.cursor/mcp.json`                                              |

**Expected output:**

```
ArchSpine MCP Setup
===================

Resolved command: npx --yes archspine@latest

Already configured:
  ✅ Claude Code (global) (~/.claude/mcp.json)

Available targets:
  ✅ (already configured) Claude Code (project)
  ✅ (already configured) Claude Code (global)
  📝 (will update) Claude Desktop
  🆕 (new file) Cursor

Writing configurations...
  ✅ Claude Code (project): .mcp.json
  ✅ Claude Code (global): ~/.claude/mcp.json
  ✅ Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json
  ✅ Cursor: ~/.cursor/mcp.json

Next steps:
  1. Restart your IDE or Claude Desktop for changes to take effect
  2. Verify the connection: look for "archspine" in the MCP server list
  3. Try an MCP tool: ask your agent "what modules are in this project?"
```

The command never overwrites existing MCP servers in your config files -- it only adds or updates the `archspine` entry.

## Manual Setup

If auto-detection does not cover your setup, add the configuration manually. All clients use the same entry point: `spine mcp start`.

### Claude Code

Two configuration locations are supported. A **project-level** config (`.mcp.json` at the repo root) is recommended for team-shared setups:

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

For a **global** config that applies to every repository, edit `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

### Claude Desktop

Edit the desktop configuration file. On **macOS**:

`~/Library/Application Support/Claude/claude_desktop_config.json`

On **Windows**:

`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"]
    }
  }
}
```

### Passing Environment Variables

If your LLM provider uses environment variables (API keys, model names), add them to the `env` block:

```json
{
  "mcpServers": {
    "archspine": {
      "command": "npx",
      "args": ["--yes", "archspine@latest", "mcp", "start"],
      "env": {
        "SPINE_PROVIDER": "openai",
        "SPINE_MODEL": "gpt-4o",
        "SPINE_API_KEY": "sk-..."
      }
    }
  }
}
```

### Reloading After Configuration

| Client         | How to Reload                                          |
| -------------- | ------------------------------------------------------ |
| Claude Code    | Start a new session or run `/mcp reload`               |
| Claude Desktop | Restart the application                                |
| Cursor         | Reload the window (`Cmd+Shift+P` then "Reload Window") |

## Capabilities Overview

The ArchSpine MCP server exposes three capability groups:

- **21 tools** -- query the control plane for context, analysis, and governance
- **4 resource URIs** -- read structured data from the semantic index and views
- **2 prompts** -- guided templates for agents modifying code

All tools are read-only. No LLM calls are made during tool execution.

## Tool Categories

The 21 MCP tools fall into five logical categories. See [Reference: MCP Tools](/reference/mcp-tools) for the full specification with parameters.

| Category    | Tools                                                                                                                                 | Purpose                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Query**   | `spine_query_graph`, `spine_get_diagnostics`, `spine_match_semantic`, `spine_query_invariants`, `spine_query_responsibilities`        | Search the knowledge graph, find modules by semantic keywords, and look up architectural rules                     |
| **Context** | `spine_get_file_context`, `spine_get_module_context`, `spine_get_change_impact`, `spine_get_drift_history`, `spine_get_semantic_diff` | Get full governance context for a file or module, analyze change impact, and compare semantics across git refs     |
| **Status**  | `spine_get_sync_status`, `spine_get_baseline_status`, `spine_get_violations_summary`, `spine_get_config`, `spine_preview_scan`        | Check whether the .spine/ data is fresh, view active violations, and inspect configuration                         |
| **Views**   | `spine_get_view_data`, `spine_list_resource_templates`                                                                                | Read pre-computed views (public-surface, risk-hotspots, project-health, etc.) and discover available resource URIs |
| **Actions** | `spine_run_scan`, `spine_run_sync`, `spine_check_operation`                                                                           | Trigger a scan, run an incremental sync, or validate an operation against rules                                    |

## Resource URIs

The server exposes four resource URI templates. Agents can read these using the standard `resources/read` MCP method.

| URI Template               | What You Get                                                                                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spine://project`          | Full project-level architecture overview and module decomposition                                                                                                                 |
| `spine://folder/{dirPath}` | Architecture and file responsibilities within a specific directory (e.g., `spine://folder/src/services`)                                                                          |
| `spine://file/{filePath}`  | Semantic contract, architectural invariants, and structural skeleton for a single file (e.g., `spine://file/src/cli/index.ts`)                                                    |
| `spine://view/{viewType}`  | Pre-computed view data for any enabled view type. Supported types: `public-surface`, `risk-hotspots`, `architecture-diagram`, `project-health`, `agent-briefing`, `change-impact` |

For folder and file resources, the server strips verbose internal data (provenance traces, declared symbol lists) to reduce token consumption -- a feature called _Agent Context Bloat prevention_.

## MCP Prompts

Prompts are reusable templates that guide agent behavior. The server provides two:

### architectural_context

Use this prompt when you need to understand a file's role, dependencies, and constraints before making changes. Takes a single required argument:

```
architectural_context(filePath: "src/services/sync-service.ts")
```

The prompt instructs the agent to call three tools in sequence: `spine_get_file_context`, `spine_get_change_impact`, and `spine_check_operation` before modifying the file.

### pre_write_checklist

Use this prompt before creating, modifying, or deleting a file. It generates a safety checklist based on the operation type:

| Argument       | Required | Description                                                    |
| -------------- | -------- | -------------------------------------------------------------- |
| `filePath`     | Yes      | Relative file path to check                                    |
| `operation`    | Yes      | One of: `read`, `write`, `delete`, `rename`, `import`          |
| `importTarget` | No       | Required when `operation` is `import`; the file being imported |

The prompt produces a multi-step checklist that verifies architectural compliance before proceeding.

## Context Gate

The MCPContextGate controls how agents discover the codebase. You configure it in `.spine/config.json` under `mcp.contextMode`. Three modes are available:

| Mode            | Behavior                                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `off`           | No restrictions. Agents can read any resource or call any tool without priming.                                                                                                                                             |
| `project-first` | Agents must read `spine://project` before accessing folder or file resources. This ensures they understand the project topology before diving into details.                                                                 |
| `search-first`  | Agents must call a search tool (`spine_query_responsibilities`, `spine_query_invariants`, or `spine_preview_scan`) before accessing folder or file resources. This encourages targeted queries rather than blind traversal. |

Default is `project-first`. Change it with:

```bash
spine config set mcp.contextMode search-first
```

## Verification

Once configured, verify the connection in a new agent session.

**Check that the server starts:**

```bash
spine mcp start
```

Expected output on stderr:

```
ArchSpine MCP Server started on STDIO
```

Press `Ctrl+C` to stop. Your MCP client launches this same process automatically.

**Test tool discovery:**

Ask your agent:

> _"List the MCP tools available from ArchSpine."_

The agent should enumerate all 21 tools. If it does not see them, check your client's MCP connection logs for errors.

**Test a resource read:**

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"spine://project"}}' | spine mcp start
```

Or just ask your agent:

> _"What is the architecture topology of this project?"_

**Test a prompt:**

> _"Run the pre_write_checklist prompt for src/cli/index.ts with operation=write."_

The agent should respond with the safety checklist.

## Troubleshooting

### "spine: command not found"

The MCP client cannot resolve the `spine` binary. Use the full path or `npx`:

```json
{
  "command": "npx",
  "args": ["--yes", "archspine@latest", "mcp", "start"]
}
```

### ".spine is missing" errors

The repository has not been initialized yet. Run:

```bash
spine init
spine sync
```

Then restart the MCP connection.

### Agent does not use the tools

Agents may need a hint. Install the ArchSpine Claude Code skill:

```bash
spine skill install
```

This writes agent instructions to `~/.claude/skills/archspine/` that tell your agent to consult the control plane when entering a repository.

### Tool returns "unknown" errors

The MCP server version may be out of sync with the .spine/ index. Run:

```bash
spine sync
```
