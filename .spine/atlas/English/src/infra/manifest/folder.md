<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/manifest","role":"Infrastructure layer for manifest state persistence, file integrity verification, and file status tracking.","responsibility":"Provides the core data persistence and integrity verification mechanisms for the ArchSpine mirror system, including file hashing, manifest state management, language snapshot I/O, and file status tracking.","children":[{"filePath":"src/infra/manifest/facade.ts","role":"Infrastructure facade for manifest state persistence, file status tracking, and drift history management.","fileKind":"source"},{"filePath":"src/infra/manifest/integrity.ts","role":"Utility function for generating SHA-256 file hashes with metadata validation and database integration.","fileKind":"source"},{"filePath":"src/infra/manifest/io.ts","role":"Infrastructure utility module providing file path resolution, JSON file reading, and file status snapshot capabilities for the ArchSpine manifest and language snapshot system.","fileKind":"source"},{"filePath":"src/infra/manifest/state.ts","role":"Infrastructure facade module providing manifest file persistence, reverse index state tracking, and language snapshot I/O for the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/manifest/types.ts","role":"TypeScript interface defining a data structure for file metadata snapshots within the ArchSpine mirror system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.165Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/manifest` — Manifest Infrastructure Layer

This directory implements the core persistence and integrity verification mechanisms for the ArchSpine mirror system. It is responsible for file hashing, manifest state management, language snapshot I/O, and file status tracking.

## Notable Children

- **`facade.ts`** — Infrastructure facade for manifest state persistence, file status tracking, and drift history management.
- **`integrity.ts`** — Utility function for generating SHA-256 file hashes with metadata validation and database integration.
- **`io.ts`** — Infrastructure utility module providing file path resolution, JSON file reading, and file status snapshot capabilities for the ArchSpine manifest and language snapshot system.
- **`state.ts`** — Infrastructure facade module providing manifest file persistence, reverse index state tracking, and language snapshot I/O.
- **`types.ts`** — TypeScript interface defining a data structure for file metadata snapshots.

## Key Implementation Areas

- **File Integrity Verification** — The `integrity.ts` module provides SHA-256 hashing with metadata validation and database integration, ensuring that file contents can be reliably verified against stored hashes.
- **Manifest State Persistence** — Both `facade.ts` and `state.ts` handle the persistence of manifest state, including reverse index tracking and drift history management.
- **Language Snapshot I/O** — The `io.ts` module supports reading and writing language-specific snapshots, enabling the system to track changes across different language versions of mirrored content.
- **File Status Tracking** — The facade and state modules work together to track file status changes over time, supporting drift detection and synchronization workflows.