# Public Surface Map

## Purpose

This document serves as a comprehensive registry of all public-facing interfaces in the ArchSpine system. It is automatically generated to provide a single source of truth for CLI commands, MCP endpoints, and exported modules, ensuring developers and AI agents can quickly discover available entry points.

## Audience

Intended for developers, system integrators, and AI agents who need to understand the complete public API surface of ArchSpine. This includes both human readers reviewing the system's capabilities and automated tools that consume the structured data for integration or testing purposes.

## Key Takeaways

- Auto-generated inventory of all public entry points
- Covers three categories: CLI, MCP, and exported modules
- Refreshed via `spine sync` command
- Experimental view that evolves with the system

## Document Structure

The document is organized into three main sections:

- **CLI Entry Points**: Lists all command-line interface commands and their entry points.
- **MCP Entry Points**: Documents all Model Context Protocol endpoints.
- **Exported Modules**: Catalogs all exported module interfaces.

Each section provides a machine-readable and human-readable map of the system's public surface, making it easy to discover and integrate with ArchSpine's capabilities.

## Workflow Anchors

This document anchors the following workflows:

- **Discovery**: Developers and AI agents use this map to find available entry points.
- **Integration**: System integrators reference this document to understand how to connect with ArchSpine.
- **Testing**: Automated tools consume the structured data for integration or testing purposes.
- **Evolution**: The document is refreshed via `spine sync` as the system evolves.

---

_Experimental view. Refresh via `spine sync`._