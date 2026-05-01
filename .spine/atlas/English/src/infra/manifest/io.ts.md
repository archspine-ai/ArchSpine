<!-- spine-content-hash:ef37cd8cc48677161f0a998f17ea94529cb2004e41a69f4750d5d591de796d36 -->
# ArchSpine File Utilities

## Role
Infrastructure utility module providing file path resolution, JSON file reading, and file status snapshot capabilities for the ArchSpine manifest and language snapshot system.

## Key Responsibilities
- Constructs absolute paths to the spine manifest (`.spine/manifest.json`) and language snapshot (`.spine/languages.json`) files within a given root directory.
- Reads and parses JSON files from the filesystem with null safety for missing files, using `defaultRuntimeIO` for warning output.
- Provides file status snapshot capabilities (`mtimeMs`, `size`) via `fs.statSync` for monitoring file changes.

## Notable Invariants
- Manifest and language snapshot paths are always relative to the provided `rootDir` under the `.spine` subdirectory.
- `readJsonFile` returns `null` if the file does not exist, never throws for missing files.
- File status snapshots are computed synchronously using `fs.statSync`.

## Negative Scope (Out of Scope)
- Does not handle schema validation or parsing of manifest/language content beyond JSON deserialization.
- Does not manage file writing, deletion, or directory creation.
- Does not implement caching or memoization of file reads.

## Public Surface
- `getManifestPath(rootDir: string): string`
- `getLanguageSnapshotPath(rootDir: string): string`
- `readJsonFile<T>(filePath: string): T | null`