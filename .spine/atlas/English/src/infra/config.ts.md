<!-- spine-content-hash:093988ca1e757dc6bccd88d0bb6c5f9a0298ce4833df9aee9fe276e081420daa -->
# ArchSpine Configuration Barrel (`index.js`)

## Role
This file is the **public API barrel** for the configuration subsystem. It aggregates and re-exports the configuration facade and all associated type definitions, providing a single, stable entry point for consumers.

## Key Responsibilities
- Re-exports the `Config` facade from `./config/facade.js`.
- Re-exports all type definitions from `./config/types.js` to offer a unified import path.
- Acts as the primary interface for any module that needs configuration infrastructure.

## Notable Invariants & Negative Scope
- **Must only** re-export public symbols from the config subsystem; no private implementation details are exposed.
- **Contains no executable logic** or stateful behavior — it is purely a re-export hub.
- **Maintains a stable export surface** to shield consumers from internal refactoring.
- **Out of scope:** Implementing configuration logic, validation, runtime orchestration, or service layer concerns. It does not directly import deep private modules.

## Exported / Visible Behavior
- `Config` — the main configuration facade (from `./config/facade.js`).
- All type definitions from `./config/types.js` are available through this barrel.