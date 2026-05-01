<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"schemas/examples","role":"This directory contains the core configuration and rule definitions for the ArchSpine semantic indexing and architecture enforcement system.","responsibility":"Collectively, these files define the project identity, module structure, documentation synchronization state, and architectural dependency rules that govern the ArchSpine system, ensuring consistent indexing, integrity verification, and layer isolation.","children":[{"filePath":"schemas/examples/spine-folder-unit.example.json","role":"Defines the core application module container for the repository indexing pipeline.","fileKind":"config"},{"filePath":"schemas/examples/spine-manifest.example.json","role":"Language index manifest for the ArchSpine documentation atlas","fileKind":"config"},{"filePath":"schemas/examples/spine-project-unit.example.json","role":"Defines the project identity, module structure, and provenance metadata for the ArchSpine semantic indexing system.","fileKind":"config"},{"filePath":"schemas/examples/spine-rule-document.example.json","role":"Architectural dependency rule enforcing layer isolation in the ArchSpine system","fileKind":"config"},{"filePath":"schemas/examples/spine-rule.example.md","role":"Architecture enforcement rule","fileKind":"document"},{"filePath":"schemas/examples/spine-unit.example.json","role":"Authentication entry module for login and logout operations.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.136Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine – `schemas/examples` Directory Summary

This directory holds the **example configuration and rule files** for the ArchSpine semantic indexing and architecture enforcement system. It serves as a reference set that demonstrates how to define project identity, module structure, documentation synchronization state, and architectural dependency rules.

## Notable Children

- **`spine-project-unit.example.json`** – Defines the project identity, module structure, and provenance metadata for the ArchSpine system.
- **`spine-folder-unit.example.json`** – Defines the core application module container for the repository indexing pipeline.
- **`spine-unit.example.json`** – An authentication entry module example for login and logout operations.
- **`spine-manifest.example.json`** – Language index manifest for the ArchSpine documentation atlas.
- **`spine-rule-document.example.json`** – Architectural dependency rule enforcing layer isolation.
- **`spine-rule.example.md`** – A markdown document describing an architecture enforcement rule.

## Implementation Areas

- **Project Identity & Module Structure** – `spine-project-unit.example.json` and `spine-folder-unit.example.json` define how the system identifies itself and organizes modules.
- **Documentation Synchronization** – `spine-manifest.example.json` tracks language index manifests for the documentation atlas.
- **Architecture Enforcement** – `spine-rule-document.example.json` and `spine-rule.example.md` define dependency rules and layer isolation policies.
- **Authentication Module** – `spine-unit.example.json` provides a concrete example of an authentication entry module.

These examples collectively illustrate how ArchSpine enforces consistent indexing, integrity verification, and layer isolation across a project.