<!-- spine-content-hash:2136d2c142f15cdd28bb04341be6cae1df0ca300161fce70fff59af18fc4d6d9 -->
# ArchSpine MCP Tool Facade

## Role
This module serves as the **MCP (Model Context Protocol) tool facade**, exposing ArchSpine system capabilities as queryable tools for external AI agents. It provides a stable, queryable interface for agents to introspect the system's architecture, rules, and drift history.

## Key Responsibilities
- Provides tool implementations for querying architectural invariants and responsibilities of the codebase.
- Exposes preview scanning functionality to analyze files against loaded architectural rules.
- Offers access to drift history and resource templates for system introspection.
- Wraps core system components (Scanner, Manifest, Config, Rules) behind a unified tool interface.
- Manages MCP context gate for tool call tracking and auditing.

## Out of Scope
- Direct file system operations beyond reading `.spine` directory contents.
- Execution of architectural rule enforcement or policy decisions.
- User authentication or authorization logic.
- Persistent storage of scan results or tool call history.

## Notable Invariants
- All tool methods must go through `MCPContextGate.noteToolCall` for auditing.
- Errors must be wrapped using `toArchSpineError` for consistent error handling.
- The `.spine` directory must exist for tool operations to function.
- Infra modules should expose stable low-level capabilities and facades, and must not absorb service/task/engine orchestration concerns.

## Public Surface
- `SpineTools(rootDir, manifest?, contextGate?)`
- `SpineTools.queryInvariants()`
- `SpineTools.queryResponsibilities()`
- `SpineTools.previewScan()`
- `SpineTools.getDriftHistory()`
- `SpineTools.listResourceTemplates()`

## Change Intent
The architectural intent is to provide a stable, queryable tool interface for external AI agents to introspect the ArchSpine system's architecture, rules, and drift history. Recent changes include fixing lint warnings and type errors, and adding CI workflow for automated validation.

## Drift Status
No drift detected. No rule violations present.