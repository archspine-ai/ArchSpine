<!-- spine-content-hash:02de2bea6657fea6927779a797250d454e4adc15a5492f83817b1a35de8bbc19 -->
# ArchSpine – Violation DAO (SQLite)

## Role
Infrastructure Data Access Object (DAO) for persisting and querying architectural rule violation records in SQLite.

## Key Responsibilities
- Insert new violation records (file path, rule ID, severity, reason, timestamp) into the SQLite violations table.
- Delete all violation records associated with a specific file path.
- Retrieve all violation records ordered by severity and detection time for reporting.

## Notable Invariants
- Depends only on the SQLite driver (`better-sqlite3`) and internal types.
- Exposes a stable, low-level data access interface for violation records.
- Callers must provide an active database connection.

## Negative Scope (Out of Scope)
- Orchestrating scanning or audit processes.
- Enforcing architectural rules or performing validation.
- Providing a high-level facade for other infrastructure services.

## Public Surface (Exported Behaviors)
- `recordViolation(db, filePath, ruleId, severity, reason): void`
- `deleteViolationsForFile(db, filePath): void`
- `getAllViolations(db): ViolationRecord[]`