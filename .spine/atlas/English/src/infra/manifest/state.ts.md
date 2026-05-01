<!-- spine-content-hash:3c804d04f25db77916c68d65da444cb25a44fe66eb6911dc4bc1bca4c12b9a33 -->
# ArchSpine Manifest & Snapshot Facade

This module is the infrastructure facade for the ArchSpine system, responsible for persisting manifest files, tracking reverse index state, and handling language snapshot I/O.

## Role

Provides a stable, low-level persistence layer that isolates file I/O details behind public interfaces. It does not orchestrate scanning or indexing workflows.

## Key Responsibilities

- Defines `ManifestRuntimeState` interface for tracking reverse index completion status.
- Defines `ManifestStatusSource` interface for querying global file counts and active violations.
- Loads manifest runtime state from `.spine` directory JSON files.
- Determines if manifest state is "virgin" (no prior sync) using the status source.
- Checks for existence of a manifest baseline file.
- Persists reverse index completion state to manifest JSON.
- Saves full manifest state including runtime state, status, mode, duration, and optional LLM metadata.
- Loads language snapshot JSON files from `.spine` directory.
- Saves language snapshot JSON files to `.spine` directory.

## Notable Invariants

- All manifest and snapshot file paths are derived via `./io.js` helpers (`getManifestPath`, `getLanguageSnapshotPath`).
- Manifest state is persisted as JSON in the `.spine` directory.
- Language snapshots are persisted as JSON in the `.spine` directory.
- The module does not import from service, task, or engine layers, maintaining infrastructure isolation.

## Out of Scope

- Direct file system operations (delegated to `FileSystemManager` and `./io.js`).
- Reverse index generation or scanning logic.
- Language snapshot content generation or validation.
- Orchestration of scanning or indexing workflows.

## Public Surface

- `ManifestRuntimeState`
- `ManifestStatusSource`
- `loadManifestState`
- `isVirginManifestState`
- `hasManifestBaseline`
- `persistReverseIndexState`
- `saveManifestState`
- `loadLanguageSnapshot`
- `saveLanguageSnapshot`