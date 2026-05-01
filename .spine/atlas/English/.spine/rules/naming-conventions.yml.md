<!-- spine-content-hash:2224edc5dd0f88b0db274a7ae49f86788ce16da076fec2aa2c21c22ef9447dd1 -->
# ArchSpine Naming Conventions

## Purpose
This document establishes mandatory naming conventions to ensure codebase consistency across the ArchSpine monorepo, reducing cognitive overhead and improving maintainability.

## Context & Audience
Intended for all developers contributing to the ArchSpine project, particularly those working in the `types/` and `tests/` directories. The rules help maintain a uniform code style in a large-scale monorepo environment.

## Key Responsibilities
- Documenting interface naming rules (prefix `I`) for type definition files
- Documenting test file naming rules (suffix `.test.ts` or `.spec.ts`)
- Establishing severity levels for convention violations
- Providing rationale for each naming rule

## Key Takeaways
- Internal interfaces in `src/types/**/*.ts` must use the `I` prefix (e.g., `IUserRepository`)
- Test files in `tests/**` must end with `.test.ts` or `.spec.ts`
- Violations of test file naming are treated as errors; interface naming violations are warnings
- Each rule includes a clear rationale to guide developer understanding

## Out of Scope
- General coding style guidelines (e.g., indentation, formatting)
- Architecture or design patterns
- Project-specific business logic conventions