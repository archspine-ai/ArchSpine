# MCP Integration

ArchSpine can expose your local `.spine` control plane to MCP-compatible AI tools over STDIO.

Boundary note: this MCP surface is read-only by design. It does not provide `.spine` write APIs or general repository write APIs. ArchSpine CLI/runtime remains the authoritative writer for official `.spine` outputs. This is part of the current collaboration boundary and runtime safety model, not a claim of strong same-permission host isolation.

## Start the server

```bash
spine mcp start
```

## Claude Desktop

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

## Cursor

Add a `stdio` MCP server from `Settings -> Features -> MCP`:

```json
{
  "name": "ArchSpine",
  "type": "stdio",
  "command": "node",
  "args": ["/absolute/path/to/archspine/dist/cli/index.js", "mcp", "start"]
}
```

## Claude Code / CLI

```bash
claude mcp add archspine node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

## What agents can access

### Resources

- `spine://project`

### Readable URI patterns

- `spine://folder/{path}`
- `spine://file/{filePath}`

### Tools

- `spine_query_invariants`
- `spine_query_responsibilities`
- `spine_preview_scan`
- `spine_get_drift_history`
- `spine_list_resource_templates`

## Optional context modes

If you want the agent to be nudged into a better reading order, set:

```bash
spine config set mcp.contextMode project-first
```

Supported values:

- `off`: no gating, current behavior
- `project-first`: require `spine://project` before folder or file reads
- `search-first`: require a search or scan tool call before folder or file reads

Folder and file URIs are readable once the client knows the pattern; the current server publicly lists only `spine://project`.
Use `spine_list_resource_templates` when a client needs a machine-readable way to discover those folder/file URI patterns before opening them.

## Why use MCP instead of giant prompts?

- Fetch only the part of the codebase the agent needs
- Keep rule and responsibility data close to the repository
- Reduce context drift in large engineering workflows

For operating details, continue with the [Runbook](../guides/RUNBOOK) and the [Protocol](../specs/PROTOCOL).
