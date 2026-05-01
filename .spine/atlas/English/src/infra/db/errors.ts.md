<!-- spine-content-hash:0f4aa608b4bcd4ef4869268c2c2015349c7edf3cf05bc0ef1fb731f45d0cf9d7 -->
# ArchSpine Database Runtime Error Mapping

## Role
Database runtime error mapping utility in the infrastructure layer.

## Responsibilities
- Maps unknown runtime database errors to standardized `ArchSpineError` instances.
- Detects read-only database conditions via error message pattern matching.
- Assigns appropriate error codes based on failure stage (open/init) and error characteristics.

## Out of Scope
- Orchestrating database connections or transactions.
- Handling application-level business logic.
- Providing database driver implementations.

## Invariants
- Pure function with no side effects.
- Always returns an `ArchSpineError` instance.
- Relies on core error definitions and codes.

## Public Surface
- `mapRuntimeDbError` — the sole exported function, normalizes driver-specific database errors into a consistent `ArchSpineError` representation.

## Change Intent
**Architectural intent:** Provide a stable, low-level error normalization facade for database runtime failures, insulating callers from driver-specific error details.

**Recent change intent:** Generic commit with no specific intent discernible from code evidence.