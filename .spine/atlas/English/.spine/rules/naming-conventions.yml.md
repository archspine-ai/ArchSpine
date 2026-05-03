# ArchSpine Naming Convention Rules

## Purpose

This document establishes and enforces naming conventions for TypeScript code within a large monorepo. It exists to ensure that interfaces and test files follow a predictable, consistent pattern, reducing cognitive load for developers and preventing style drift across hundreds of modules.

## Intended Audience

Any developer contributing TypeScript code to the ArchSpine monorepo should read this rule set. It is particularly relevant for:

- Frontend and backend engineers writing interfaces in `src/types/`
- Testing engineers creating or updating files under `tests/`
- Code reviewers who need to enforce naming standards

## Key Decisions Anchored Here

- **Interface Prefix (`I`)** – All interfaces inside `src/types/**/*.ts` must begin with an uppercase `I` (e.g., `IUserRepository`). Violations produce a **Warning**, signaling that the style is recommended but not blocking.
- **Test File Suffix** – All test files in `tests/` must end with `.test.ts` or `.spec.ts`. Violations produce an **Error**, meaning the build or lint process will fail if this rule is broken.

## Workflow Impact

This rule set is enforced by an automated linter configured in the monorepo’s CI pipeline. When a developer creates a new file, the linter checks both rules immediately. For interface-prefix warnings, developers can override the rule with an inline comment if there is a strong reason. For test-file suffix errors, the CI blocks the pull request until the file is renamed.

## Why These Conventions Matter

- **Interface prefix** distinguishes type shapes from concrete classes and type aliases at a glance.
- **Test file suffix** ensures test runners can discover files without custom configuration, and keeps production code separate from test code.

Both conventions are lightweight and widely adopted in the TypeScript ecosystem, reducing onboarding friction for new team members.