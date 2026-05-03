# ArchSpine Configuration Summary

This configuration defines the operational boundaries and defaults for the ArchSpine mirror system. It controls scanning policy, artifact generation, hook behavior, and initial state management for agent instructions and ignore files.

## Key Parameters and Their Roles

### Scanning Policy
- **`scanPolicy.fileSource`**: Must be `"git-tracked"` to restrict scanning to version-controlled files only. Any other value risks scanning untracked or generated files.
- **`scanPolicy.ignoreChain`**: Inherits `.gitignore` patterns by default (`inheritGitIgnore: true`) and uses `.spineignore` for project-specific exclusions, with an optional local override `.spineignore.local`. This chain prevents unwanted files from entering the mirror.
- **`scanPolicy.protocolExclusions`**: The directory `.spine/` is excluded from scanning, but specific subpaths (`.spine/rules/`, `.spine/config.json`) are explicitly included via `protocolInclusions`. Ensure these lists remain accurate to avoid leaking internal configuration or missing required files.

### MCP Context Mode
- **`mcp.contextMode`**: Must be `"off"` to disable MCP context injection. Enabling this mode could introduce security vulnerabilities or unintended context exposure. This is a critical safety invariant.

### Hooks
- **`hooks.preCommit`**: Set to `false` to avoid unintended automation. Enabling pre-commit hooks may cause sync loops or block commits.
- **`hooks.syncMode`**: Set to `"hook"` meaning synchronization is triggered by hooks. Changing this could alter the sync behavior unexpectedly.

### Artifact Strategy
- **`artifacts.strategy`**: Must be `"distributable"` for consistent, package-ready artifact output. Other strategies may produce non‑standard results.
- **`artifacts.experimentalViewLayer`**: Currently enabled (`true`) for new UI features, but considered potentially unstable. Monitor for regressions.
- **`artifacts.enabledViews`**: The views `public-surface`, `risk-hotspots`, and `architecture-diagram` are selected. Adding or removing views changes artifact content.

### Initial State Management
The `initState` booleans indicate whether ArchSpine or the user manages specific configuration files:
- **`agentInstructionsCreatedByArchSpine`**: `false` means the `AGENTS.md` file is user-managed; modifying it by ArchSpine could overwrite user content.
- **`spineIgnoreManaged`, `searchIgnoreManaged`, `gitIgnoreManaged`, `gitAttributesManaged`**: All `true` — ArchSpine will manage these files. User edits may be overwritten during upgrades. If you need customizations, set these to `false` or use local ignore overrides.
- **`artifactStrategy`**: Must match `artifacts.strategy` (`"distributable"`). Inconsistency can break initialization.

## Stability and Operational Risks

- **Incorrect `mcp.contextMode`** or **`hooks.preCommit`** can introduce security gaps or automation conflicts.
- **Misaligned protocol exclusions/inclusions** may cause essential files to be omitted from the mirror or expose internal directories.
- **Changing `scanPolicy.fileSource`** from `"git-tracked"` risks scanning non‑Git files, potentially leaking secrets or configuration.
- **Editing managed files** (e.g., `.gitignore`, `.spineignore`) when `*Managed` is `true` will be overwritten by ArchSpine. Use local ignore files for customization.
- **Upgrade safety** depends on the `initState` settings: if you rely on user-managed files, ensure the corresponding `*Managed` booleans are `false`.

Review this configuration carefully before deployment, especially the exclusion/inclusion lists and hook settings.