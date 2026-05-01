<!-- spine-content-hash:39b0b10f62b997886a2462d9171d0c8f91c81366a826081b9ce0184be586ad17 -->
# ArchSpine – Scanning Policy Type Definitions

This module defines the core TypeScript type contract for scanning policy configuration in the ArchSpine mirror system. It establishes the permissible file origins, the structure of a complete scan policy, and a partial variant for incremental updates.

## Role

Core TypeScript type definition module establishing the scanning policy configuration contract for the ArchSpine mirror system.

## Key Responsibilities

- Defines the `FileSource` union type specifying permissible file origins for scanning: `git-tracked`, `git-tracked-plus-untracked`, and `filesystem`.
- Declares the `ScanPolicy` interface that structures the scanning configuration, including file source, ignore chain configuration, and protocol inclusion/exclusion lists.
- Provides the `PartialScanPolicy` interface for optional policy updates, enabling partial configuration overrides.

## Notable Invariants & Negative Scope

- **Invariants:** This module defines pure TypeScript types and interfaces without side effects. It serves as a stable contract for core scanning pipeline configuration and maintains isolation from CLI entry points and implementation details.
- **Out of Scope:** This module does **not** implement scanning logic or pipeline execution, handle CLI command parsing or invocation, or provide runtime validation or default values for policy fields.

## Most Important Exported / Externally Visible Behavior

The public surface consists of three exports: `FileSource`, `ScanPolicy`, and `PartialScanPolicy`. These types are the sole contract for configuring the scanning pipeline and must be used by any consumer that wishes to specify or modify scanning behavior.