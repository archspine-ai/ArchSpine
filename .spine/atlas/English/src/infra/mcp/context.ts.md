<!-- spine-content-hash:c4f1ebbafdc201b1e433d9f80658dffd82a50040c4d4663c95d1392b1ee8013c -->
# ArchSpine – MCPContextGate

## Role
Infrastructure facade class for gating Model Context Protocol (MCP) context flow based on priming state and operational mode.

## Key Responsibilities
- Defines the `MCPContextMode` type, which enumerates context provisioning strategies: `'off'`, `'project-first'`, `'search-first'`.
- Manages internal boolean state tracking for project and search priming.
- Provides logic to determine whether context should be emitted based on the current mode and priming state.
- Updates the search priming state when specific search-oriented tools are used, as defined by the `SEARCH_PRIMING_TOOLS` set.

## Notable Invariants
- Exports a stable public facade (`MCPContextGate`) for context gating logic.
- Encapsulates priming state as private class properties.
- Defines a fixed set of search-priming tools.

## Negative Scope (Out of Scope)
- Does not orchestrate service or engine workflows.
- Does not directly integrate with external MCP servers or perform network calls.
- Does not persist priming state across sessions.

## Most Important Exported / Externally Visible Behavior
- `MCPContextMode` type – enumerates the three context provisioning strategies.
- `MCPContextGate` class – provides the public interface for controlling context emission based on priming and mode.