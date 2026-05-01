# ArchSpine API Handler: Entry Point and Request Coordinator

## Purpose
This document defines the API request handler and entry point for the ArchSpine mirror system. It describes how incoming user creation requests are coordinated through domain services and establishes the boundary between external callers and internal logic.

## Who Should Read This
This document is intended for developers and system architects who need to understand the API layer's role in request handling, including its current architectural dependencies and the noted violation regarding direct infrastructure coupling.

## Key Decisions and Workflows
- The `CreateUserHandler` class manages incoming request payloads and coordinates user creation via domain services.
- A direct dependency on `infra/database` exists and is flagged as an architecture violation in comments. This is a known issue that should be addressed to maintain clean architecture boundaries.
- This file acts as the primary boundary between external callers and internal system logic, ensuring separation of concerns.

## Out of Scope
- Domain business logic implementation
- Database infrastructure details
- Authentication or authorization concerns