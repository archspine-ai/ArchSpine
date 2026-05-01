<!-- spine-content-hash:e117a8dd04548fde000352fe2cad7d3e0e865d22cba8b9f04f46f3e0a1bfd42d -->
# ArchSpine MCP CLI Adapter

## Role
CLI command adapter for starting the ArchSpine Model Context Protocol (MCP) server.

## Key Responsibilities
- Parses command-line arguments for the `mcp` subcommand.
- Instantiates and starts the `ArchSpineMCPServer` when the `start` subcommand is invoked.
- Provides a structured interface (`ExecuteMcpCommandOptions`) for MCP command execution options.
- Delegates server lifecycle management to the dedicated MCP server implementation in the infrastructure layer.

## Notable Invariants & Negative Scope
- **Must remain a thin adapter** – all MCP server logic belongs in the infrastructure layer (`infra/mcp/server`).
- **Must not absorb** business logic, pipeline, or persistence responsibilities.
- **Out of scope**: implementing MCP server logic, persistence or pipeline operations, and complex command-line argument validation beyond basic subcommand routing.

## Most Important Exported / Externally Visible Behavior
- `ExecuteMcpCommandOptions` interface
- `executeMcpCommand` function