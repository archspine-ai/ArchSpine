<!-- spine-content-hash:237363c71acc6a9b577d4fd3b49bee914f9ee849216368fd7765e32d6cff182b -->
# ArchSpine – Check Subsystem Public API Barrel

## Role
Public API barrel module for the check subsystem, re-exporting core service and CLI runner.

## Key Responsibilities
- Exposes the `CheckService` class for programmatic use.
- Exposes the `runCheck` function as the primary CLI entry point.
- Re-exports the `ValidationSummary` type for consumer type safety.

## Out of Scope
- Implementing check logic or validation rules.
- Providing configuration or orchestration.
- Handling CLI argument parsing or user interaction.

## Notable Invariants
- Must only re-export symbols from internal modules.
- Must not contain business logic or side effects.

## Public Surface
- `CheckService`
- `runCheck`
- `ValidationSummary`