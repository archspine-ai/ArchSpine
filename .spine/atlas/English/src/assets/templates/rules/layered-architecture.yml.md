# ArchSpine Layered Architecture Constraints

## Purpose
This document establishes and enforces a layered architecture for the ArchSpine project. It defines clear boundaries between CLI, services, core, tasks, engines, and infra layers, ensuring that each layer adheres to its prescribed role: CLI as thin entrypoints, services for orchestration, core for pipeline contracts, tasks for stage-local work, engines for analysis and transformation, and infra for low-level capabilities.

## Audience
All developers contributing to the ArchSpine codebase. This document serves as a reference for understanding the project's architectural vision, preventing architectural drift, and guiding code placement during development and code review.

## Key Architectural Constraints
- **CLI Entrypoint Separation (Error)**: CLI modules must stay thin; they cannot absorb pipeline or persistence logic from lower layers. This keeps runtime behavior reusable outside the CLI.
- **Service Runtime Boundary (Warning)**: Services orchestrate core/tasks/engines/infra, but view-specific service code belongs under `src/services/view/` to keep structure obvious.
- **Core Pipeline Isolation (Error)**: Core modules define pipeline contracts without depending on CLI entry code, ensuring stability regardless of invocation method.
- **Task Stage Boundary (Warning)**: Tasks implement stage-local work on core contracts and engines; they must not take over CLI parsing or unrelated orchestration.
- **Engine Independence (Error)**: Engines provide reusable analysis logic without importing CLI entrypoints, remaining decoupled from service orchestration.
- **Infra Facade Imports (Warning)**: Prefer public infra facades over deep private implementation paths to make refactors safer.

## Workflow Anchors
This document anchors code placement decisions during development and code review. Violations flagged as Error must be fixed to pass CI; Warning violations should be reviewed for architectural alignment. The layered model guides the evolution of the codebase, ensuring that new modules are placed correctly and dependencies remain acyclic.