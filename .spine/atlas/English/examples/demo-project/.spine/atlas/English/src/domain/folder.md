<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/atlas/English/src/domain","role":"Domain layer containing core business logic and entities for the ArchSpine mirror system.","responsibility":"Defines fundamental data structures, domain interfaces, and business rules independent of external frameworks, including user management services for identity creation and retrieval.","children":[{"filePath":"examples/demo-project/.spine/atlas/English/src/domain/folder.md","role":"Defines the core business logic and domain entities for the ArchSpine system","fileKind":"document"},{"filePath":"examples/demo-project/.spine/atlas/English/src/domain/user-service.ts.md","role":"Domain service specification for user management within the ArchSpine mirror system","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:31.307Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# Domain Layer

The `domain` directory holds the core business logic and entity definitions for the ArchSpine mirror system. It is designed to be independent of external frameworks, encapsulating the fundamental data structures and domain rules that drive user management and system identity.

## Contents

- **`folder.md`** – Defines the canonical business logic and domain entities. This document serves as the authoritative reference for entity relationships and core rules.
- **`user-service.ts.md`** – Specifies the domain service for user management, including interfaces for identity creation, retrieval, and validation. This service abstracts user operations from any infrastructure concerns.

## Implementation Focus

This layer is the foundation of the ArchSpine mirror system. Key concerns include:
- **Domain entities**: The structural backbone of the system, defining how entities like folders are modeled.
- **User identity services**: Concrete interfaces for managing user lifecycle, ensuring rules are enforced before any persistence or presentation layer operates.
- **Business rule isolation**: All logic here avoids coupling to databases, APIs, or UI frameworks, making it testable and reusable.

The two documents together cover the essential domain abstractions—entity definitions (`folder.md`) and service contracts (`user-service.ts.md`)—providing a clear separation between data and behavior.