<!-- spine-content-hash:663163db824f8166f327c12d5eac3fed6083e2a00a9f79dbde50d26b83901a2f -->
# ArchSpine – Runtime Orchestration Service

## Role
Infrastructure orchestration service for managing resumable command execution sessions with checkpoint validation and protected output mutation detection.

## Key Responsibilities
- Orchestrates runtime command sessions (sync, check, fix) with lifecycle management.
- Validates and loads execution checkpoints to support resumable operations.
- Detects and warns about protected output mutations via spine-gate integration.
- Manages lock acquisition and release during task execution to prevent conflicts.
- Validates runtime configuration and checkpoint state.

## Out of Scope
- Direct view rendering or UI logic.
- Low-level file I/O or database operations (delegated to infra modules).
- Business logic for specific tasks (delegated to task runtime).

## Invariants
- Depends on infra modules for checkpoint storage, mutation detection, I/O, and write access control.
- Exports the `RuntimeCommand` type for command specification.
- Orchestrates session lifecycle but does not implement core task logic.

## Public Surface
- `RuntimeCommand` type
- `RuntimeSessionOptions` interface

## Change Intent
- **Architectural intent:** Provide a resumable, safe orchestration layer for command execution with checkpoint validation and mutation protection.
- **Recent change intent:** Validate runtime config and checkpoint state.