<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/atlas/English/src/domain","role":"Domain layer containing core business logic and entities for the ArchSpine mirror system.","responsibility":"Defines fundamental data structures, domain interfaces, and business rules independent of external frameworks, including user management services for identity creation and retrieval.","children":[{"filePath":"examples/demo-project/.spine/atlas/English/src/domain/folder.md","role":"Defines the core business logic and domain entities for the ArchSpine system","fileKind":"document"},{"filePath":"examples/demo-project/.spine/atlas/English/src/domain/user-service.ts.md","role":"Domain service specification for user management within the ArchSpine mirror system","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:31.307Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# Domain Layer — ArchSpine Mirror System

This directory (`src/domain`) contains the core business logic and domain entities for the ArchSpine mirror system. It defines fundamental data structures, domain interfaces, and business rules that remain independent of any external framework or infrastructure.

## Notable Children

- **`folder.md`** — Documents the core business logic and domain entities that form the foundation of the ArchSpine system.
- **`user-service.ts.md`** — Specifies the domain service for user management, including identity creation and retrieval operations.

## Key Implementation Areas

- **User Management Services** — The `user-service.ts.md` file defines how user identities are created and retrieved, forming the primary domain service for identity operations.
- **Domain Entity Definitions** — The `folder.md` file establishes the fundamental business objects and rules that govern the system's behavior.
- **Framework Independence** — All domain logic is designed to be framework-agnostic, ensuring portability and testability across different infrastructure implementations.