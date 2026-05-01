<!-- spine-content-hash:396c8e5abd2d840178756713348a22b0a81c4d29975806420f650b1aa274bb15 -->
# SpineUnit Schema – ArchSpine Mirror System

## Role
Defines the schema for a **SpineUnit**, the core metadata unit in the ArchSpine mirror system. A SpineUnit captures the identity, semantics, structure, and provenance of a source file, serving as the canonical metadata record for every tracked file.

## Key Responsibilities
- **Schema validation** for all SpineUnit JSON documents
- **Enforcing required fields** and structural constraints for file metadata
- **Defining identity fields**: `filePath`, `contentHash`, `language`, `fileKind`, `scope`
- **Defining semantic fields**: `role`, `responsibilities`, `outOfScope`, `invariants`, `changeIntent`, `publicSurface`
- **Supporting both simple string invariants** and structured invariant objects with enforceability flags

## Notable Invariants & Negative Scope
- Every SpineUnit document **must** include all required top-level properties: `schemaVersion`, `identity`, `semantic`, `skeleton`, `graph`, `provenance`
- The `identity` object **must** contain `filePath`, `contentHash`, `language`, `fileKind`, and `scope`
- The `semantic` object **must** include `role`, `responsibilities`, `outOfScope`, `invariants`, `changeIntent`, and `publicSurface`
- **No additional properties** are allowed beyond those explicitly defined in the schema (`additionalProperties: false`)
- Invariant objects **must** have an `id` (kebab-case), `description`, and `enforceable` boolean
- This schema does **not** define runtime behavior, storage backends, or file system interactions — it is purely a validation contract for metadata documents

## Most Important Exported Behavior
The schema exports a **strict validation contract** that every SpineUnit document must satisfy. It ensures that all files in the mirror system have complete identity and semantic metadata, enabling consistent indexing, change detection, and architectural analysis across the entire project.

## Stability & Risks
- Strict structural validation is critical for system stability
- Required fields guarantee complete metadata for every file
- The `invariants` field with enforceability flags provides a mechanism for defining and verifying safety limits
- The `additionalProperties: false` constraint prevents configuration drift from unexpected fields
- Reliance on shared definitions (via `$ref`) promotes consistency but creates a dependency on correct shared schema maintenance
- The `changeIntent` fields (nullable in practice) help maintain traceability of architectural decisions and change rationale, important for long-term maintainability