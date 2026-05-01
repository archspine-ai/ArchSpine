<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/src/api","role":"This directory contains the HTTP API handler for user creation operations.","responsibility":"Provides the HTTP entry point for user creation, delegating logic to UserService while directly managing database connections, which violates layered architecture principles.","children":[{"filePath":"examples/demo-project/src/api/handler.ts","role":"API Handler serving as the HTTP entry point for user creation operations.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:41.902Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# API Layer — User Creation Handler

This directory contains the HTTP API handler for user creation operations. It serves as the entry point for incoming HTTP requests related to creating new users.

## Structure

The directory contains a single source file:

- **`handler.ts`** — The API handler that provides the HTTP endpoint for user creation.

## Implementation Concerns

The handler delegates business logic to `UserService` but directly manages database connections, which violates layered architecture principles. This tight coupling between the API layer and data access layer should be refactored to improve separation of concerns and maintainability.