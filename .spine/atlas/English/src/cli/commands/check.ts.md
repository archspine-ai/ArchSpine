<!-- spine-content-hash:f86c2113efb51160b81db89480cbbe261279b84d42b722e8760e17f1b9fa8116 -->
# ArchSpine – `check` Command Adapter

## Role
This module is a thin CLI adapter for the `check` operation. It provides the entry point that delegates all rule checking and validation to the `RuntimeService`'s `CheckService`, and signals failures via structured errors.

## Key Responsibilities
- Exposes the CLI entry point for the `check` command via the exported `executeCheckCommand` function.
- Delegates core rule checking and validation to the `RuntimeService`'s `CheckService`, maintaining a clean separation of concerns.
- Throws a structured `ArchSpineError` if the check summary indicates violations or failed files, ensuring the CLI exits with an appropriate error code.

## Out of Scope
- Implementing rule checking or validation logic (delegated to `CheckService`).
- Handling persistence or file I/O for checks.
- Parsing CLI arguments or configuration (assumed to be handled upstream).

## Invariants
- Must remain a thin adapter; all business logic must be delegated to `RuntimeService` or its services.
- Must not contain pipeline, engine, or infrastructure logic.

## Public Surface
- `ExecuteCheckCommandOptions` interface
- `executeCheckCommand` function

## Architectural Intent
This module serves as a thin CLI entrypoint adapter, ensuring separation between command routing and core runtime services. It was created as part of a refactoring effort to establish subsystem facades and resolve layer inversions, reinforcing its role as a thin adapter.