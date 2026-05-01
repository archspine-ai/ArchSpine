<!-- spine-content-hash:9fc9e62f2bb06e6eef36c15c574e63322c2c430944469eb8473c62749033ece1 -->
# ArchSpine – Infrastructure Type Definitions

## Role
This module provides **stable data contracts** for the indexing, audit, and status reporting domains. It defines the core TypeScript interfaces that serve as the shared language between data producers (indexers, auditors) and consumers (CLI, services).

## Key Responsibilities
- Define `FileRecord`, `FileStatusRecord`, `FileCommitRecord`, and `DriftEvent` – the core data structures for file metadata, status tracking, commit associations, and audit events.
- Define `UsageSummaryRow` and `UsageTotals` for system usage analytics.
- Define `ViolationRecord` for rule violation tracking.
- Define `GlobalStatus` – an aggregate snapshot of overall system health.
- Expose these types as a **stable, versioned contract** to decouple system components.

## Out of Scope
- No runtime logic, data validation, or business rules.
- No service orchestration, task execution, or engine implementation.
- No direct database access or persistence operations.

## Invariants
- Exports **only** TypeScript interfaces and type definitions.
- Must remain a **pure type contract** – no executable code or side effects.
- Changes to these types should be coordinated across all consumers to maintain compatibility.

## Public Surface (Exported Types)
- `FileRecord`
- `FileStatusRecord`
- `FileCommitRecord`
- `DriftEvent`
- `UsageSummaryRow`
- `UsageTotals`
- `ViolationRecord`
- `GlobalStatus`

## Change Intent
This module is designed to **decouple system components** by centralizing data shape definitions. Recent commits have focused on CLI modularization and infra service decoupling; no changes have been made to this type definitions module itself.