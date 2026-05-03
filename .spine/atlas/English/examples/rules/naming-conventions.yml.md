# ArchSpine Naming Convention Rules

## Purpose
This document defines mandatory naming rules for interfaces and test files within the ArchSpine project. Its goal is to unify code style across a potentially large monorepo, reducing cognitive overhead and improving maintainability.

## Audience
All developers contributing to the ArchSpine codebase. Use this as a quick reference when writing TypeScript interfaces and test files.

## Core Rules

- **Interface Prefix**  
  *Scope*: `src/types/**/*.ts`  
  *Constraint*: Internal interfaces must start with the character `I` (e.g., `IUserRepository`).  
  *Severity*: Warning  
  *Rationale*: Consistent interface naming helps differentiate interfaces from types and classes.

- **Test File Suffix**  
  *Scope*: `tests/**`  
  *Constraint*: Test files must end with `.test.ts` or `.spec.ts`.  
  *Severity*: Error  
  *Rationale*: Ensures consistency with test runner expectations.

## Key Takeaways
- All interfaces under `src/types/**/*.ts` must be prefixed with `I`.
- Test files under `tests/` must use `.test.ts` or `.spec.ts` suffixes.
- Rules are enforced at Warning (interface prefix) and Error (test suffix) severity.
- Following these conventions reduces cognitive overhead and improves codebase maintainability.

This document anchors developer workflow by providing a single source of truth for naming expectations. It should be referenced during code review and when setting up new modules.