<!-- spine-content-hash:c0cb9d58e839954e1fda00352d5eb29c51225a956d0bb212ca1f836038af84e5 -->
# ArchSpine Protocol Facade

## Role
Public protocol facade module providing a stable entry point for importing all ArchSpine protocol types.

## Key Responsibilities
- Re-exports all protocol type definitions from the internal module `./protocol/index.js`.
- Provides a single, stable import path for external consumers of the ArchSpine protocol.
- Decouples the internal protocol module structure from external dependencies.

## Notable Invariants & Negative Scope
- **Must only** contain re-exports from the internal protocol module.
- **Must not** contain any local type definitions or logic.
- **Out of scope:** Defining new protocol types or interfaces, implementing protocol logic or validation, handling runtime instantiation of protocol objects.

## Most Important Exported Behavior
All symbols exported from `./protocol/index.js` are publicly exposed through this facade. Consumers should import from this module rather than the internal protocol path to ensure stability across internal restructuring.

## Architectural Intent
This file serves as the public API boundary for the protocol subsystem, insulating consumers from internal restructuring as part of establishing subsystem facades.