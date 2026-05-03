The `infrastructure` directory provides the foundational layer for file system interaction, integrity verification, and manifest state persistence within the ArchSpine mirror system. Its role is to abstract low-level operations such as computing SHA-256 file hashes, resolving file paths to well-known manifest and language snapshot files, reading and writing JSON-based state files, and managing file metadata snapshots.

The directory groups its components by responsibility:

- **Integrity verification** – `integrity.ts` computes SHA-256 hashes for files, validates file existence, and integrates with SpineDB status tracking.
- **File I/O and path resolution** – `io.ts` resolves absolute paths to the spine manifest and language snapshot files, reads JSON with null safety, and captures filesystem status snapshots (mtime, size).
- **State persistence and management** – `state.ts` defines runtime state interfaces, loads/saves manifest and language snapshot JSON files, and tracks reverse index completion and baseline detection. `facade.ts` wraps these operations into a higher-level interface for batch commits, file status tracking, drift history, and manifest baseline handling.
- **Type definitions** – `types.ts` provides a TypeScript interface for file metadata snapshots (mtime, size), ensuring consistent data contracts across the codebase.

Together, these modules form the backbone for reliable file status tracking, manifest baseline detection, and persistent mirror state, enabling the rest of ArchSpine to reason about file integrity and changes over time.