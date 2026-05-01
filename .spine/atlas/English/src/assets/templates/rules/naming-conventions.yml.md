<!-- spine-content-hash:2224edc5dd0f88b0db274a7ae49f86788ce16da076fec2aa2c21c22ef9447dd1 -->
# ArchSpine Naming Conventions

## Purpose
This document establishes mandatory naming conventions to ensure consistency across the ArchSpine monorepo codebase, reducing cognitive overhead and preventing common mistakes.

## Context & Audience
Intended for all developers contributing to the ArchSpine project, particularly those working with TypeScript type definitions and test files. The rules are designed to be enforceable by automated tooling.

## Key Responsibilities
- **Interface Naming**: All internal interfaces in `src/types/**/*.ts` must use the `I` prefix (e.g., `IUserRepository`). Violations are treated as warnings.
- **Test File Naming**: All test files in `tests/**` must end with `.test.ts` or `.spec.ts`. Violations are treated as errors.
- **Severity Levels**: Each rule has an assigned severity (Warning or Error) to guide enforcement priority.
- **Rationale**: Each convention includes a documented rationale to explain its purpose and benefits.

## Out of Scope
- General coding style beyond naming conventions
- Architecture or design patterns
- Project structure or directory layout outside of types and tests
- Tooling or linting configuration details

## Key Takeaways
- All internal interfaces in `src/types/**/*.ts` must use the `I` prefix (e.g., `IUserRepository`).
- All test files in `tests/**` must end with `.test.ts` or `.spec.ts`.
- Violations of interface naming are warnings; test file naming violations are errors.
- Consistent naming improves code readability and tool integration.