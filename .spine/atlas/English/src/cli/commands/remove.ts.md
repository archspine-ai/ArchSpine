<!-- spine-content-hash:dd3c82c8882288e516a438d9a23bc86829087c16ca17b2b364d7429a67b79514 -->
# ArchSpine Remove Command Adapter

## Role
CLI command adapter for the `remove` operation, orchestrating the cleanup of ArchSpine-managed artifacts from a repository.

## Key Responsibilities
- Parses command-line arguments to determine removal scope and confirmation requirements.
- Coordinates the removal of ArchSpine-managed files (agent instructions, git attributes, git ignore, search ignore, spine ignore) based on configuration state.
- Manages the uninstallation of ArchSpine-managed Git hooks from the repository.
- Provides user confirmation prompts before performing destructive removal operations.

## Notable Invariants & Negative Scope
- **Must remain a thin command adapter**, delegating all file and hook operations to dedicated utility modules.
- **Must not contain business logic** for determining what constitutes an ArchSpine-managed artifact; that logic belongs to the Config service.
- Out of scope: implementing low-level file system removal logic, managing persistence of configuration state, executing core pipeline or scanning logic.

## Most Important Exported Behavior
- Exposes the `ExecuteRemoveCommandOptions` interface as its primary public surface.