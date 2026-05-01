<!-- spine-content-hash:c94b0f63a8aec23960a4b9aa23b327da190b0065e7f58db99ed754e65862f010 -->
# ArchSpine – `fix` CLI Command Adapter

## Role
This module is a thin CLI command adapter for the `fix` operation. It delegates all execution to the runtime service's fix subsystem facade, keeping the command layer decoupled from business logic.

## Key Responsibilities
- Defines the `ExecuteFixCommandOptions` interface, which requires a `RuntimeService` instance for dependency injection.
- Logs an experimental warning to the console, alerting users that the fix feature is generative and may produce unexpected changes.
- Executes the fix command by calling `runtimeService.getFixService().run()` and awaiting the result.
- Throws an `ArchSpineError` with code `CliCommandFailed` if the fix operation reports any remaining architectural violations after execution.

## Notable Invariants & Negative Scope
- **Must remain a thin adapter** – all business logic, pipeline orchestration, and persistence are delegated to the runtime service.
- **Must not absorb** fix logic, pipeline steps, engine responsibilities, or data access concerns.
- **Does not handle** user input parsing or CLI argument validation; these are assumed to be handled upstream.

## Public Surface
- `ExecuteFixCommandOptions` interface
- `executeFixCommand` function

## Change Intent
The architectural intent is to separate CLI command routing from core fix logic, preserving testability and reuse. Recent changes have focused on tightening schema handling and adding try preview capabilities (though not directly reflected in this file's current code).

## Drift Detection
No drift detected. No rule violations are present.