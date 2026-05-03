# Public Surface Map — Summary

## Purpose

This document is an **auto-generated inventory** of the ArchSpine project's public interface. It lists every CLI command, MCP tool, and exported module, providing a single source of truth for what the system exposes externally. Because it is automatically refreshed via `spine sync`, it always reflects the current implementation without manual effort.

## Audience

- **Developers** who need to quickly discover available commands and APIs.
- **CI pipelines** that verify the documented surface matches the actual code.
- **AI agents** consuming the system's API and requiring a machine-readable catalog.
- **Maintainers** who want to confirm that all public entry points are accounted for.

## Key Takeaways

- The document is **auto-generated** — never edit it manually. Any changes to CLI, MCP, or module exports are captured by running `spine sync`.
- It serves dual purpose: a human-friendly overview for quick reference and a machine-parseable index for automated workflows.
- Consult this map as the **authoritative list** of public interfaces before integrating with or extending ArchSpine.

## How It Anchors Workflows

- **Onboarding** — new team members and agents can learn the full public surface in one place.
- **Syncing** — the `spine sync` command regenerates the map, ensuring documentation stays in lockstep with code.
- **Quality checks** — CI can compare this map against generated binding or client stubs to catch accidental API changes.