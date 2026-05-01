<!-- spine-content-hash:ab521e4ea6b96d6baae6c5d153f73f33715847aa23b8fd72a9e914d5f3ed8e76 -->
# ArchSpine Configuration File Summary

## Role
Central configuration file for the ArchSpine project mirror system, defining project metadata, LLM/MCP settings, hook behavior, artifact strategy, scan policy, and initialization state.

## Key Responsibilities
- Register project metadata and supported locales
- Control LLM and MCP context mode behavior
- Configure pre-commit hooks and synchronization mode
- Define artifact generation strategy and view layer enablement
- Establish file scanning policy with ignore chain and protocol exclusions/inclusions
- Manage initialization state for agent instructions, ignore files, and git attributes

## Notable Invariants
- `schemaVersion` must be `'1.0.0'` for compatibility
- `project.locales` must include at least `'English'` and `'Simplified Chinese'`
- `mcp.contextMode` must be `'off'` to avoid context interference
- `hooks.preCommit` must be `false` to prevent automatic commits
- `artifacts.strategy` must be `'distributable'`
- `scanPolicy.fileSource` must be `'git-tracked'`
- `scanPolicy.ignoreChain.inheritGitIgnore` must be `true`
- `scanPolicy.protocolExclusions` must include `'.spine/'`
- `scanPolicy.protocolInclusions` must include `'.spine/rules/'` and `'.spine/config.json'`
- `initState.artifactStrategy` must match `artifacts.strategy`

## Negative Scope (Out of Scope)
- No out-of-scope items are explicitly defined.

## Most Important Exported / Externally Visible Behavior
- The configuration enforces a strict scanning policy that only processes git-tracked files, ensuring predictable and secure file analysis.
- The ignore chain inherits `.gitignore` rules and adds project-level (`.spineignore`) and local (`.spineignore.local`) ignore files, providing layered exclusion control.
- Protocol exclusions prevent scanning of the `.spine/` directory itself, while inclusions ensure critical configuration files (`config.json` and `rules/`) are always scanned.
- Artifact generation uses a `'distributable'` strategy, producing portable outputs suitable for sharing.
- MCP context mode is disabled (`'off'`), preventing unintended context injection that could interfere with system behavior.
- Pre-commit hooks are disabled, avoiding automatic commits that could destabilize the repository.
- Initialization state carefully tracks which files are managed and created by ArchSpine versus the user, preventing accidental overwrites of user-created files.

## Stability and Risks
This configuration file is critical for system stability. The scan policy ensures only git-tracked files are scanned, with a robust ignore chain that inherits `.gitignore` and adds project/local ignores. Protocol exclusions prevent scanning of the `.spine/` directory itself, while inclusions ensure key configuration files are always scanned. The artifact strategy is set to `'distributable'`, which is safe for sharing. The MCP context mode is disabled, reducing risk of unintended context injection. Pre-commit hooks are disabled, preventing automatic commits that could destabilize the repository. The initialization state carefully manages which files are created by ArchSpine versus the user, avoiding overwrites. Overall, this configuration promotes a stable, predictable mirror system with minimal risk of data loss or corruption.