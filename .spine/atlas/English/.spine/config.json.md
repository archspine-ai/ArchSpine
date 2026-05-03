# ArchSpine Root Configuration Summary

## Role

Root configuration for the ArchSpine project mirror system, defining core operational parameters, scanning policy, artifact generation, hooks, and initialization defaults.

## Parameter Definitions

| Parameter | Description |
|-----------|-------------|
| `schemaVersion` | Defines the version of the configuration schema; must follow semver for compatibility. |
| `project.name` | The canonical name of the project being mirrored; used for identity in all subsystems. |
| `project.locales` | List of supported locales for atlas documentation; currently English and Simplified Chinese. |
| `llm` | LLM provider configuration; empty in this snippet, but can be populated with model endpoints. |
| `mcp.contextMode` | Determines context aggregation mode for MCP server; `'off'` means no context enrichment. |
| `hooks.preCommit` | Enables or disables pre-commit hook integration; `false` means hook is not active. |
| `hooks.syncMode` | Defines how sync operations are triggered; `'hook'` means via git hooks. |
| `artifacts.strategy` | Artifact distribution model; `'distributable'` means artifacts can be published separately. |
| `artifacts.experimentalViewLayer` | Enables experimental view layer for advanced rendering of architecture views. |
| `artifacts.enabledViews` | List of view types to generate: public-surface, risk-hotspots, architecture-diagram. |
| `scanPolicy.fileSource` | Determines which files the scanner considers; `'git-tracked'` only scans files in git index. |
| `scanPolicy.ignoreChain.inheritGitIgnore` | Whether to inherit patterns from the repository's `.gitignore`. |
| `scanPolicy.ignoreChain.projectIgnore` | Path to a project-level ignore file (`.spineignore`). |
| `scanPolicy.ignoreChain.localIgnore` | Path to a local override ignore file (`.spineignore.local`). |
| `scanPolicy.protocolExclusions` | Paths excluded from scanning by default; protects internal spine directories. |
| `scanPolicy.protocolInclusions` | Paths re-included from exclusions; ensures critical spine config is scanned. |
| `initState.artifactStrategy` | Initial artifact strategy used during first initialization. |
| `initState.agentInstructionsFile` | Name of the agent instructions file (default `AGENTS.md`). |
| `initState.agentInstructionsCreatedByArchSpine` | Flag indicating whether `AGENTS.md` was auto-generated. |
| `initState.spineIgnoreManaged` | Whether `.spineignore` is managed by ArchSpine. |
| `initState.spineIgnoreCreatedByArchSpine` | Flag indicating whether `.spineignore` was auto-generated. |
| `initState.searchIgnoreManaged` | Whether search ignore files are managed. |
| `initState.searchIgnoreCreatedByArchSpine` | Flag for auto-generation of search ignore. |
| `initState.gitIgnoreManaged` | Whether `.gitignore` is managed by ArchSpine. |
| `initState.gitIgnoreCreatedByArchSpine` | Flag for auto-generation of `.gitignore`. |
| `initState.gitAttributesManaged` | Whether `.gitattributes` is managed by ArchSpine. |
| `initState.gitAttributesCreatedByArchSpine` | Flag for auto-generation of `.gitattributes`. |

## Stability and Risks

This configuration file controls the core scanning and artifact pipeline. Misconfiguring `scanPolicy` (e.g., removing `protocolExclusions`) may cause ArchSpine to index its own internal files, leading to recursive loops and data corruption. Setting `hooks.preCommit` to true without proper testing can block commits unexpectedly. The `artifacts.experimentalViewLayer` feature is marked experimental; enabling it may introduce rendering instability. The `initState` flags are critical for upgrade and migration workflows; incorrect values may cause the system to overwrite user-managed files or fail to update managed files. The `mcp.contextMode` value `'off'` disables all context enrichment, which reduces LLM overhead but also reduces response quality for agent interactions. Overall, this file must be reviewed carefully during setup and upgrades.