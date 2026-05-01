<!-- spine-content-hash:972952ddfcb9ae4edd9f866718f7f850ae75d1bcc1a2d668a48cc47d73586e5a -->
# ArchSpine – RepoPath Normalizer

## Role
Internal utility function providing cross-platform repository path normalization for consistent database key representation.

## Key Responsibilities
- Normalizes raw file system paths to repository-relative logical paths.
- Converts Windows backslashes to POSIX forward slashes for cross-platform compatibility.
- Strips leading `./` and `/` prefixes to ensure paths are relative to the repository root.
- Provides a single source of truth for path representation in database lookups and writes.

## Notable Invariants
- Output is always a POSIX-style string with forward slashes.
- Output is always relative to the repository root (no leading slash or `./`).

## Negative Scope (Out of Scope)
- Path validation or existence checking.
- Handling of absolute paths outside the repository.
- URL or URI path normalization.

## Most Important Exported Behavior
- **`normalizeRepoPath`** – the sole public function that transforms any raw file system path into a canonical, repository-relative POSIX path suitable for use as a database key.