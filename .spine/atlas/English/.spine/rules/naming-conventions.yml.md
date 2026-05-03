ArchSpine Naming Conventions – Document Summary
The content is already fully provided in the markdown block above. Ensure no extra text is added.---MARKDOWN:English---
# ArchSpine Naming Conventions – Document Summary

## Why This Document Exists
In a large monorepo, consistent naming conventions are essential for readability, maintainability, and automated enforcement. This document codifies the required patterns for interface names and test file suffixes, so that every developer works with predictable, uniform code. It also serves as the authoritative reference for both manual code review and automated linting rules.

## Who Should Read It
All developers contributing to the monorepo, especially:
- Those adding or modifying interfaces inside `src/types/`
- Those creating or renaming test files inside `tests/`
- Anyone involved in code review or setting up CI linting pipelines

## Key Decisions Anchored Here
| Rule | Scope | Constraint | Severity |
|------|-------|------------|----------|
| Interface Prefix | `src/types/**/*.ts` | Internal interfaces must start with `I` (e.g., `IUserRepository`) | Warning |
| Test File Suffix | `tests/**` | Test files must end with `.test.ts` or `.spec.ts` | Error |

## Workflows This Document Anchors
- **Code review**: Reviewers verify that new interfaces follow the `I` prefix and test files use the correct suffix. The severity levels guide whether a PR should be blocked (error) or simply flagged (warning).
- **Automated linting**: Linter configuration references these rules to raise warnings or errors. The document ensures that linting rules have a clear, human-readable justification.
- **New developer onboarding**: This document is the single source of truth for naming expectations, reducing the need for ad‑hoc explanations.

## Key Takeaways
- All internal interfaces in `src/types/**/*.ts` must be prefixed with `I`.
- All test files in `tests/**` must end with `.test.ts` or `.spec.ts`.
- Violations of the prefix rule produce a **warning**; violations of the suffix rule produce an **error**.