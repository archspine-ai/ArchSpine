<!-- spine-content-hash:16b11e6041f2e3cbcab5ceb94eaf7f41c98b263efff45867a00bb3d20cf805bb -->
# ArchSpine Public Interface Inventory

## Purpose
This document provides a machine-generated map of all public entry points in the ArchSpine system. It is intended to give developers and AI agents a quick overview of what interfaces are available for interaction, including CLI commands, MCP tools, and exported modules.

## Context & Audience
The primary audience includes developers integrating with or extending ArchSpine, as well as AI agents that need to understand the system's public API surface. This document is generated automatically and should be refreshed via `spine sync` to remain accurate.

## Key Takeaways
- The document is auto-generated and reflects the current state of the codebase.
- It covers three categories: CLI, MCP, and exported modules.
- It is an experimental view that requires manual refresh to stay up-to-date.

## File Role
This file serves as a generated inventory of all public-facing interfaces in the ArchSpine system, including CLI commands, MCP tools, and exported modules.

## Key Responsibilities
- Listing all CLI entry points with their descriptions
- Listing all MCP entry points with their descriptions
- Listing all exported modules with their descriptions
- Providing a snapshot of the system's public API surface

## Notable Invariants & Negative Scope
- **Out of scope:** Internal implementation details, private or non-exported functions, runtime behavior or performance characteristics, configuration or setup instructions.
- **Invariants:** None currently defined.

## Most Important Exported / Externally Visible Behavior
The primary externally visible behavior is the ability to enumerate all public interfaces across CLI, MCP, and module boundaries. This document is the authoritative snapshot of what is available for external consumption.