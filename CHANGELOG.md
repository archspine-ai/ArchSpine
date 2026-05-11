# Changelog

ArchSpine public release notes are recorded here.

## [1.0.0] - 2026-05-03

### Added

- Initial open-source release of the ArchSpine CLI and local `.spine/` control plane.
- Core workflows: `spine try`, `spine init`, `spine build`, `spine sync`, `spine publish`, `spine check`, `spine fix`, and `spine mcp start`.
- Repository artifact strategies for local-only runtime state and distributable semantic snapshots.
- Architecture rule templates, schema assets, and experimental view outputs.
- Global and project-level LLM configuration with secure credential storage backends.

### Reliability

- Runtime writes use protected output boundaries, atomic file writes, and lock-based mutual exclusion.
- Publish preflight validates runtime baseline completeness and refuses active or stale lock states.
- Sync recovery supports retrying failed files and repairing protected output mutations.

### Documentation

- English and Simplified Chinese README and docs entry points.
- Protocol, runbook, MCP, local LLM, cost, God Mode, and current capabilities documentation.
