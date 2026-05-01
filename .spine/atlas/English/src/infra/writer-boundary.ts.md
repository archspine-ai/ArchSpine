<!-- spine-content-hash:bc1e0169ea8058d2564ad8a0935dacf4c95ba23fa5534a89dc0c4f56ec222d88 -->
# SpineWriterBoundary — Write Protection Infrastructure

## Role
Infrastructure boundary component that enforces write protection for ArchSpine's internal directories and files.

## Key Responsibilities
- Defines protected directories (`.spine/index`, `.spine/atlas`, `.spine/view`) and protected file prefixes (`.spine/.lock`, `.spine/cache.db`).
- Provides file system permission locking/unlocking mechanisms to prevent unauthorized writes via mode changes.
- Validates file paths against protected patterns to enforce write boundaries.
- Recursively walks directory trees to apply protection policies.

## Notable Invariants
- Must only depend on Node.js built-in modules (`fs`, `path`) for low-level file operations.
- Must expose a stable public class interface for write boundary enforcement, not absorb orchestration logic.

## Negative Scope (Out of Scope)
- Orchestrating high-level service or engine workflows.
- Handling network or authentication concerns.
- Providing generic file system utilities beyond the defined protection scope.

## Public Surface
- `SpineWriterBoundary` — the primary exported class for enforcing write protection.

## Change Intent
Architectural intent is to encapsulate file system write protection as a stable infrastructure facade, isolating permission management from business logic. No recent changes detected in this file.