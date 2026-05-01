<!-- spine-content-hash:d2d92d23457c350db9a900156919306f2997f66e06ab666fafef6bdcf98e5367 -->
# ArchSpine ESLint Flat Configuration

## Role
This module provides the ESLint flat configuration for the ArchSpine project, defining static analysis rules for TypeScript source files.

## Key Responsibilities
- Defines linting rules for TypeScript files located in `src/services/`, `src/tasks/`, `src/infra/`, `src/engines/`, and `src/utils/` directories.
- Composes recommended ESLint configurations from `@eslint/js`, `typescript-eslint`, and `eslint-config-prettier`.
- Configures the ECMAScript version and module source type for the linter.
- Enforces coding standards including no unused variables, const preference, strict equality, and mandatory curly braces.

## Notable Invariants & Negative Scope
- **Invariant:** The configuration must always be exported as a default array via `tseslint.config()`.
- **Invariant:** The `files` pattern must target only TypeScript files under `src/` subdirectories.
- **Out of Scope:** Does not configure linting for test files or root-level TypeScript files.
- **Out of Scope:** Does not define custom rules beyond the composed recommended configs.

## Public Surface
- **Default export:** An array of ESLint configurations produced by `tseslint.config()`.

## Drift Detected
The previous semantic contract included test files (`tests/` directory) in the linting scope, but the current configuration only targets `src/` subdirectories. The file no longer applies to test files.