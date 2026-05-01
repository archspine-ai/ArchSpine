<!-- spine-content-hash:fcb4d639328709573bb9c6c3ac83bb4a3b1a7e64f137d7ce47307f3cb42aff28 -->
# ArchSpine – `scan` Command Handler

## Role
CLI command handler for the `scan` operation, orchestrating source code scanning and dry-run reporting.

## Key Responsibilities
- Defines the interface for scan command options including root directory and configuration.
- Parses command-line arguments to detect the `--dry-run` flag.
- Invokes the Scanner engine to perform the scanning operation.
- Formats and outputs a dry-run report when the dry-run flag is present (delegating formatting to the Scanner engine).

## Notable Invariants & Negative Scope
- **Must remain a thin command adapter** – scanning and reporting logic belongs in engines, not here.
- **Out of scope**: implementing scanning logic (delegated to Scanner engine), managing configuration loading (delegated to Config infra), persisting scan results, handling non-CLI execution paths.

## Public Surface
- `ExecuteScanCommandOptions` interface
- `executeScanCommand` function

## Architectural Intent
Separate CLI entrypoint from core scanning logic to keep runtime reusable.