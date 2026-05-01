<!-- spine-content-hash:d67801102ffba4916d8c809eb82cc1b41133953c23ed378f45fc08e5170b38cc -->
# ArchSpine Repair Policy Module

## Role
This TypeScript module defines the repair policy decision logic for handling violations within the ArchSpine sync system. It determines which repair strategy to apply when a sync violation is detected.

## Key Responsibilities
- Defines the `RepairPolicyAction` union type, which specifies possible repair strategies: `targeted-repair`, `prompt-full-rebuild`, and `require-full-rebuild`.
- Defines the `RepairPolicyDecision` interface, which encapsulates the decision outcome including violation metrics and targeted file lists.
- Implements logic to classify violation paths and determine the appropriate repair action based on path mapping.
- Processes changed, added, and removed paths from violation reports to construct targeted repair sets.

## Notable Invariants & Negative Scope
- **Invariants:** The module exports only type definitions and pure decision logic. It relies on imported violation report types for input structure and operates on path strings to produce repair decisions without side effects.
- **Out of Scope:** This module does not perform direct file system I/O or network operations, user interface rendering or interaction, or low-level infrastructure orchestration or service management.

## Public Surface
- `RepairPolicyAction`
- `RepairPolicyDecision`