# ArchSpine Naming Convention Rules

## Purpose
This document establishes clear naming rules to maintain a consistent and predictable codebase, especially within a large monorepo. It anchors automated checks and development workflows, ensuring that all contributions follow the same conventions.

## Audience
All developers contributing to the ArchSpine project should read and adhere to this document. It provides explicit standards that reduce ambiguity during code reviews and improve long‑term maintainability.

## Key Takeaways

- **Interface Naming:** All internal interfaces inside `src/types/**/*.ts` must start with the prefix `I`. For example, `IUserRepository`. This helps distinguish interfaces from types and classes. (Severity: Warning)
- **Test File Naming:** All test files under `tests/**` must end with `.test.ts` or `.spec.ts`. This ensures compatibility with test runners. (Severity: Error)
- These rules are enforced by automated tooling; the assigned severity levels guide whether a violation generates a warning or breaks the build.

## Out of Scope
This document does **not** cover general code formatting, style rules unrelated to naming, naming conventions for constants, functions, classes, directories, or any conventions outside the specified file scopes.