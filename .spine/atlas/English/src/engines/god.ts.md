<!-- spine-content-hash:185dfccc9ffea55cb9c7b559096bfe9bbca33bcfda76518f41c1124d1b07995d -->
# ArchSpine – God Mode CLI Command

## Role
CLI command orchestrator for generating a comprehensive architectural dossier (God Mode report) from the `.spine/index` directory.

## Key Responsibilities
- Reads and processes `SpineFolderUnit` and `SpineUnit` entries from the `.spine/index` directory using index-reader utilities.
- Transforms file metadata into a structured ledger (`FileLedgerEntry`) with architectural roles, responsibilities, out-of-scope, invariants, public surface, and dependency information.
- Generates a formatted Markdown report summarizing the entire codebase's architecture, including file counts, role distribution, and per-file details.
- Outputs the report to a designated location using the `OutputManager`.

## Notable Invariants & Negative Scope
- **Invariant:** Engine modules should provide reusable analysis and transformation logic without importing CLI entrypoints, and should stay decoupled from service-level orchestration where practical.
- **Out of scope:** Does not perform actual code analysis or AST parsing of source files. Does not execute or validate architectural rules. Does not handle version control or git metadata. Does not provide interactive or real-time feedback.

## Most Important Exported Behavior
- `runGodMode(rootDir: string): { outputPath: string }` – the sole public entry point that orchestrates the entire report generation process.