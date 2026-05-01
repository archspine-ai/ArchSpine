<!-- spine-content-hash:4a09021e3a4f46a2ada0d28508baf7a33420b7806a41f7efc9cbdd32dca6979e -->
# ArchSpine – UsageMetricsDao

**Role:** Infrastructure Data Access Object (DAO) for persisting and querying token usage metrics in the SQLite database.

## Key Responsibilities

- Inserts token usage records (input, output, total) into the `usage_logs` table with sync metadata.
- Provides aggregated summary queries for recent usage grouped by date and sync mode.
- Provides total lifetime usage statistics across all recorded sessions.

## Notable Invariants & Negative Scope

- **Invariants:** Depends on a `better-sqlite3` Database instance for all operations; exports pure functions that accept a database connection as parameter; queries are static SQL strings prepared at call time; uses ISO date strings for date column storage.
- **Out of Scope:** Orchestrating service/task/engine workflows, exposing high-level infrastructure facades, handling authentication or authorization, managing database connection pooling or transactions beyond simple queries.

## Public Surface (Exported Functions)

- `recordUsage(db, mode, input, output, total): void`
- `getRecentUsageSummary(db): UsageSummaryRow[]`
- `getLifetimeUsageTotals(db): UsageTotals`

## Change Intent

**Architectural Intent:** Encapsulate database interactions for usage metrics to separate concerns and enable testability.  
**Recent Change Intent:** No recent changes detected in this module; recent commit `refactor: modularize CLI and decouple core infra services` may affect surrounding infrastructure but not this DAO directly.