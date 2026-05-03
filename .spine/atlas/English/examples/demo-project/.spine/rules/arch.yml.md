# ArchSpine Demo Project Architectural Rules

## Purpose

This document establishes two foundational rules for the ArchSpine demo project to ensure clean architecture and readable domain contracts. It anchors the decision to enforce strict layer isolation and mandatory documentation standards, directly impacting every API handler and domain class written in the project.

## Who Should Read This

- **Developers** adding or modifying API handlers (`src/api/`) must understand the import constraint.
- **Developers** working on domain classes (`src/domain/`) need to follow TSDoc requirements.
- **Reviewers** and **architects** validating code adherence to project rules.

## Why These Rules Exist

- **Layer isolation** prevents the API layer from depending directly on infrastructure details, keeping the codebase flexible and the architecture clean. Without this rule, handlers might bypass the domain, coupling presentation to low‑level concerns.
- **Documentation standards** ensure that public domain contracts remain readable and self‑explanatory in auto‑generated architecture views, reducing ambiguity for both human readers and tooling.

## Key Takeaways

1. **API handlers must not import directly from infrastructure modules** (`src/infra/`). Use the domain layer as an intermediary.
2. **All public classes and methods in `src/domain/` should have TSDoc comments** to keep architecture contracts clear and maintainable.

## Decision Anchors

- The `Layer Isolation` rule is enforced as **error**: any direct import from `src/infra/` in `src/api/` must be fixed.
- The `Documentation` rule is enforced as **warning**: missing TSDoc on public domain members should be addressed to maintain consistency.

---