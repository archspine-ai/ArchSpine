<!-- spine-content-hash:e3ea23fa5bc5a6849155c992983edbc9ff6274d6b303b4f9d7c462ed4b2c570e -->
# ArchSpine – Prompt-Context Infrastructure Test Suite

## Role
This file is a **Vitest test suite** that validates the core prompt-context infrastructure modules: budget calculation and dependency diagnostics.

## Key Responsibilities
- Tests `calculateSourcePromptBudgets` to ensure correct allocation of validation budgets based on input content and skeleton.
- Tests `buildDependencySelectionDiagnostics` for accurate dependency candidate filtering and diagnostic reporting.
- Tests `buildRuleBlockDiagnostics` for rule block diagnostic generation.
- Asserts expected behavior of infrastructure modules using Vitest's `describe`/`it`/`expect` pattern.

## Notable Invariants & Negative Scope
- **Invariants:** Uses Vitest testing framework; imports specific prompt-context modules (`budgets.js`, `diagnostics.js`); follows project naming conventions (`.test.ts` or `.spec.ts`).
- **Out of Scope:** Does not implement production logic for budget calculation or diagnostics; does not provide CLI or runtime services; does not handle non-test related infrastructure.

## Most Important Exported Behavior
- Exports no public surface; all tests are internal to the suite.
- Ensures reliability of prompt-context infrastructure through unit tests.