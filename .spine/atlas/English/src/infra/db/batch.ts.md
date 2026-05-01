<!-- spine-content-hash:a93d40e2272f1996b79a3b0e315bce173065f12c9ed56c74b9a844741af07006 -->
# ArchSpine – `commitBatch` Module Summary

**Role**  
Infrastructure-layer batch commit function for atomic file metadata synchronization to the SQLite index database.

**Key Responsibilities**  
- Executes atomic batch insertion and updates of `FileCommitRecord` objects into the SQLite `files` table.  
- Records semantic drift events via the drift repository for changes in file role or responsibilities.

**Out of Scope**  
- Orchestrating high-level scanning or indexing workflows.  
- Providing public API facades for other infrastructure services.  
- Handling file I/O or filesystem operations directly.

**Notable Invariants**  
- Must maintain atomicity of batch commits via SQLite transactions.  
- Must not absorb business logic or orchestration responsibilities beyond data persistence and drift recording.

**Most Important Exported Behavior**  
- `commitBatch(db: Database.Database, commits: FileCommitRecord[]): void` – the sole public function that persists a batch of file commit records atomically.

**Negative Scope / Rule Violations**  
- Imports `./repositories/drift.js` to record semantic drift events, which may be a service/orchestration concern rather than a low-level infrastructure capability. This could violate the rule that infra modules should not absorb service/task/engine orchestration concerns.

**Change Intent**  
- Architectural intent: Provide a stable, atomic batch commit mechanism for file metadata persistence, decoupling database operations from higher-level scanning engines.  
- Recent change: Modularize CLI and decouple core infra services (aligns with refactoring to isolate infrastructure batch commit logic).