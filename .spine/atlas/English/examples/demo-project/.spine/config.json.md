# ArchSpine Configuration Summary

This configuration file defines the foundational settings for the ArchSpine mirror system. It controls how the system identifies the project, which LLM engine is used for documentation generation, how MCP context is managed, whether pre‑commit hooks are active, and most critically, which files are scanned and indexed. The scan policy governs the entire data pipeline, making this file essential for accurate and secure indexing.

## Key Parameters

### Project Metadata
- **schemaVersion**: `1.0.0` – Must be a valid semantic version.  
- **project.name**: `archspine-demo` – Identifies the project within ArchSpine; used for artifact naming and telemetry.  
- **project.locales**: `["English", "Simplified Chinese"]` – Supported locales for multilingual documentation generation. Each locale must be registered in the system.

### LLM Provider
- **llm.provider**: `mock` – Selects the language model backend. `mock` is a safe test provider; switching to a real provider (e.g. `openai`) will send prompts to an external service.

### MCP Context Mode
- **mcp.contextMode**: `off` – Controls Model Context Protocol integration. `off` means no external context sharing; `on` would enable it. When enabled without proper authentication, internal context may leak externally.

### Pre‑commit Hooks & Sync Mode
- **hooks.preCommit**: `false` – When `true`, ArchSpine runs checks before each commit. Disabling (`false`) reduces safety but speeds up commits.  
- **hooks.syncMode**: `hook` – Determines how synchronisation occurs: via a git hook (`hook`) or automatically (`auto`).

### Scan Policy
- **scanPolicy.fileSource**: `git-tracked` – Limits scanning to version‑controlled files. `filesystem` would scan all files on disk, increasing risk of indexing unwanted directories.  
- **scanPolicy.ignoreChain**:  
  - `inheritGitIgnore: true` – Inherits patterns from the repository’s `.gitignore`.  
  - `projectIgnore: ".spineignore"` – Applies project‑level ignore rules from `.spineignore`.  
  - `localIgnore: ".spineignore.local"` – Allows local overrides via `.spineignore.local`.  
  Missing any of these files may cause unintended scanning of large irrelevant directories or missing important excludes.  
- **protocolExclusions**: `[".spine/"]` – Paths always excluded from indexing. Here, the entire `.spine/` directory is excluded to avoid indexing internal artifacts.  
- **protocolInclusions**: `[".spine/rules/", ".spine/config.json"]` – Paths always included, even if they would be excluded by ignore rules. These ensure that specific files inside `.spine/` are still indexed.

## Stability & Risks

- **Incomplete Indexing**: Misconfiguring the scan policy (e.g. missing protocol inclusions) can lead to incomplete indexing, causing missing rule enforcement or stale views.  
- **Sensitive Data Exposure**: Using a real LLM provider with untrusted prompts may expose sensitive code to external services.  
- **Removed Safety Gate**: Disabling pre‑commit hooks (as done here with `hooks.preCommit: false`) removes a safety check for committing violations.  
- **MCP Leakage**: Enabling MCP context mode without proper authentication could leak internal context to external services.  
- **Ignore Chain Maintenance**: The ignore chain must be kept consistent; a missing `.spineignore` file defaults to no project‑level ignore, and overlapping protocol exclusions/inclusions can break the scanner.  
- **Conflicting Rules**: Protocol exclusions and inclusions must not overlap. In this configuration, `.spine/` is excluded but `.spine/rules/` and `.spine/config.json` are included, which is correct as the inclusions are nested under the exclusion and take precedence.

This configuration is effectively a safe, test‑oriented setup: it uses a mock LLM, disables MCP context, skips pre‑commit checks, scans only git‑tracked files, and relies on a layered ignore chain. Operators should carefully review and adapt these values before moving to production or enabling real LLM providers.