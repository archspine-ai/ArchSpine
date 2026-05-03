The `dao` directory implements the **data access layer** (DAO) for ArchSpine’s persistent storage, using SQLite via the `better-sqlite3` library. It provides five focused modules, each responsible for CRUD operations on a distinct domain:

- **`drift.ts`** – Semantic drift audit events. Inserts drift records (file path, timestamp, role, responsibilities, reason) using prepared statements, and retrieves the most recent events for a given file.
- **`files.ts`** – File metadata persistence. Handles upserts, status updates, documentation (SpineUnit) association, deletion, listing, and global file count for the indexing system.
- **`symbols.ts`** – Export symbol cache. Clears, batch-inserts, removes by file, and resolves file paths for exported symbols, used for export resolution.
- **`usage.ts`** – Token usage metrics. Logs token consumption (sync ID, date, mode, counts) and provides aggregated usage summaries (grouped by date/mode, total lifetime statistics).
- **`violations.ts`** – Architectural rule violations. Inserts violation records (file, rule ID, severity, reason, timestamp), deletes by file for revalidation, and retrieves all active violations ordered by severity and time.

All modules operate on a single SQLite database, sharing the same connection point. The key implementation patterns include **parameterized prepared statements** for safety, **JSON serialization/deserialization** for complex fields (e.g., responsibilities arrays), and **upsert logic** for ensuring record existence without duplication.