<!-- spine-content-hash:3826adaa5ad9627b7c63961fcbf9a7025e4b6339c30d1664e20ec9c780baa9da -->
# ArchSpine Scanner Engine

## Role
Core file system scanner engine that discovers, filters, and reports on repository files using layered ignore rules, git diff integration, and configurable scan policies.

## Key Responsibilities
- Recursively discovers all files in the repository root directory via filesystem traversal.
- Applies layered ignore rules from `.gitignore`, `.spineignore`, and protocol-specific exclusions/inclusions using the `ignore` library.
- Filters files using picomatch patterns for both inclusions and exclusions based on `ScanPolicy`.
- Identifies changed files by executing git diff commands for incremental scanning via `ScannerGitClient`.
- Produces structured `ScanResult` output containing `allFiles` and `changedFiles` arrays for downstream consumption.

## Notable Invariants & Negative Scope
- **Must not** import from CLI entrypoint modules (engine-independence rule).
- **Must remain** decoupled from service-level orchestration concerns.
- **Must provide** reusable analysis logic without presentation layer dependencies.
- **Out of scope:** CLI argument parsing, service-level orchestration, file content analysis/transformation, persistent state management beyond git diff.

## Public Surface (Exported Behavior)
- `ScanResult` (interface)
- `defaultScannerGitClient` (imported from `scanner-git`)
- `ScannerGitClient` (type, imported from `scanner-git`)
- `ScanPolicy` (imported from `scan-policy`)
- `DEFAULT_SCAN_POLICY` (imported from `scan-policy`)

## Architectural Intent
Provide a reusable, engine-level file scanning module that discovers repository files with layered ignore rules and git diff integration, producing structured results for downstream analysis.

## Recent Change Intent
Resolve lint errors and finalize pipeline fixes before v1.0, ensuring the scanner interface is stable and production-ready.