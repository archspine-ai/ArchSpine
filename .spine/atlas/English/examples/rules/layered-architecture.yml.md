# ArchSpine Layered Architecture Constraints

## Purpose & Scope

This document exists to enforce a **strict layered architecture** for the ArchSpine mirror system. It codifies the rules that prevent reverse dependencies, ensure domain isolation, and guarantee that API layers only call service or domain layers—preserving the integrity of the classical layered model. Without this specification, the system would risk coupling domain logic to infrastructure or presentation concerns, eroding maintainability and testability.

## Who Should Read This

- **Developers** writing code in any ArchSpine module.
- **Architects** reviewing pull requests or planning system evolution.
- **AI agents** that need to understand architectural boundaries before generating or validating code.

## Key Decisions & Workflows Anchored Here

- **Domain purity**: Domain modules must never import from infra or CLI layers (error severity). This decision ensures the domain remains a pure, independently testable core.
- **Minimal domain dependencies**: Domain may only depend on internal domain logic or generic utils (warning severity). This keeps the domain focused and free of infrastructure entanglements.
- **API layer responsibility**: API layers must only call service or domain layers; bypassing business logic is prohibited (error severity). This workflow guarantees business logic lives in the domain and is not sidestepped.

## Critical Takeaways

- Domain modules **must not** import from `src/infra/**` or `src/cli/**`.
- Domain modules **should** depend only on other domain logic or generic utilities.
- API layers **must** call only Service or Domain layers—never infra or CLI directly.

These rules are enforced with error (blocking) or warning (advisory) severity. They form the backbone of the ArchSpine mirror system's architectural governance.