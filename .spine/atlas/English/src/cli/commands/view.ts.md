<!-- spine-content-hash:d6e7d5899e8f17df8dff5968861b2148dc4ede0b5c42d317136ea0d13d32c7d2 -->
# ArchSpine View Command Adapter

## Role
CLI command adapter for the `view` subcommand, handling view selection, validation, and orchestration of protected output writes within the ArchSpine system.

## Key Responsibilities
- Defines the `ExecuteViewCommandOptions` interface for CLI view command parameters.
- Implements initial view selection logic by normalizing configured enabled views and resolving experimental view layers.
- Orchestrates interactive prompts for view selection when needed, using the prompts library.
- Validates selected view IDs against known view definitions.
- Coordinates protected output write access via `withProtectedOutputsWriteAccess` and `writeProtectedOutputBaseline`.
- Logs view configuration details (configured, effective, unknown views) to the console.

## Notable Invariants
- CLI entrypoints must not absorb pipeline or persistence logic; they must delegate to services, core, engines, or infra.
- View selection must respect configured and experimental view layers as defined in services/view.

## Negative Scope (Out of Scope)
- View derivation or computation logic (belongs in services/view or engines).
- Persistence or storage of view state (belongs in infra).
- Business logic for view rendering or transformation.

## Most Important Exported Behavior
- **Public Surface:** `ExecuteViewCommandOptions`
- This adapter is a thin CLI layer that delegates view logic to services and protected writes to infra, ensuring separation of concerns.