# ArchSpine MCP Architecture

This document explains how ArchSpine turns `.spine` assets into a local MCP surface so AI agents can query repository structure without loading the entire codebase into a prompt.

## Why MCP matters here

Large models make implementation mistakes when they edit complex repositories without reliable structure. ArchSpine uses MCP to expose a smaller, queryable control plane instead of overfeeding raw source files.

Benefits:

- lower token pressure because agents fetch only the context they need
- stronger syntax and architecture grounding because data comes from deterministic extraction
- a standard integration path across Cursor, Claude Desktop, Claude Code, and similar tools

## Current architecture in `v0.4`

The current MCP server is a local STDIO server. It is designed to start inside the user workspace with no extra infrastructure.

Boundary posture in the current line:

- ArchSpine CLI/runtime remains the authoritative writer for official `.spine` outputs.
- MCP is intentionally read-only and is not part of the writer path inventory.
- Ordinary local agents may consume MCP data and edit repository source files, but they are not the formal writers of `.spine/index/**`, `.spine/atlas/**`, `.spine/cache.db*`, or `.spine/.lock`.

### Resources

Current runtime behavior:

- listed resource: `spine://project`
- readable URI patterns:
  - `spine://folder/{dirPath}`
  - `spine://file/{filePath}`

These resources map to `.spine/index/` JSON contracts, with file reads stripping some noisy internal fields before returning them.

### Tools

The shipped tools are:

- `spine_query_invariants`
- `spine_query_responsibilities`
- `spine_preview_scan`
- `spine_get_drift_history`

Together they let agents query rules, find relevant files, inspect scan boundaries, and read drift history without manually traversing the whole repository.

### Failure mode

If `.spine` assets do not exist yet, the MCP layer returns explicit errors that tell the user to run `spine init` and `spine sync` instead of crashing the process.

## Integration patterns

### Cursor

Configure a `stdio` MCP server that runs:

```bash
node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

### Claude Desktop

Mount the same command in `claude_desktop_config.json`.

### Claude Code / terminal clients

Use:

```bash
claude mcp add archspine node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

## Host deployment convention

The intended deployment contract is:

- agents run in a normal writable repository for day-to-day source edits
- protected `.spine` outputs stay read-only by default
- trusted `spine` commands temporarily unlock protected outputs, write them, then lock them again
- this is a host-assisted safety boundary for normal same-user workflows, not a hardened isolation model against malicious same-permission processes

## Design direction

The local MCP server is meant to make repository semantics directly consumable by agents:

- `spine://project` gives the topological overview
- folder and file URIs let the agent drill down when needed
- MCP tools expose governance and search flows that do not require raw-code guessing

That keeps ArchSpine aligned with its core purpose: deterministic repository understanding under enforceable constraints.
