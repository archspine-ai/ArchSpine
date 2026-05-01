<!-- spine-content-hash:c2352c26535f47d7ba78a3c2e16b2697a98455037fd2181ed57b7d49899dfbff -->
# ArchSpine – `info` Command Handler

## Role
This module is the CLI command handler for the `info` command. It acts as a **thin adapter** that orchestrates the execution of the info report engine without containing any business logic itself.

## Key Responsibilities
- Defines the `ExecuteInfoCommandOptions` interface, which specifies runtime options such as the root directory and command arguments.
- Invokes the `runInfoReport` engine, passing configuration derived from CLI arguments and default runtime I/O.
- Provides error handling by catching internal errors and mapping them to structured `ArchSpine` errors, ensuring consistent CLI output.

## Notable Invariants & Negative Scope
- **Must remain a thin CLI adapter** – all pipeline logic is delegated to engines and services.
- **Must not** execute the actual info report logic or perform data aggregation.
- **Must not** directly access persistence or database layers.
- **Must not** implement any business logic beyond command orchestration.

## Public Surface
- `ExecuteInfoCommandOptions` (interface)
- `executeInfoCommand` (async function)

This module is the clean entry point for the `info` command, ensuring separation of concerns and maintainability.