<!-- spine-content-hash:000856d55e2802e1885736b32e10d68b1c1a98abc4d1f7f1a126262f0ab4cc6a -->
# ArchSpine Architectural Constraint Specification

## Purpose
This document establishes and enforces the layered architecture constraints for the ArchSpine repository. It defines clear boundaries between CLI entrypoints, service orchestration, core pipeline contracts, task stages, engines, and infrastructure facades. The goal is to maintain a modular, testable, and reusable codebase where each layer has well-defined responsibilities and dependencies.

## Context and Audience
This document is intended for all contributors to the ArchSpine project, particularly developers working on CLI commands, service orchestration, pipeline logic, or infrastructure modules. It serves as a reference for understanding the architectural model and ensuring that new code respects the separation of concerns. The rules are enforced via automated linting or review processes.

## Key Takeaways
- CLI modules must remain thin entrypoints and must not absorb pipeline or persistence logic.
- Services orchestrate core, tasks, engines, and infra; view-specific services belong under `src/services/view/`.
- Core modules define pipeline contracts and must not depend on CLI entry code.
- Task modules implement stage-local work and must not take over CLI parsing or unrelated orchestration.
- Engines provide reusable analysis/transformation logic and must stay decoupled from presentation and orchestration.
- Infra modules expose stable facades; callers should prefer public facades over deep private paths.