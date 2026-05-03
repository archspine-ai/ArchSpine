# ArchSpine Changelog Summary

## Purpose of This Document
This changelog is the official public record of all notable changes to the ArchSpine project. It exists to give developers, users, and contributors a clear, chronological overview of new features, improvements, and bug fixes across releases. By reading it, you can quickly determine what has changed between versions without diving into commit logs or internal tickets.

## Who Should Read It
- **Developers** who integrate or extend ArchSpine workflows.
- **Users** who need to understand what capabilities or fixes are available in a given release.
- **Contributors** who want to track project evolution and ensure their work aligns with the latest state.

## Workflows and Decisions Anchored by This Document
- **Core CLI workflows** – `spine try`, `init`, `build`, `sync`, `publish`, `check`, `fix`, and `mcp start` – are introduced in version 1.0.0 and form the foundation of all ArchSpine operations.
- **Reliability guarantees** (atomic writes, lock-based mutual exclusion, sync recovery) are documented per release, informing upgrade decisions and deployment planning.
- **Documentation availability** in English and Simplified Chinese is tracked here, helping multilingual audiences find the right entry points.
- Version 1.0.0 marks the initial open-source release, which anchors the project’s commitment to transparent, community-driven development.

## Key Takeaways (from Version 1.0.0)
- First public release of the ArchSpine CLI and `.spine/` local control plane.
- Seven core workflows plus experimental features (e.g., `spine mcp start`).
- Built-in reliability: protected writes, lock-based exclusion, and sync recovery.
- Full documentation in English and Simplified Chinese – README, protocols, runbooks, MCP, LLM config, cost management, and God Mode capabilities.