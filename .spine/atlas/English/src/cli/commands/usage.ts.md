<!-- spine-content-hash:336ea48d7cb3168eec98edf18f78d6d427c3b29064d92c9d788766052ccfe60a -->
# ArchSpine – Usage Command Entry Point

## Role
CLI command entry point for executing usage reports.

## Key Responsibilities
- Defines the command-line interface options for the usage command via the `ExecuteUsageCommandOptions` interface.
- Delegates execution to the usage engine (`runUsageReport`) with the provided root directory and default runtime I/O.

## Notable Invariants & Negative Scope
- Must remain a thin adapter, delegating all substantive work to the usage engine.
- Must not absorb pipeline, persistence, or business logic from engines or infra.
- Pipeline or persistence logic belongs in engines, services, core, or infra.
- Business logic for generating usage reports is out of scope.
- Runtime I/O implementation or configuration is out of scope.

## Most Important Exported / Externally Visible Behavior
- `ExecuteUsageCommandOptions` interface
- `executeUsageCommand` function