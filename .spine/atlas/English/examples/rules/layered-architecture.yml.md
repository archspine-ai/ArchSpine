# Layered Architecture Constraints for ArchSpine

## Why This Document Exists

This document defines and enforces the layered architecture constraints that keep the ArchSpine mirror system maintainable and testable. It codifies the rules for domain isolation, interface-only dependency, and API layer separation so that high-level modules never depend on low-level modules, and the domain layer remains pure and independent of infrastructure or presentation concerns.

Without these constraints, the system risks circular dependencies, fragile business logic, and code that is difficult to refactor or validate automatically.

## Who Should Read It

- **Developers** writing or reviewing code for any module in `src/domain/`, `src/api/`, `src/infra/`, or `src/cli/`
- **Architects** designing new features or refactoring existing components
- **QA and DevOps engineers** setting up linting rules or automated architecture checks

## How It Anchors Decisions and Workflows

The rules in this document are enforced during:

- **Code reviews** – every pull request must comply with these dependency directions
- **Static analysis and linting** – automated tools (e.g., dependency-cruiser, ESLint import rules) flagged rule violations as errors or warnings
- **Architecture validation pipelines** – CI/CD steps that reject commits that break the layered model

## Key Takeaways

- **Domain Isolation** (Error severity): Modules inside `src/domain/` must never import from `src/infra/` or `src/cli/`. The domain layer must stay pure.
- **Interface-Only Dependency** (Warning severity): `src/domain/` modules may depend only on other domain logic or generic utilities, preserving focus.
- **API Layer Separation** (Error severity): Modules inside `src/api/` may call only Service or Domain layers, never bypass business logic.

Understanding and applying these rules ensures that the mirror system evolves with clear boundaries, making future changes safer and more predictable.