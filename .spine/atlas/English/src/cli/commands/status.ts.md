<!-- spine-content-hash:c8150a304a5d1fe54fb633941b1a3de60d095b143c04007070d521364e10190a -->
# ArchSpine Status Command Adapter

## Role
CLI command adapter for displaying the synchronization status of the ArchSpine mirror system.

## Key Responsibilities
- Provides the command interface (`ExecuteStatusCommandOptions`) for dependency injection of the runtime service facade.
- Invokes the sync service's status method via the injected runtime service facade.
- Formats and outputs the synchronization status (total files, needing sync, failures) to the console.
- Handles errors by converting them to `ArchSpineError` instances for consistent CLI error reporting.

## Notable Invariants
- Must remain a thin CLI adapter delegating all business logic to the runtime service.
- Must not import or use persistence, pipeline, or engine modules directly.

## Negative Scope (Out of Scope)
- Direct interaction with file system or persistence layers.
- Business logic for computing synchronization status.
- Pipeline orchestration or data transformation.

## Public Surface
- `ExecuteStatusCommandOptions`
- `executeStatusCommand`