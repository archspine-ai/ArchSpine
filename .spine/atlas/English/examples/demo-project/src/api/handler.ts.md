<!-- spine-content-hash:c5a14a5505bff0d05ade8b54362dab8084656003e1b646b4103cd8b1b21ac0e6 -->
# CreateUserHandler – API Handler

## Role
This file serves as the HTTP entry point for user creation operations.

## Key Responsibilities
- Receives incoming HTTP requests for user creation.
- Delegates user creation logic to the `UserService` domain service.
- Directly manages the Database connection lifecycle (note: this violates layered architecture).

## Out of Scope
- Business logic for user validation or creation (handled by `UserService`).
- Persistence implementation details (handled by Database infrastructure).

## Notable Invariants
- Must import `UserService` from the domain layer.
- Exports a class `CreateUserHandler` as the public API.

## Public Surface
- `CreateUserHandler` class

## Architectural Intent
This handler is intended to be the HTTP entry point for user creation, delegating all domain logic to the `UserService`. No recent changes have been detected in this file.