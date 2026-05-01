<!-- spine-content-hash:4234ccf343b7fcd33f546c8b735ced41145f80aa186c3612013e2bb872d66562 -->
# ArchSpine Initialization Type Contracts

This TypeScript module defines the shared type contracts for the ArchSpine initialization and repository bootstrapping subsystem. It serves as a pure type definition layer, providing centralized interfaces and type aliases that ensure consistency between CLI commands and service layers during project setup.

## Key Responsibilities

- **InitSharedOptions interface** – Encapsulates dependencies such as `Config` and `RuntimeService`, along with utilities required for initialization steps.
- **RepositoryBootstrapResult interface** – Defines the structured result type for repository bootstrapping operations.
- **Type aliases** – Exports `LLMScope`, `HookSetupStatus`, and `ArtifactStrategy` to standardize configuration domains across the initialization CLI.
- **Centralized type definitions** – Ensures consistent data structures between CLI commands and service layers during project setup.

## Out of Scope

- Does not implement initialization logic or business rules.
- Does not provide runtime functions or classes.
- Does not handle CLI command parsing or execution.
- Does not manage persistence or pipeline operations.

## Invariants

- Must remain a pure type definition module with no executable code.
- Must not import or depend on concrete implementations outside of type references.
- Must serve as a central contract for initialization-related data structures.

## Architectural Intent

The module decouples type definitions from implementation, enabling shared contracts across CLI and service layers to support consistent project initialization. Recent changes have tightened schema handling for initialization types, improving type safety and contract definitions.

## Public Surface

- `InitSharedOptions`
- `RepositoryBootstrapResult`
- `LLMScope`
- `HookSetupStatus`
- `ArtifactStrategy`