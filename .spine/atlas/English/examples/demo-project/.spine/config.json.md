# ArchSpine Configuration Summary

This configuration defines the behavior of ArchSpine's scanning, hooks, and AI provider settings for the archspine-demo project. Below is a breakdown of what each section controls, which parameters matter, and what you should watch out for.

## Scan Policy
- **File source**: Only files tracked by Git are scanned. This prevents temporary or generated files from polluting analysis.
- **Ignore chain**: Inherits Git's ignore rules, plus a project-level `.spineignore` and a local `.spineignore.local`. This means you must maintain these files carefully to avoid accidentally including sensitive or irrelevant files.
- **Protocol exclusions / inclusions**: The entire `.spine/` directory is excluded from scanning *except* for `.spine/rules/` and `.spine/config.json`. This protects internal ArchSpine state while still allowing rule files and configuration to be analyzed.
- **Operational note**: If you add custom patterns to `.spineignore.local`, remember that it will be merged with the project ignore. A mistake here could silently exclude important files.

## Hooks
- **preCommit**: Disabled (`false`). No automatic validation runs on commit. This reduces friction during development but means inconsistent states won't be caught at commit time. If you later enable hooks, ensure your commit flow accounts for the validation overhead.
- **syncMode**: Set to `"hook"`. This controls how the system synchronizes; currently not in active use because the hook is off.

## LLM Provider
- **provider**: `"mock"`. All LLM calls are simulated. This eliminates API costs, latency, and dependency on external services. However, no real AI analysis is performed. Use this for testing or demonstration only; switch to a real provider for production workloads.

## MCP (Model Context Protocol)
- **contextMode**: `"off"`. External context inference is disabled. This prevents ArchSpine from pulling in outside context, which is safer but limits functionality. If you need richer analysis, you must enable MCP and configure an appropriate context source.

## Stability & Risks
- **Low risk**: The scan policy is defensive—`.spine/` is well guarded, and Git tracking provides a reliable file base.
- **No external dependencies**: Mock LLM and disabled MCP mean zero network calls, making the setup stable and predictable.
- **Validation gap**: With hooks disabled, commits won't be validated. Consider enabling them once your project matures, or add a separate CI step to catch issues.
- **Ignore file maintenance**: `.spineignore` and `.spineignore.local` are critical. Misconfiguration can break scans or leak unintended files. Review them regularly.

Overall, this configuration prioritizes safety and simplicity, suitable for demos, early development, or environments where you want full control without external services.