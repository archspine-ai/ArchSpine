<!-- spine-content-hash:0ea38a3e26f30f0dd9331fc9355e6075988e8756ddaf5b0e9cae3f0ad7771022 -->
# ArchSpine – Hook Command Adapter

## Role
CLI command adapter for managing git hook integration and synchronization within the ArchSpine system.

## Key Responsibilities
- Parses the hook synchronization mode from string input to enforce valid configuration.
- Enables or disables the pre-commit git hook based on user command arguments via configuration updates.
- Executes the synchronization workflow by delegating to the dedicated sync module when the hook is triggered.
- Provides status feedback about the current hook configuration and synchronization mode to the user.

## Out of Scope
- Implementing the core synchronization pipeline logic (delegated to sync.js).
- Managing git hook script content (delegated to git-hook.js utilities).
- Persisting configuration state (handled by Config service).

## Invariants
- Must remain a thin command adapter; all pipeline logic must be delegated to services/engines.
- Must not contain business logic for scanning, analysis, or repair.

## Public Surface
- `ExecuteHookCommandOptions` interface
- `parseHookSyncMode` function