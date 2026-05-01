<!-- spine-content-hash:40203ea1d1f170845902311d486561692c925497b419c59e08f0bf4fdfacc23d -->
# ArchSpine – View Subsystem Public Facade (`resources.ts`)

## Role
This file is the **public facade module** for the view subsystem. It centralizes and re-exports all view-specific runtime and rendering components, providing a stable import interface for external callers — especially MCP clients — within the Model Context Protocol resource layer.

## Key Responsibilities
- **Aggregate and re-export** all public modules from the view subsystem, offering a single, stable entry point.
- **Encapsulate internal structure** so that implementation details under `src/services/view/**` can evolve without breaking external consumers.
- **Serve as the primary MCP resource entry point** for architecture visualization and analysis views.

## Notable Invariants
- Contains **only re-exports** of public view subsystem modules; no inline implementations are allowed.
- Must **not depend on internal, non-exported modules** of the view subsystem, preserving encapsulation.
- The export surface is **stable**; any change to exports should be treated as a breaking change for external consumers.

## Negative Scope (Out of Scope)
- Does **not** implement view-specific business logic or rendering logic (delegated to the exported modules).
- Does **not** handle HTTP requests or direct user interactions (handled by upstream services or MCP servers).
- Does **not** manage data persistence or core domain operations (responsibility of other subsystems).

## Public Surface (Exported Modules)
- `arch-diagram-renderer.js`
- `architecture-diagram-view.js`
- `common.js`
- `index-loader.js`
- `public-surface-view.js`
- `risk-hotspots-view.js`
- `types.js`

## Architectural Intent
This facade decouples external consumers from internal restructuring, aligning with a broader refactor to resolve layer inversions. The recent change consolidated view exports to provide a stable interface.

## Rule Violation (Warning)
- **ID:** `service-runtime-boundary`
- **Reason:** This view-specific service module is located under `src/infra/mcp/` instead of `src/services/view/**`, which blurs runtime orchestration boundaries.

## Drift Status
- **Drift detected:** No
- **Drift reason:** None