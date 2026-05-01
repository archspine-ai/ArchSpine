<!-- spine-content-hash:2224edc5dd0f88b0db274a7ae49f86788ce16da076fec2aa2c21c22ef9447dd1 -->
# ArchSpine Naming Conventions

## Purpose
This document establishes mandatory naming conventions for the ArchSpine project to maintain a uniform and predictable codebase, especially within a large monorepo environment.

## Context & Audience
Intended for all developers contributing to the ArchSpine monorepo, particularly those working on type definitions and test files. It serves as a quick reference to enforce consistency and avoid ambiguity.

## Key Responsibilities
- Specifying naming rules for interfaces in type definition files
- Specifying naming rules for test file suffixes

## Out of Scope
- General coding style or formatting rules
- Architecture or design patterns
- File organization beyond naming

## Key Takeaways
- All internal interfaces in `src/types/**/*.ts` must be prefixed with 'I' (e.g., `IUserRepository`).
- All test files under `tests/` must end with `.test.ts` or `.spec.ts`.
- Violations of interface naming are warnings; test file naming violations are errors.