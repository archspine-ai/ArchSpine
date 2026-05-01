<!-- spine-content-hash:a19cbd7c7609ad0870236c4520bc679077d34f5e1c949bbf7f55446cf965579b -->
# ArchSpine View Module Boundary Test

This Vitest unit test enforces architectural module boundaries for the view service layer. Its primary purpose is to ensure that view runtime and rendering modules are correctly placed under the `src/services/view` directory, maintaining a clean separation between the service layer and the infrastructure layer.

## Key Responsibilities

- Validates that view runtime and rendering modules reside in `src/services/view`
- Asserts the existence of specific view module files:
  - `view-renderer.ts`
  - `arch-diagram-renderer.ts`
  - `view-registry.ts`
  - `view-runtime.ts`
- Ensures that `view-renderer.ts` is **not** placed in `src/infra`, enforcing layer separation

## Out of Scope

- Does **not** test the functionality of the view modules themselves
- Does **not** validate the content or correctness of the module files
- Does **not** enforce naming conventions beyond file location

## Invariants

- Must be a test file using the Vitest framework
- Relies on Node.js `fs` and `path` modules for file system assertions
- Asserts on the physical file structure of the repository

## Architectural Intent

This test enforces clean separation between the service layer (view) and the infrastructure layer by validating file placement. It supports a recent refactoring effort to modularize the CLI and decouple core infrastructure services, guarding against incorrect module placement that could violate architectural boundaries.

## Exported Behavior

This test file does not export any public surface; it is purely a validation mechanism executed during the test suite.