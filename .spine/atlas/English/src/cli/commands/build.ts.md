<!-- spine-content-hash:5e3c51e175495b2020cdc54f608520d7848de5462ea6ca22a5f90b2843b01670 -->
# Build Command Adapter

## Role
CLI command adapter for the 'build' operation, orchestrating the build workflow and delegating to core services.

## Key Responsibilities
- Defines the structured options interface for the build command.
- Orchestrates the build workflow by delegating to runtime services and sync workflows.
- Validates command-line arguments and provides usage feedback via CLI utilities.

## Out of Scope
- Implementing core build logic or persistence (delegated to RuntimeService and other services).
- Directly handling low-level file I/O or pipeline execution.

## Invariants
- Must remain a thin adapter, delegating all business logic to injected services.
- Must not contain domain logic, pipeline orchestration, or data persistence implementations.

## Public Surface
- `ExecuteBuildCommandOptions`
- `executeBuildCommand`