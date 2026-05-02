<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/types","role":"Core data contracts and configuration schema for the ArchSpine mirror system.","responsibility":"Defines the foundational type definitions, configuration interfaces, and versioning constants that establish the data model and public API contract for the entire ArchSpine infrastructure layer, enabling consistent representation of mirrored code units, dependency graphs, language metadata, synchronization manifests, and rule documents. It also provides a stable public entry point for importing all protocol types and defines view artifact contracts for architecture diagrams.","children":[{"filePath":"src/types/protocol","role":"Defines the core data contracts and configuration schema for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/types/protocol.ts","role":"Public protocol facade module providing a stable entry point for importing all ArchSpine protocol types.","fileKind":"source"},{"filePath":"src/types/view.ts","role":"Type definition module establishing the contract for view artifacts in the ArchSpine view generation system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T10:11:06.692Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
The `src/types` directory serves as the **core data contracts and configuration schema** for the ArchSpine mirror system. It establishes the foundational type definitions, configuration interfaces, and versioning constants that underpin the entire infrastructure layer.

**Notable children grouping**:
- A dedicated `src/types/protocol` subfolder houses the detailed core data contracts and configuration schema for the mirror system.
- The `src/types/protocol.ts` file acts as a stable public facade module, providing a unified entry point for importing all ArchSpine protocol types.
- The `src/types/view.ts` file defines the contract for view artifacts in the ArchSpine view generation system.

**Implementation areas that matter most**:
- Consistent representation of mirrored code units, dependency graphs, language metadata, synchronization manifests, and rule documents.
- Public API contract for the entire ArchSpine infrastructure layer.
- View artifact contracts for architecture diagrams.

**Concrete submodules**:
- `src/types/protocol` — the primary module defining all core data models (e.g., code unit types, dependency graph structures, language metadata, sync manifests, rule documents).
- `src/types/view.ts` — a standalone module that specifies the TypeScript type contract for generated view artifacts (architecture diagrams).