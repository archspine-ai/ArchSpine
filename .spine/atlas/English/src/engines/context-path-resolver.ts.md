<!-- spine-content-hash:eaaf5fb357f94e149096b03418d2ff5f798eed2f8156dbe3169a3cde8bd7a00a -->
# ArchSpine – Relative Import Path Resolver

## Role
A path resolution utility for the scanning engine, specializing in resolving relative import targets within a source tree.

## Key Responsibilities
- Resolves relative import source strings to absolute file system paths given a root directory and containing directory.
- Consults the language registry to determine valid source file extensions for existence checking.
- Performs file existence and type validation (file vs. directory) for candidate paths.
- Returns the resolved relative path from the root directory if a valid source file is found, otherwise returns null.

## Notable Invariants
- Must only process import sources that start with `.`.
- Must rely on the `LangRegistry` for language-specific source file extensions.
- Must validate that the resolved path exists and is a file.
- Must be decoupled from CLI entrypoints and presentation logic (aligned with engine-independence rule).

## Negative Scope (Out of Scope)
- Handling non-relative imports (e.g., package imports).
- Module bundling or dependency graph construction.
- CLI argument parsing or user interaction.
- Service-level orchestration or state management.

## Most Important Exported Behavior
- **`resolveRelativeImportTarget(rootDir: string, dir: string, source: string): string | null`**  
  This is the sole public function. It takes a root directory, a containing directory, and a relative import source string, and returns the resolved relative path from the root if a valid source file is found, or `null` otherwise.