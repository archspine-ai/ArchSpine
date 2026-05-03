# ArchSpine SpineUnit Configuration Summary

This schema defines the structure and constraints for a SpineUnit, the core metadata unit in the ArchSpine mirror system. Each SpineUnit captures the identity, semantic role, invariants, change intent, and public surface of a code entity.

## What This Configuration Controls

- **Code Unit Identity Tracking:** Enforces required fields such as `filePath`, `contentHash`, `language`, `fileKind`, and `scope` to uniquely identify and trace source files.
- **Semantic Metadata Management:** Requires a `role`, list of `responsibilities`, explicit `outOfScope` boundaries, `invariants`, `changeIntent`, and `publicSurface` to document the unit's purpose and contract.
- **Invariant Enforcement:** All invariant entries must have an `id`, `description`, and `enforceable` flag, enabling automated rule validation.
- **Change Intent Documentation:** Captures architectural intent and reason for recent changes for auditability.
- **Public API Surface Documentation:** Explicit symbols and descriptions for interface stability monitoring.

## Key Parameters to Understand

| Parameter | Importance |
|-----------|------------|
| `schemaVersion` | Ensures compatibility by locking the schema version used for validation. |
| `identity.filePath` | Absolute repo-relative path for tracing; mandatory. |
| `identity.contentHash` | Cryptographic hash for integrity and change detection. |
| `identity.skeletonHash` | Hash of structural signature for change detection. |
| `identity.semanticHash` | Hash of semantic metadata to detect semantic drift. |
| `identity.language` | Programming language for language-specific analysis. |
| `identity.fileKind` | Categorizes file (source, test, config) for filtering. |
| `identity.scope` | Namespace/module scope for resolving naming conflicts. |
| `semantic.role` | High-level functional description for architectural reasoning. |
| `semantic.responsibilities` | List of responsibilities for dependency analysis. |
| `semantic.outOfScope` | Explicitly states what the unit does NOT do, preventing scope creep. |
| `semantic.invariants` | Enforceable constraints critical for safety and correctness. |
| `semantic.changeIntent` | Documents architectural intent and change reasons. |
| `semantic.publicSurface` | Explicit API surface for interface contracts and stability monitoring. |

## Operational Risks and Stability Considerations

- **Validation Failures for Legacy Files:** All SpineUnits must include the required top-level fields and identity fields. Legacy files lacking these will fail validation until upgraded.
- **Hash Coupling:** Changes to hashing logic for `contentHash`, `skeletonHash`, or `semanticHash` require coordinated migration across the system.
- **Over-Constraining Invariants:** Invariants can be overly strict and reject valid edge cases. Carefully review invariant descriptions and enforceability.
- **No Additional Properties:** The schema forbids extra properties at the top level and in nested objects, preventing silent additions that could break downstream tools.
- **Structural Integrity:** Strict adherence to this schema stabilises the metadata layer and prevents architectural rot.

This schema enforces structural integrity across all SpineUnits. By requiring mandatory fields and forbidding extra properties, it prevents silent additions that could break downstream tools. The invariant system allows automated enforcement of business rules (e.g., "every public function must have a doc comment"). Overall, strict adherence to this schema stabilises the metadata layer and prevents architectural rot.