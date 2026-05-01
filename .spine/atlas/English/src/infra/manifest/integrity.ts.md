<!-- spine-content-hash:41893fab664aca7d03e99d990e6aeb06627f27b4a4982bb48a057fc5f7f0ecf2 -->
# ArchSpine File Hash Utility

## Role
Utility function for generating SHA-256 file hashes with metadata validation and database integration.

## Key Responsibilities
- Validates file existence and retrieves filesystem metadata (size, modification time).
- Normalizes file paths using the repository path utility.
- Queries the SpineDB for the current file status.
- Computes a SHA-256 hash of the file content.

## Notable Invariants & Negative Scope
- **Invariants:** Depends on SpineDB for file status lookup; uses Node.js `crypto` and `fs` modules for hash computation and file system operations; path normalization must be applied before database queries.
- **Out of Scope:** Does not orchestrate service or engine workflows; does not provide a stable infrastructure facade; does not handle file content parsing or transformation beyond hashing.

## Most Important Exported Behavior
- `calculateHash(db: SpineDB, filePath: string): string` — the sole public function that computes a deterministic, database-aware file hash for tracking file integrity and changes in the ArchSpine mirror system.