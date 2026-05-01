<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/atlas/English/src","role":"This directory aggregates the public API, domain logic, and infrastructure layers of the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory provide a complete backend architecture: they expose external API endpoints, enforce business rules and domain entities, and implement concrete data persistence and infrastructure services to support system operations.","children":[{"filePath":"examples/demo-project/.spine/atlas/English/src/api","role":"Public API and interface layer for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/atlas/English/src/domain","role":"Domain layer containing core business logic and entities for the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/atlas/English/src/folder.md","role":"Mock Folder Summary for src in English","fileKind":"document"},{"filePath":"examples/demo-project/.spine/atlas/English/src/infra","role":"Infrastructure layer providing concrete implementations for data persistence and external system interactions.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.993Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Mirror System — `src` Directory

This directory represents the core backend architecture of the ArchSpine mirror system. It aggregates the public API, domain logic, and infrastructure layers into a cohesive structure that supports system operations.

## Notable Children

- **`api/`** — Public API and interface layer. Contains endpoint definitions and contracts for external communication.
- **`domain/`** — Core business logic and entities. Enforces business rules and defines the domain model.
- **`infra/`** — Infrastructure layer. Provides concrete implementations for data persistence and external system interactions.
- **`folder.md`** — Mock folder summary document for the `src` directory in English.

## Key Implementation Areas

The most important implementation areas are:

1. **API Layer (`api/`)** — Defines how external clients interact with the system.
2. **Domain Layer (`domain/`)** — Contains the core business rules and entities that drive system behavior.
3. **Infrastructure Layer (`infra/`)** — Implements data persistence and integration with external services.

These three layers together form a complete backend architecture that exposes external endpoints, enforces business logic, and provides concrete infrastructure support.