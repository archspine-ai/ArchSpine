# Changelog

ArchSpine public release notes are recorded here.

## [1.0.1] - 2026-05-12

### Changed

- GitHub Actions updated to latest versions: actions/checkout v4->v6, actions/upload-pages-artifact v3->v5, actions/deploy-pages v4->v5, softprops/action-gh-release v2->v3, actions/stale v9->v10
- Branch protection rulesets updated with 5 required status checks and strict mode

### Fixed

- ESLint errors resolved across 8 files
- better-sqlite3 native module rebuilt for Node.js v24
- VitePress documentation build issues resolved

### Documentation

- Deployed to GitHub Pages at archspine-ai.github.io/ArchSpine/

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
