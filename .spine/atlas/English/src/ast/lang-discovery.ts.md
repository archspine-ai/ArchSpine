<!-- spine-content-hash:42899fcd73195186868a9f96320a91fd8554531fd2cf54edab760a0ada83aa1b -->
# ArchSpine Language Discovery Module

## Role
AST language discovery and lifecycle module that scans file collections, resolves programming languages via extension mapping, computes deltas between snapshots, and validates language support.

## Key Responsibilities
- Scans a collection of file paths to identify unique file extensions and resolve them to programming languages using LangRegistry.
- Exposes `resolveLanguage` function to determine the language of a single file path.
- Computes LanguageDelta between current and previous language snapshots, tracking added, removed, and changed languages.
- Validates language support by checking if detected extensions are registered in the LangRegistry and reporting unsupported languages.

## Notable Invariants & Negative Scope
- All detected extensions are lowercased before processing.
- Language snapshots contain sorted arrays of detected extensions.
- **Out of scope:** File system traversal or directory walking (operates on provided file paths only). Language configuration or registration (delegated to LangRegistry). Persistent storage of language snapshots.

## Public Surface (Exported Behavior)
- `discoverLanguages(files: string[]): Promise<LanguageSnapshot>` — Scans file paths and returns a snapshot of detected languages.
- `diffLanguages(prev: LanguageSnapshot, curr: LanguageSnapshot): LanguageDelta` — Computes the difference between two language snapshots.
- `resolveLanguage(filePath: string): Promise<...>` — Resolves the programming language for a single file path.