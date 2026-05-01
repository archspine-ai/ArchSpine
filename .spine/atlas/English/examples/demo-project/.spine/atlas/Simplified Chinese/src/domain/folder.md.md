<!-- spine-content-hash:0c022a933f3bb7254f9b2ec2ddac41a06f1b7d07a8df54ab72610f4740916031 -->
# Domain Layer Documentation

## Purpose
This document defines the role and responsibilities of the `src/domain` folder within the project. It establishes that this folder is the exclusive home for core business logic and domain entities, which must remain decoupled from external frameworks and infrastructure concerns.

## Context and Audience
This document is intended for all developers contributing to the project. It serves as a governance boundary, clarifying what code belongs in the domain layer and what must be kept out. It is particularly important for new team members or when making architectural decisions about where to place business logic.

## Key Responsibilities
- Housing business logic that is independent of external frameworks or infrastructure.
- Defining foundational data structures and interfaces used across the application.
- Ensuring domain invariants are maintained regardless of the data access strategy.

## Out of Scope
- Infrastructure or framework-specific code (e.g., database access, web controllers).
- Application-level orchestration or service wiring.

## Key Takeaways
- The `src/domain` folder is for pure business logic only.
- Domain entities and interfaces defined here must be framework-agnostic.
- Domain invariants must be enforced within this layer, independent of data access patterns.