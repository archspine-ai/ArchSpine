<!-- spine-content-hash:67f7212bfd6100321ed2a93c5e033628e4dbce2bca4665dc285caa3e649d08cb -->
# ArchSpine – Drift Event Data Access

## Role
Infrastructure data access function for persisting and retrieving semantic drift audit events in SQLite.

## Key Responsibilities
- Inserts a drift event record into the SQLite database with file path, timestamp, previous role, responsibilities, and reason.
- Queries the most recent drift events for a given file path, parsing stored JSON responsibilities back into arrays.

## Notable Invariants & Negative Scope
- Exposes low-level SQLite operations for drift event persistence and retrieval.
- Relies on prepared statements and JSON serialization for responsibilities array storage.
- Does **not** orchestrate higher-level audit workflows or business logic.
- Does **not** provide a public API facade for drift event management; callers interact directly with the database statements.

## Most Important Exported Behavior
- `recordDriftEvent` function (inferred from usage patterns and previous contract)
- Query function for retrieving drift events (inferred from usage patterns)