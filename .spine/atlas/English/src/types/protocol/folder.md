<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/types/protocol","role":"Defines the core data contracts and configuration schema for the ArchSpine mirror system.","responsibility":"Provides the foundational type definitions, configuration interfaces, and versioning constants that establish the data model and public API contract for the entire ArchSpine infrastructure layer, enabling consistent representation of mirrored code units, dependency graphs, language metadata, synchronization manifests, and rule documents.","children":[{"filePath":"src/types/protocol/config.ts","role":"TypeScript interface defining the central configuration schema for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/types/protocol/index-documents.ts","role":"Core TypeScript type definitions module for the ArchSpine mirror system's data model, defining all interfaces and types for the complete mirror data structure including unit, identity, semantic, skeleton, graph, provenance, folder, and project representations.","fileKind":"source"},{"filePath":"src/types/protocol/index.ts","role":"Public API facade (barrel export) for the infrastructure subsystem, aggregating and re-exporting all infra-layer modules.","fileKind":"source"},{"filePath":"src/types/protocol/languages.ts","role":"TypeScript type definition module defining the data contracts for language support metadata within the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/types/protocol/manifest.ts","role":"Core TypeScript module defining shared data transfer object (DTO) interfaces for the ArchSpine synchronization and manifest system.","fileKind":"source"},{"filePath":"src/types/protocol/rules.ts","role":"TypeScript interface defining the canonical data structure for an ArchSpine rule document within the rule engine's domain model.","fileKind":"source"},{"filePath":"src/types/protocol/versions.ts","role":"Centralized version definition module for ArchSpine schema and package versioning.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.564Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/types/protocol` — ArchSpine Core Data Contracts

This directory defines the foundational data contracts and configuration schema for the entire ArchSpine mirror system. It establishes the type-level API that every other subsystem depends on, ensuring consistent representation of mirrored code units, dependency graphs, language metadata, synchronization manifests, and rule documents.

## Notable Children

- **`config.ts`** — Central configuration schema interface for the mirror system.
- **`index-documents.ts`** — Core type definitions module covering the complete mirror data structure: unit, identity, semantic, skeleton, graph, provenance, folder, and project representations.
- **`index.ts`** — Public API barrel export that aggregates and re-exports all infra-layer modules.
- **`languages.ts`** — Data contracts for language support metadata.
- **`manifest.ts`** — Shared DTO interfaces for the synchronization and manifest system.
- **`rules.ts`** — Canonical data structure for an ArchSpine rule document.
- **`versions.ts`** — Centralized schema and package version definitions.

## Key Implementation Areas

- **Data Model Foundation** — `index-documents.ts` is the most critical file, defining the complete type hierarchy that underpins all mirror operations.
- **Configuration Schema** — `config.ts` provides the single source of truth for system configuration.
- **Synchronization Contracts** — `manifest.ts` and `versions.ts` together define how mirrors are versioned and synchronized.
- **Rule Engine Integration** — `rules.ts` bridges the type system with the rule evaluation engine.
- **Language Support** — `languages.ts` enables multi-language mirroring by defining language metadata contracts.