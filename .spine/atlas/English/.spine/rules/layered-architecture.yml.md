# ArchSpine Layered Architecture Constraints

## Purpose
This document establishes a set of layered architecture constraints that enforce a clear separation of concerns among the CLI, services, runtime, core, tasks, engines, and infra modules. The goal is to keep the codebase maintainable, testable, and understandable by preventing inappropriate cross-layer dependencies.

## Audience
This document is targeted at developers and AI agents who contribute to the ArchSpine repository. It defines architectural rules that must be followed when adding or modifying code. The rules are designed to be enforced by static analysis or code review to preserve the intended modular structure as the project evolves.

## Key Architectural Decisions
- **CLI modules** must remain thin adapters and must not absorb pipeline or persistence logic.
- **Services orchestrate** core/tasks/engines/infra; view-specific services belong under `src/services/view/`.
- **Runtime compatibility modules** centralize schema versioning and migrations in a single layer.
- **Core modules** define pipeline contracts without depending on CLI code.
- **Task modules** implement stage-local work on top of core contracts and engines.
- **Engines** provide reusable analysis logic independent of CLI and service orchestration.
- **Infra modules** expose stable low-level facades; callers should prefer public facades over deep internals.

## Workflows Anchored
- **Code review**: Reviewers check that new code does not violate dependency direction (e.g., CLI importing core internals).
- **Static analysis**: Linting or architecture validation tools (e.g., dependency-cruiser) can enforce these rules automatically.
- **Architectural refactoring**: When evolving the codebase, these constraints guide where to place new modules and how to restructure existing ones.
- **Contributor onboarding**: New team members refer to this document to understand the intended layer boundaries.