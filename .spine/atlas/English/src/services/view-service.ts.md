<!-- spine-content-hash:0cd8b9df140c3d97e553e4003960dc81e5a4707a5ec38a542bbc4a33005ce58e -->
# ViewService — Architectural View Orchestrator

## Role
Service orchestrator for generating and managing architectural views from indexed codebase data.

## Key Responsibilities
- Orchestrates derivation of architecture diagram, public surface, and risk hotspot views via dedicated modules.
- Renders derived view data into markdown and JSON artifacts using the ViewRenderer.
- Persists view artifacts to the filesystem via OutputManager.
- Deletes obsolete view artifacts when view definitions are removed.

## Out of Scope
- Directly scanning or indexing source code (delegated to ViewIndexLoader).
- Defining view logic or rendering templates (delegated to view-specific modules).
- Low-level file I/O (delegated to OutputManager).

## Invariants
- Depends on infra modules (OutputManager) for output operations.
- Depends on view-specific modules under `src/services/view/` for view derivation and rendering.
- Service runtime boundary: orchestrates view generation but does not contain view-specific logic.

## Exported Surface
- `ViewService` (exported class)

## Architectural Intent
Facilitate a clean separation between view derivation logic and orchestration, enabling modular view addition and artifact management.