<!-- spine-content-hash:5d642058c221eccda07e205cb7f354f41cf58cad386c7c36173c93e4a7334f14 -->
# ArchSpine Reconciliation Task

## Role
The ArchSpine reconciliation task synchronizes the manifest's file status with the actual repository state, validates index document compatibility, and updates cache metadata.

## Key Responsibilities
- Loads the language snapshot from the manifest to identify available language extensions.
- Filters tracked files based on detected language extensions and supported document types (e.g., .md, .json).
- Identifies missing or outdated files by comparing manifest entries with filesystem existence and hash calculations.
- Updates manifest file status (e.g., 'missing') and clears exports for missing files.
- Reads and validates index documents for compatibility, reporting issues via runtime warnings.
- Updates manifest file status with document metadata and clears exports for incompatible or missing index documents.

## Notable Invariants & Negative Scope
- **Invariant:** Task modules must implement stage-local work on top of core contracts and engines, and must not take over CLI command parsing or unrelated service orchestration.
- **Out of Scope:**
  - CLI command parsing or argument handling.
  - Orchestration of other pipeline stages or services.
  - Direct filesystem scanning or traversal (delegated to scanner).
  - Language detection logic (delegated to LangRegistry).

## Most Important Exported Behavior
- **Public Surface:** `ReconcileTask` (class extending `SpineTask<void>`)
- This class is the primary entry point for the reconciliation stage. It ensures the manifest's view of the repository is consistent with the actual filesystem state, including index document compatibility checks.