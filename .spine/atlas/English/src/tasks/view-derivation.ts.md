<!-- spine-content-hash:68055d0980120253a5408c77d26b202ffd71b15ae8973e860aec66676ecf8875 -->
# ViewDerivationTask — Architectural View Derivation Stage

## Role
A pipeline task stage within the SpineTask pipeline that orchestrates the generation of multiple architectural views from committed changes. It acts as a coordinator, delegating all view derivation logic to the `ViewService` facade.

## Key Responsibilities
- Instantiates `ViewService` with runtime dependencies: root directory, output manager, runtime IO, and LLM client.
- Clears view artifacts for any views that are disabled in the current execution context.
- Skips derivation during incremental sync when no changes are committed and no directories are affected.
- Derives the **public surface view** when enabled, capturing exported symbols and their visibility.
- Derives the **risk hotspots view** when enabled, identifying high-risk code areas.
- Derives the **architecture diagram view** when enabled, generating a system diagram.

## Out of Scope
- CLI command parsing
- Direct file system scanning or git operations
- Implementation of view derivation logic (delegated to `ViewService`)
- Orchestration of unrelated pipeline services

## Invariants
- Must operate as a single stage in the `SpineTask` pipeline.
- Must delegate all view derivation logic to the `ViewService` facade.
- Must respect the `enabledViews` configuration from the task context.
- Must skip derivation when incremental sync conditions are met (no commits, no affected directories).

## Public Surface
- `ViewDerivationTask` (class)
- `execute` (method)

## Change Intent
The architectural intent is to provide a centralized task stage for generating all architectural views, ensuring consistency and proper cleanup of disabled views. The recent change extended view derivation to include risk hotspots and architecture diagram views, likely as part of an enhancement to support multiple view types.