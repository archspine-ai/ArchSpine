<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/atlas/Simplified Chinese/src/domain","role":"Core domain layer containing business logic and entity definitions.","responsibility":"Houses domain logic and core entity definitions independent of external frameworks, defines foundational data structures and interfaces, and implements domain services for user management including user creation, identity retrieval, and in-memory persistence.","children":[{"filePath":"examples/demo-project/.spine/atlas/Simplified Chinese/src/domain/folder.md","role":"Domain logic and core entity definitions","fileKind":"document"},{"filePath":"examples/demo-project/.spine/atlas/Simplified Chinese/src/domain/user-service.ts.md","role":"Domain service specification for user management","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:31.288Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# Domain Layer — Core Business Logic

This directory (`src/domain`) is the heart of the application's business logic. It contains entity definitions and domain services that are completely independent of any external framework or infrastructure concern.

## Structure

The domain layer is organized into two key files:

- **`folder.md`** — Defines the core domain entities and business logic. This is where foundational data structures and interfaces live.
- **`user-service.ts.md`** — Specifies the domain service for user management. This includes operations such as user creation, identity retrieval, and in-memory persistence.

## Key Implementation Areas

The most critical implementation areas in this layer are:

1. **User Management Domain Service** — The `user-service.ts.md` file defines the contract for managing users. This service handles user creation, identity lookup, and persistence logic without coupling to any specific database or framework.
2. **Core Entity Definitions** — The `folder.md` file establishes the foundational types and interfaces that other layers depend on.

This layer follows clean architecture principles by keeping business rules isolated from external concerns, making the domain logic testable and framework-agnostic.