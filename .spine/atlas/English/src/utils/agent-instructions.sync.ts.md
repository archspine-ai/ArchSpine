<!-- spine-content-hash:e8ace2ca53cb3649d745b222eeb22c4cd0853a9f47cf4be7d0af2f46c72625ed -->
# ArchSpine Sync Utilities

## Role
Utility module providing file-level synchronization and removal operations for ArchSpine agent instruction blocks and configuration sections across repository configuration files.

## Key Responsibilities
- Defines status types (`AgentInstructionsSyncStatus`, `PackageScriptStatus`, `SearchIgnoreSyncStatus`, `SpineIgnoreSyncStatus`, `GitIgnoreSyncStatus`, `GitAttributesSyncStatus`) for tracking synchronization outcomes of ArchSpine blocks in various configuration files.
- Defines removal status types (`AgentInstructionsRemovalStatus`, `SearchIgnoreRemovalStatus`, `SpineIgnoreRemovalStatus`, `GitIgnoreRemovalStatus`, `GitAttributesRemovalStatus`, `PackageScriptRemovalStatus`) for tracking block removal operations.
- Provides file I/O utilities to insert, update, or remove bounded blocks (delimited by START/END markers) in `.gitignore`, `.gitattributes`, `package.json` scripts, `spineignore`, and search ignore files.
- Manages the integrity of ArchSpine-specific configuration sections by reading, modifying, and writing configuration files using regex-based block pattern matching.

## Notable Invariants & Negative Scope
- All block operations use consistent START/END markers defined in templates.
- File modifications preserve existing content outside bounded blocks.
- Removal operations clean up excessive newlines after block deletion.
- Template content definition is delegated to `agent-instructions.templates.js`.
- High-level orchestration of sync operations across multiple files is out of scope.
- CLI command handling or user interaction logic is not included.

## Most Important Exported Behavior
The module exports the following status types that represent the outcome of sync and removal operations:
- **Sync Statuses**: `AgentInstructionsSyncStatus`, `PackageScriptStatus`, `SearchIgnoreSyncStatus`, `SpineIgnoreSyncStatus`, `GitIgnoreSyncStatus`, `GitAttributesSyncStatus`
- **Removal Statuses**: `AgentInstructionsRemovalStatus`, `SearchIgnoreRemovalStatus`, `SpineIgnoreRemovalStatus`, `GitIgnoreRemovalStatus`, `GitAttributesRemovalStatus`, `PackageScriptRemovalStatus`

These types are used by consumers to understand the result of file-level operations without needing to inspect file contents directly.