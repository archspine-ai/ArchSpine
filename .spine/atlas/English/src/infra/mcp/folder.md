<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/mcp","role":"MCP infrastructure layer that bridges ArchSpine's internal capabilities with external AI agents through the Model Context Protocol.","responsibility":"Provides the complete MCP server implementation including context-gated resource access, tool definitions for codebase analysis, and stdio transport for agent communication, enabling external AI systems to query architectural metadata, scan files against rules, and access project context.","children":[{"filePath":"src/infra/mcp/context.ts","role":"Infrastructure facade class for gating Model Context Protocol (MCP) context flow based on priming state and operational mode.","fileKind":"source"},{"filePath":"src/infra/mcp/resources.ts","role":"Infrastructure facade providing MCP resource templates and handlers for accessing ArchSpine project metadata and files within the .spine directory, with context-aware access control via MCPContextGate.","fileKind":"source"},{"filePath":"src/infra/mcp/server.ts","role":"Infrastructure facade implementing the Model Context Protocol (MCP) server to expose ArchSpine's internal resources and tools to external AI agents via stdio transport.","fileKind":"source"},{"filePath":"src/infra/mcp/tools.ts","role":"MCP (Model Context Protocol) tool facade exposing ArchSpine system capabilities as queryable tools for external AI agents.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T07:20:42.969Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/mcp` — MCP Infrastructure Layer

This directory implements the **Model Context Protocol (MCP)** server that bridges ArchSpine's internal capabilities with external AI agents. It provides a complete stdio-based transport layer through which AI systems can query architectural metadata, scan files against rules, and access project context.

## Key Files

- **`server.ts`** — The main MCP server implementation. It sets up the stdio transport and registers all resources and tools, acting as the entry point for agent communication.

- **`context.ts`** — Defines `MCPContextGate`, an infrastructure facade that gates context flow based on priming state and operational mode. This ensures that only authorized or properly initialized requests reach the underlying system.

- **`resources.ts`** — Provides MCP resource templates and handlers for accessing ArchSpine project metadata and files within the `.spine` directory. All resource access is mediated through `MCPContextGate` for context-aware control.

- **`tools.ts`** — Exposes ArchSpine system capabilities as queryable tools for external AI agents. This includes tools for codebase analysis, rule scanning, and architectural metadata retrieval.

## Implementation Areas

The most critical implementation areas are:

1. **Context gating** — The `MCPContextGate` in `context.ts` is the security and state boundary. It must correctly validate priming state and operational mode before allowing any resource or tool access.

2. **Resource exposure** — `resources.ts` defines how project metadata and files are exposed as MCP resources. This is the primary way agents read ArchSpine's architectural data.

3. **Tool definitions** — `tools.ts` defines the queryable tools that agents can invoke. These tools must be well-typed and properly documented to enable effective agent interaction.

4. **Server lifecycle** — `server.ts` manages the MCP server's lifecycle, including transport setup, resource/tool registration, and graceful shutdown.