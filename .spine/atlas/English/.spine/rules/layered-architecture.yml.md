<!-- spine-content-hash:fa7811ab101e5eb0d051174c5a2939ca46c93f471b4cd8c6ea27254598e11e1c -->
# ArchSpine Architectural Constraint Rulebook

## Purpose
This document establishes and enforces the layered architecture constraints for the ArchSpine project. It defines clear boundaries between CLI entrypoints, service orchestration, core pipeline contracts, task stages, analytical engines, and infrastructure facades. The goal is to prevent architectural drift, keep each layer focused on its responsibility, and ensure the system remains modular, testable, and maintainable as it evolves.

## Context and Audience
This document is intended for all contributors to the ArchSpine repository, including developers, code reviewers, and architects. It serves as both a reference for understanding the intended module structure and a rulebook for enforcing import and responsibility boundaries during development and code review. New contributors should read this document first to understand where their changes belong.

## Key Takeaways
- The project follows a strict layered architecture: CLI -> services -> core/tasks/engines -> infra, with clear dependency direction.
- CLI modules must remain thin entrypoints and must not absorb pipeline or persistence logic.
- Services orchestrate runtime behavior; view-specific services belong under `src/services/view/`.
- Core modules define pipeline contracts and must not depend on CLI code.
- Engines provide reusable analysis logic and must stay decoupled from service orchestration.
- Infra modules expose stable facades and must not absorb orchestration concerns.
- Each constraint has a severity level (Error or Warning) and a documented rationale.

## Out of Scope
- Specific implementation details of individual modules
- External API contracts or user-facing documentation
- Deployment or infrastructure provisioning instructions
- Testing strategies or CI/CD pipeline configuration

## Invariants
None specified.

## Change Intent
No recent architectural intent changes detected.

## Drift Status
No drift detected.