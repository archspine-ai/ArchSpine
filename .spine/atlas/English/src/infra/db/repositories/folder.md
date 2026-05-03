This directory houses the **data access layer (DAO)** for ArchSpine's SQLite database, providing all create, read, update, and delete operations for the system's tracked data. It manages persistence and retrieval of semantic drift audits, file metadata, export symbol caches, token usage metrics, and architectural rule violations.

The notable children are grouped by domain into five focused modules:

- **`drift.ts`** – Infrastructure for semantic drift audit events. Inserts drift event records (file path, timestamp, previous role/responsibilities, reason) and queries the most recent events for a given file, parsing JSON-serialized responsibilities.
- **`files.ts`** – File metadata persistence. Handles upsert, retrieval, and deletion of file records (hash, kind, mtime, size), as well as association with documentation (SpineUnit) and listing all tracked files.
- **`symbols.ts`** – Symbol table CRUD for export resolution. Clears, inserts batches, removes by file path, and resolves file paths for symbol names.
- **`usage.ts`** – Token usage metrics. Inserts usage records (sync ID, date, mode, token counts) and provides aggregated summaries (grouped by date/mode, lifetime totals).
- **`violations.ts`** – Architectural rule violation records. Inserts, deletes by file path, and retrieves all active violations ordered by severity and detection time.

The most important implementation areas are the prepared-statement-based CRUD operations in each module, the JSON parsing for responsibilities and documentation, and the batch caching logic in the symbols module.