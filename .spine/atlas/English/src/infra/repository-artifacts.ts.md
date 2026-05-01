<!-- spine-content-hash:3c984fb88ceabb373085aa613953ca1cc22f015d5d2d38e08fdee95bea338717 -->
# ArchSpine – Infrastructure Utility Module

## Role
This module provides low-level file system and Git operations for reading managed file blocks and inspecting repository state. It acts as a stable infrastructure utility, isolating these concerns from higher-level service and engine layers.

## Key Responsibilities
- Reads managed file blocks defined by start/end markers from the filesystem using synchronous file operations.
- Executes Git commands synchronously via `execFileSync` to retrieve repository status and file lists.
- Provides path resolution and existence checks for repository files using `path.join` and `fs.existsSync`.

## Out of Scope
- Service orchestration or task execution logic.
- Engine-level scanning or processing pipelines.
- High-level business logic or domain-specific operations.

## Invariants
- Must not import or depend on service, task, or engine modules to avoid absorbing orchestration concerns (per rule `infra-facade-imports`).
- Must expose stable low-level capabilities and facades for callers.

## Public Surface
- `ManagedBlockMarkers` (interface)
- `readManagedFileBlock` (function, inferred)
- Git command execution functions (inferred)

## Change Intent
- **Architectural intent:** Provide a stable, low-level infrastructure utility for file system and Git operations, isolating these concerns from higher-level service and engine layers.
- **Recent change intent:** Refactor CLI to extract repository and LLM admin services, which may involve moving or consolidating utility functions like these into dedicated infrastructure modules.