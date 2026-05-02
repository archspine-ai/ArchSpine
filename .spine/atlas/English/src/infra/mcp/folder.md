<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/mcp","role":"Implements the Model Context Protocol (MCP) infrastructure layer for exposing ArchSpine resources and tools to external AI agents.","responsibility":"Provides context-aware access control, resource templates, server initialization, and tool definitions to enable AI agents to query architectural metadata, perform preview scans, and access project files through a standardized protocol.","children":[{"filePath":"src/infra/mcp/context.ts","role":"Infrastructure facade class for gating Model Context Protocol (MCP) context flow based on priming state and operational mode.","fileKind":"source"},{"filePath":"src/infra/mcp/resources.ts","role":"Infrastructure facade providing MCP resource templates and handlers for accessing ArchSpine project metadata and files within the .spine directory, with context-aware access control via MCPContextGate.","fileKind":"source"},{"filePath":"src/infra/mcp/server.ts","role":"Infrastructure facade implementing the Model Context Protocol (MCP) server to expose ArchSpine's internal resources and tools to external AI agents via stdio transport.","fileKind":"source"},{"filePath":"src/infra/mcp/tools.ts","role":"MCP (Model Context Protocol) tool facade exposing ArchSpine system capabilities as queryable tools for external AI agents.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T07:41:43.477Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# src/infra/mcp – Model Context Protocol Infrastructure

This directory implements the Model Context Protocol (MCP) infrastructure layer for the ArchSpine mirror system. Its purpose is to expose ArchSpine’s internal architectural metadata, file resources, and system tools to external AI agents through a standardized, context-aware protocol over stdio transport.

## Notable Children & Grouping

The four source files here each represent a distinct facade of the MCP integration:

- **`context.ts`** – `MCPContextGate`: gates context flow based on priming state and operational mode. Controls whether an agent session is allowed to proceed.
- **`resources.ts`** – Provides resource templates and handlers for accessing `.spine` directory files and project metadata, gated by the context gate.
- **`server.ts`** – Bootstraps the MCP server itself, wiring together resources and tools over stdio.
- **`tools.ts`** – Defines queryable tools (e.g., for architectural queries, preview scans) that agents can invoke.

All files are grouped as “infrastructure facades” – they abstract the lower‑level details of MCP and expose a clean interface to the rest of the system.

## Key Implementation Areas

- **Access control**: `context.ts` enforces priming state and operational mode, preventing unauthorized access to sensitive resources.
- **Resource exposure**: `resources.ts` defines templates like `spine://metadata/{project}` and handlers that read from the `.spine` directory.
- **Tool definitions**: `tools.ts` exposes capabilities such as “query‑architecture”, “preview‑scan” with structured schemas.
- **Server lifecycle**: `server.ts` handles initialization, signal handling, and transport (stdio).

These submodules are the critical bridge between ArchSpine’s internal state and external AI agents, enabling secure, read‑only interaction with project metadata.