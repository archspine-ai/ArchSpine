# Naming Conventions Specification

## Purpose
This document establishes **mandatory naming rules** for TypeScript interfaces and test files across the ArchSpine monorepo. It ensures that every contributor follows a single, predictable style, eliminating guesswork and reducing code review friction.

## Audience
All developers working in this repository – especially those contributing to `src/types/` and `tests/` directories. If you write interfaces or test files, you must read and apply these rules.

## Key Decisions & Workflows Anchored Here
- **Interface naming rule**: Every internal TypeScript interface **must** start with the prefix `I`.  
  *Example*: `IUserRepository` instead of `UserRepository`.  
  *Scope*: `src/types/**/*.ts` | *Severity*: Warning  
  *Rationale*: Quickly distinguish interfaces from classes and type aliases.

- **Test file naming rule**: Every test file **must** end with `.test.ts` or `.spec.ts`.  
  *Scope*: `tests/**` | *Severity*: Error  
  *Rationale*: Ensures consistent matching by test runners (Vitest, Jest, etc.) across the project.

## Out of Scope
This document does **not** cover:
- Formatting or indentation (handled by Prettier / ESLint)
- Architecture rules (e.g., layered structure)
- Dependency management, comment styles, or any non‑naming conventions