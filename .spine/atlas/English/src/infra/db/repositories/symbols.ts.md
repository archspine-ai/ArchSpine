<!-- spine-content-hash:c0b6b4d82eeb7184246221a3a20ea9977bd4c1b77e48c06d3d6e193935914b8b -->
# ArchSpine – SymbolTable DAO (SQLite)

## Role
Infrastructure Data Access Object (DAO) for SQLite symbol table persistence.

## Key Responsibilities
- Provide atomic operations to invalidate the entire symbol cache.
- Insert or ignore exported symbol names associated with a source file path.
- Delete symbols by file path.
- Query file paths by symbol name.

## Notable Invariants & Negative Scope
- Exposes stable, low-level SQLite operations for the symbols table.
- Callers must provide an active `Database.Database` instance.
- Functions are atomic and transaction-aware where appropriate.
- **Out of scope:** Orchestrating service or task workflows, providing high-level business logic or application services, exposing a public facade beyond direct database operations.

## Public Surface (Exported Functions)
- `invalidateCache(db: Database.Database): void`
- `addFileExports(db: Database.Database, filePath: string, exports: string[]): void`
- `deleteSymbolsByFilePath(db: Database.Database, filePath: string): void`
- `queryFilesBySymbol(db: Database.Database, symbol: string): string[]`