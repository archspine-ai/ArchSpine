<!-- spine-content-hash:de548d7cd6cc829d32bad96a6f0a20fffe2eff89525933481bfad1c8a97a3eeb -->
# ArchSpine – Task State & File Collection Test Suite

## Role
Vitest unit test suite validating the task-state module and TypeScript file collection utilities.

## Key Responsibilities
- Validates the `createTaskState` function returns expected keys for given operational modes.
- Ensures the `collectTypeScriptFiles` function recursively traverses directories and filters for `.ts` files.
- Asserts that all TypeScript source files in `src/` and `tests/` directories are valid (parseable) TypeScript.

## Notable Invariants & Negative Scope
- Must import vitest testing utilities (`describe`, `expect`, `it`).
- Must import the task-state module under test.
- Must use file system and path modules for test setup.
- Test file suffix must be `.test.ts` or `.spec.ts`.
- **Out of scope:** Testing non-TypeScript file handling, validating runtime lock guardrails, performance or integration testing.

## Exported / Externally Visible Behavior
This file does not export any public surface; it is a test suite that exercises internal modules and reports pass/fail results.