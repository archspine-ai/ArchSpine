<!-- spine-content-hash:3017ae5b9269b3cdb7fca6fd57aba9092ded38cedca4c4a824315af02e617674 -->
# ArchSpine File Metadata DAO

This module is a **Data Access Object (DAO)** that provides SQLite persistence operations for file metadata within the ArchSpine indexing system. It encapsulates all direct database interactions, isolating SQL concerns from higher-level business logic.

## Key Responsibilities

- **Query file status**: Retrieve file status records (hash, kind, mtime, size) from the SQLite database by file path.
- **Upsert file records**: Insert or update file records with optional metadata, ensuring idempotent operations.
- **Update documentation and authority**: Modify file documentation and authoritative status in the database.
- **Delete file records**: Remove file records by path.
- **List all files**: Return all stored file paths.
- **Count files**: Return the total number of file records.

## Notable Invariants

- All operations depend on a `better-sqlite3` Database instance.
- The module assumes a `files` table with columns: `path`, `hash`, `kind`, `lastIndexedAt`, `docs`, `is_authoritative`, `mtime`, `size`.
- Exported functions are pure in the sense that they perform direct SQL operations without side effects beyond the database.

## Out of Scope

- Does **not** orchestrate indexing tasks or engine workflows.
- Does **not** provide high-level infrastructure facades for other services.
- Does **not** handle HTTP requests or user authentication.
- Does **not** manage database schema migrations or connections.

## Public Surface (Exported Functions)

- `getFileStatus`
- `ensureFileRecord`
- `updateFileDocs`
- `updateFileAuthoritative`
- `deleteFileRecord`
- `listAllFiles`
- `countFiles`