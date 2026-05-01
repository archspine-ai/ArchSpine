<!-- spine-content-hash:7286b2595c28ca3b40b9bf87979ca1a44a9aa9919674712b12a23f5eb9d45876 -->
# OutputManager — Spine Filesystem Facade

## Role
Infrastructure facade for writing Spine index units (JSON) to the filesystem within the `.spine` directory.

## Key Responsibilities
- Manages root and `.spine` directory paths for output operations.
- Writes `SpineUnit`, `SpineFolderUnit`, and `SpineProjectUnit` objects as JSON files to appropriate locations under `.spine`.
- Reads `SpineUnit` objects from disk by relative path, with fallback to `.json` extension if missing.
- Ensures target directories exist before writing files via `ensureDir` method.

## Notable Invariants & Negative Scope
- All output paths are relative to the `.spine` directory under `rootDir`.
- Target directories are created before any file write operation.
- File reads fallback to `.json` extension if the exact path is not found.
- Does **not** handle reading or writing of non-Spine files.
- Does **not** manage runtime I/O or process orchestration.
- Does **not** validate the content of Spine units beyond type constraints.

## Public Surface
- `OutputConfig` interface
- `OutputManager` class

## Change Intent
Provides a stable, low-level filesystem facade for persisting Spine index data, isolating file I/O concerns from higher-level orchestration logic. Recent changes resolved lint errors and finalized pipeline fixes before v1.0 — this file appears stable with no lint issues.