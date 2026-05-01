<!-- spine-content-hash:61e61e6f4906d45e25cfeb90344388b1598b2abe0d318a8cd637945d96e3a603 -->
# ArchSpine – API Request Handler (handler.ts)

## Purpose
This document describes the API request handler module (`handler.ts`), which serves as the entry point for processing incoming user creation requests. It defines the `CreateUserHandler` class that coordinates with domain services to handle request payloads, while noting a current architectural violation due to a direct dependency on the `infra/database` module.

## Context and Audience
This document is intended for developers and maintainers working on the API layer of the system. It provides a high-level overview of the handler's role as a boundary between external callers and internal logic, and highlights a known architectural issue that requires attention.

## Key Takeaways
- The handler coordinates user creation by delegating to domain services
- A direct dependency on `infra/database` is flagged as an architectural violation
- The handler serves as the primary boundary between external callers and internal system logic

## File Role
The file acts as the **API request handler and entry point** for user creation requests. It defines the `CreateUserHandler` class, which manages incoming request payloads and coordinates with domain services to process them.

## Key Responsibilities
- Coordinates user creation requests by interacting with domain services
- Defines the `CreateUserHandler` class to manage incoming request payloads
- Acts as the primary boundary between external callers and internal system logic

## Notable Invariants and Negative Scope
- **Out of scope:** Direct database operations or persistence logic; domain-specific business rules or validation
- **Invariants:** None currently defined

## Most Important Exported or Externally Visible Behavior
The `CreateUserHandler` class is the primary exported entity. It receives request payloads, delegates processing to domain services, and returns results to the caller. A known architectural drift exists: the handler currently has a direct dependency on the `infra/database` module, which violates the intended separation of concerns.