# ArchSpine Release Notes Summary

The ArchSpine changelog exists to provide a concise public record of all release history and notable changes. It details what new features were added, what reliability improvements were made, and which documentation updates accompanied each version.

**Who should read it:** This document is intended for users and developers of ArchSpine who need to track version changes and understand new capabilities. Whether you are adopting the CLI, integrating the local `.spine/` control plane, or evaluating the project’s maturity, the changelog gives you a clear view of what each release delivers.

**Decisions and workflows anchored:** The changelog anchors the definition of the core workflow commands: `try`, `init`, `build`, `sync`, `publish`, `check`, `fix`, and `mcp start`. It also establishes the reliability guarantees that the project commits to: protected output boundaries, atomic file writes, and lock-based mutual exclusion. For version 1.0.0, the initial open-source release, these include repository artifact strategies, architecture rule templates, schema assets, Atlas documentation generation, and experimental view outputs, as well as global and project-level LLM configuration with secure credential storage.

**Key takeaways:**
- Initial open-source release of ArchSpine CLI and local `.spine/` control plane.
- Core workflows include `try`, `init`, `build`, `sync`, `publish`, `check`, `fix`, and `mcp start`.
- Reliability features: protected output boundaries, atomic file writes, lock-based mutual exclusion.
- Documentation available in English and Simplified Chinese, with supporting docs on protocol, runbook, MCP, local LLM, cost, God Mode, and current capabilities.

The changelog is the single source of truth for understanding what each version of ArchSpine introduces and how it evolves.