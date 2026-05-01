# File: src/api/handler.ts

## Role
API Request Handler and Entry Point

## Responsibility
- Orchestrates user creation requests by interacting with domain services.
- Defines the `CreateUserHandler` class to manage incoming request payloads.
- **Note**: Currently contains a direct dependency on `infra/database`, which is marked as an architectural violation in comments.
- Acts as the primary boundary between external callers and internal system logic.