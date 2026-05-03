# ArchSpine Layered Architecture Constraints

## Purpose

This document defines explicit dependency constraints for each architectural layer of the ArchSpine mirror system. Its goal is to enforce a reusable, testable, and maintainable layered architecture by preventing harmful cross-layer dependencies.

## Who Should Read This

All developers and contributors to the ArchSpine project. Understanding these rules is essential to avoid architectural erosion and maintain modular separation of concerns.

## Key Architectural Decisions & Workflows Anchored Here

- **CLI as thin entrypoints** – CLI modules must not absorb pipeline or persistence logic; they remain command adapters only.
- **Service orchestration boundaries** – Services orchestrate core, tasks, engines, and infra. View-specific service code lives under `src/services/view/`, not in infra.
- **Core pipeline independence** – Core modules define pipeline contracts and shared state without depending on CLI code.
- **Task stage isolation** – Tasks implement stage-local work on core contracts and engines; they don’t handle CLI parsing or unrelated service orchestration.
- **Engine decoupling** – Engines provide reusable analysis and transformation logic with no dependency on CLI or service-level orchestration.
- **Infra facades** – Infra modules expose stable low-level capabilities; callers should prefer public facades over deep internal paths.

These rules are enforced as either **Error** (must not be violated) or **Warning** (strongly recommended). Each rule includes a severity level and rationale to guide consistent application across the codebase.