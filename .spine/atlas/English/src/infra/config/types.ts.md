<!-- spine-content-hash:97f40567d4a55916688ef74b0f734c47ec7c2a3767be3fbd3c97fa62c3be2b4b -->
# ArchSpine Configuration Types Module

This module serves as the **central type definition hub** for all configuration-related interfaces and enums in the ArchSpine mirror system. It provides a stable, pure-TypeScript contract that decouples type definitions from implementation logic.

## Role

Centralize and re-export configuration types used across the ArchSpine system, ensuring a single source of truth for configuration interfaces.

## Key Responsibilities

- **Re-export `SpineConfig`** from the protocol layer, making it available within the config domain without duplication.
- **Define `BooleanSettingResolution`** — an interface that models how a boolean setting is resolved, including its source and value.
- **Define literal union types** for system behaviors:
  - `HookSyncMode` — enumerates synchronization modes for hooks.
  - `ArtifactStrategy` — enumerates strategies for handling artifacts.
- **Export `SupportedConfigKey`** — a type that enumerates all valid configuration keys.

## Notable Invariants

- **Pure type definitions only** — no executable code, no runtime logic.
- Acts as the **canonical source of truth** for configuration-related types across the entire system.

## Out of Scope

- Runtime configuration loading or validation.
- Orchestration of services or engines.
- Implementation of any business logic.

## Public Surface

The following types and interfaces are exported for external use:

- `SpineConfig`
- `BooleanSettingResolution`
- `HookSyncMode`
- `ArtifactStrategy`
- `SupportedConfigKey`