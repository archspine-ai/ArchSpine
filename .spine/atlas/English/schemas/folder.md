<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"schemas","role":"This directory contains the JSON schema definitions that validate all metadata units, manifests, and rule documents in the ArchSpine mirror system.","responsibility":"Collectively, these schema files define and enforce the structural integrity, data validation rules, and type constraints for every component of the ArchSpine semantic indexing and architecture enforcement system, including project units, folder units, file units, manifests, and governance rules.","children":[{"filePath":"schemas/examples","role":"This directory contains the core configuration and rule definitions for the ArchSpine semantic indexing and architecture enforcement system.","fileKind":"folder"},{"filePath":"schemas/shared.schema.json","role":"Defines reusable type definitions and validation schemas shared across the ArchSpine system.","fileKind":"config"},{"filePath":"schemas/spine-folder-unit.schema.json","role":"Defines the schema for a SpineFolderUnit, a structural node in the ArchSpine mirror system that represents a directory with a specific role and responsibility.","fileKind":"config"},{"filePath":"schemas/spine-manifest.schema.json","role":"Defines the schema for the ArchSpine SpineManifest, a metadata manifest that tracks the synchronization state and indexed file inventory of a mirror repository.","fileKind":"config"},{"filePath":"schemas/spine-project-unit.schema.json","role":"Defines the structural schema for a SpineProjectUnit, which is the fundamental project unit descriptor in the ArchSpine mirror system.","fileKind":"config"},{"filePath":"schemas/spine-rules.schema.json","role":"Defines the schema for individual SpineRule documents within the ArchSpine mirror system, specifying the structure and validation constraints for governance rules.","fileKind":"config"},{"filePath":"schemas/spine-unit.schema.json","role":"Defines the schema for a SpineUnit, the core metadata unit in the ArchSpine mirror system that captures the identity, semantics, structure, and provenance of a source file.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:57.841Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Schema Directory

This directory contains the JSON schema definitions that are the backbone of validation for the entire ArchSpine mirror system. Every metadata unit, manifest, and governance rule document must conform to these schemas to ensure structural integrity, data validation, and type constraints. The schemas enforce all aspects of the ArchSpine semantic indexing and architecture enforcement system, spanning project units, folder units, file units, manifests, and rules.

## Notable Children

The directory is organized into a set of concrete schema files, each dedicated to a specific component:

- **`shared.schema.json`** — Defines reusable types and validation patterns shared across the system, reducing duplication and enforcing consistency.
- **`spine-unit.schema.json`** — The core schema for a `SpineUnit`, the fundamental metadata unit that captures identity, semantics, structure, and provenance of a source file.
- **`spine-folder-unit.schema.json`** — Defines the `SpineFolderUnit`, a structural node representing a directory with a specific role and responsibility in the mirror hierarchy.
- **`spine-project-unit.schema.json`** — Describes the `SpineProjectUnit`, the top-level project unit descriptor that aggregates the project's metadata.
- **`spine-manifest.schema.json`** — Schema for the `SpineManifest`, which tracks synchronization state and the indexed file inventory of a mirror repository.
- **`spine-rules.schema.json`** — Schema for individual `SpineRule` documents, providing the structure and validation constraints for governance rules.
- **`examples/`** — A subdirectory holding example configuration and rule definitions demonstrating the schemas in action.

## Implementation Areas That Matter Most

The schemas in this directory are critical for:

1. **Validation**—All metadata entering the system is validated against these schemas at ingestion, ensuring data quality and preventing corruption.
2. **Interoperability**—Shared types across unit and manifest schemas enable seamless cross-referencing between files, folders, projects, and rules.
3. **Governance enforcement**—The rules schema directly supports the architecture enforcement layer by defining valid rule structures.
4. **Extensibility**—The shared schema provides a foundation that can be extended for future unit types or custom metadata without breaking existing documents.