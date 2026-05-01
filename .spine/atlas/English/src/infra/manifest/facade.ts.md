<!-- spine-content-hash:a2caa3c3cb3fc788edda2e67e4ba99d0d4ccc1e45e0c486c063205e54d77877d -->
# ArchSpine – Manifest & File State Facade

## Role
Infrastructure facade for manifest state persistence, file status tracking, and drift history management.

## Key Responsibilities
- Encapsulates SpineDB operations for file status snapshots and document storage.
- Manages manifest baseline detection and virgin state checks.
- Persists and loads language snapshots for localization.
- Tracks file drift history and updates file records.
- Provides batch commit operations for file status updates.

## Notable Invariants & Negative Scope
- Must remain a stable facade over lower-level infrastructure modules (SpineDB, state).
- Must not absorb service/task/engine orchestration concerns.
- Does **not** orchestrate high-level business logic or engine workflows.
- Does **not** perform direct file I/O beyond status snapshot acquisition.
- Does **not** handle authentication or user session management.

## Most Important Exported / Externally Visible Behavior
- `Manifest` class – primary interface for manifest operations.
- `hasManifestBaseline` export – checks whether a baseline manifest exists.