<!-- spine-content-hash:dce8021ed8f2738ac312b0e952d381279f7a36e2d40de2b7871903e132dda1bf -->
# ArchSpine – `walRecovery` Module Summary

**Role:** Infrastructure utility module for SQLite Write-Ahead Log (WAL) stale file detection and cleanup.

**Key Responsibilities:**
- Defines a byte threshold (`STALE_WAL_THRESHOLD_BYTES` = 512KB) to identify stale WAL files that may indicate a killed process.
- Exposes a recovery function (`recoverStaleWal`) that removes stale WAL and shared-memory (SHM) files to prevent empty reconciliations and subsequent LLM rate limit overload.

**Notable Invariants & Negative Scope:**
- The threshold constant must remain at 512KB to match the heuristic for detecting killed processes.
- `recoverStaleWal` must only operate on WAL and SHM files derived from the given `dbPath`.
- The module must not import or depend on service, task, or engine modules to comply with the infra-facade-imports rule.
- **Out of scope:** Database connection management, query execution, orchestration of reconciliation or sync tasks, and any higher-level business logic or service coordination.

**Most Important Exported / Externally Visible Behavior:**
- `STALE_WAL_THRESHOLD_BYTES` (constant) – the byte threshold used to identify stale WAL files.
- `recoverStaleWal(dbPath: string): void` – removes stale WAL and SHM files for the given database path, preventing data loss and LLM rate limit issues.

**Change Intent:** This module provides a stable, low-level infrastructure facade for detecting and cleaning up stale SQLite WAL files. No recent changes detected; it appears stable and aligned with pipeline fixes before v1.0.