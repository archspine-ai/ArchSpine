<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/src","role":"This directory aggregates the application's core layers: API, domain, and infrastructure.","responsibility":"The components in this directory collectively provide the HTTP API for user creation, define the User domain entity with in-memory storage, and supply a database connectivity stub, though the API layer directly manages database connections, violating layered architecture principles.","children":[{"filePath":"examples/demo-project/src/api","role":"This directory contains the HTTP API handler for user creation operations.","fileKind":"folder"},{"filePath":"examples/demo-project/src/domain","role":"This directory contains the domain service for the User entity.","fileKind":"folder"},{"filePath":"examples/demo-project/src/infra","role":"Infrastructure layer providing database connectivity stubs.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.747Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# src – Application Core Layers

This directory aggregates the application's core layers: API, domain, and infrastructure. The components here collectively provide the HTTP API for user creation, define the User domain entity with in-memory storage, and supply a database connectivity stub. However, the API layer directly manages database connections, violating layered architecture principles.

## Notable Children

- **api/** – Contains the HTTP API handler for user creation operations.
- **domain/** – Contains the domain service for the User entity.
- **infra/** – Infrastructure layer providing database connectivity stubs.

## Key Implementation Areas

- The API layer is the primary entry point for user creation requests.
- The domain layer encapsulates the User entity and its business logic.
- The infrastructure layer provides database connectivity stubs, though its usage from the API layer indicates a design flaw.