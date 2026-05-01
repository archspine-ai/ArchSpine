<!-- spine-content-hash:28970da510c8271a0cb668fd86aa7b0706ba355e06b2bb53f0ff82a0a26def64 -->
# ArchSpineMCPServer

**Role:** Infrastructure facade implementing the Model Context Protocol (MCP) server to expose ArchSpine's internal resources and tools to external AI agents via stdio transport.

## Key Responsibilities

- Initializes and manages the MCP SDK Server instance with stdio transport.
- Registers request handlers for MCP resource listing, reading, tool listing, and tool execution.
- Delegates resource retrieval to the `SpineResources` module.
- Delegates tool definitions and execution to the `SpineTools` module.
- Integrates with `Manifest` and `Config` to load project context and MCP context mode.
- Wraps errors using `toArchSpineError` for consistent error reporting.

## Out of Scope

- Direct implementation of resource or tool logic (delegated to `SpineResources` and `SpineTools`).
- Transport layer beyond stdio (e.g., HTTP, WebSocket).
- Authentication or authorization of MCP requests.

## Invariants

- Must maintain the MCP protocol request/response schema for resource and tool interactions.
- Must delegate resource and tool operations to dedicated modules (`SpineResources`, `SpineTools`).
- Must use stdio transport for communication with external agents.

## Public Surface

- **Class:** `ArchSpineMCPServer`
- **Constructor:** `constructor(config: Config, manifest: Manifest)`
- **Method:** `start()`

## Architectural Intent

Provide a stable MCP server facade that bridges ArchSpine's internal capabilities to external AI agents, following the subsystem facade pattern to resolve layer inversions.