<!-- spine-content-hash:7ffff5b4bbfe3cc4b33e38a05eca773b705937134527121258ebde848d9db7e4 -->
# ArchSpine View Definitions Module

## Role
Central registry and type definition module for architectural visualization views within the ArchSpine system.

## Key Responsibilities
- Defines the `ViewDefinition` TypeScript interface specifying metadata for each architectural view (ID, title, description, enabled status, requirements, outputs).
- Maintains the `VIEW_DEFINITIONS` constant array as the canonical source of truth for all supported visualization outputs.
- Provides derived data structures (`VIEW_DEFINITION_MAP`) for efficient O(1) lookups of view definitions by ID.
- Exports utility functions to filter and retrieve view definitions (e.g., by `defaultEnabled` status).

## Notable Invariants
- `VIEW_DEFINITIONS` is the single source of truth for view metadata.
- `ViewDefinition` interface is stable and exported for type safety across the system.

## Out of Scope
- Rendering or generating visualizations.
- Orchestrating runtime services.
- Handling user authentication or authorization.
- Persisting view state or configurations.

## Most Important Exported Behavior
- **`ViewDefinition` interface**: The core type that all view definitions must conform to.
- **`VIEW_DEFINITIONS` constant array**: The authoritative list of all supported views.
- **`VIEW_DEFINITION_MAP`**: A lookup map for fast access by view ID.
- **Utility functions**: Such as `getDefaultEnabledViews` for filtering views based on their default enabled status.