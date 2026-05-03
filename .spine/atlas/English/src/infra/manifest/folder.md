This directory implements the infrastructure layer for the ArchSpine mirror system, focusing on manifest persistence, file integrity verification, and state management. The modules are organized around five key areas:

- **Data Types** (`types.ts`) – Defines the `FileSnapshot` interface, providing a consistent contract for file metadata (modification time and size) used throughout the system.
- **File I/O** (`io.ts`) – Handles deterministic path resolution for the `.spine/manifest.json` and `.spine/languages.json` files, JSON reading with null safety, and filesystem status snapshots via `fs.statSync`.
- **Integrity Verification** (`integrity.ts`) – Computes SHA-256 hashes with filesystem validation and retrieves current file status from SpineDB, throwing descriptive errors for missing or non-regular files.
- **State Management** (`state.ts`) – Provides persistence for manifest runtime state (including reverse index tracking), baseline detection, and language snapshot I/O. Defines `ManifestRuntimeState` and `ManifestStatusSource` interfaces.
- **Facade** (`facade.ts`) – Encapsulates SpineDB operations into a unified interface for manifest state persistence, file status tracking, drift history management, and batch commits.

The most critical implementation areas are manifest baseline detection and virgin state checks (`state.ts`), SHA-256 hashing with filesystem validation (`integrity.ts`), and the facade’s integration of all submodules for synchronization and verification workflows.