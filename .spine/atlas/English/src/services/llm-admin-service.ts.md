<!-- spine-content-hash:68a93a9fd747aeddd627ba43048e0a64f007748407a2a239a2eb4386097bff06 -->
# ArchSpine – LLM Configuration Type Definitions

## Role
This module provides TypeScript type definitions for LLM configuration command structures and view models within the view service layer. It defines the contracts used by CLI commands and runtime services to interact with LLM settings.

## Key Responsibilities
- Defines interfaces for LLM command targets, setup values, and status view models.
- Provides type aliases for LLM configuration and secrets store subsets to enforce type safety across the LLM configuration boundary.
- Encapsulates type definitions that facilitate communication between view services and infrastructure modules for LLM settings.

## Notable Invariants & Negative Scope
- **Pure type definitions** – contains no executable code.
- Depends on infrastructure types (`Config`, `Secrets`, `GlobalLLMConfig`) and runtime service types.
- Exclusively used by view services and CLI for LLM configuration typing.
- **Out of scope:** Orchestrating runtime LLM operations, direct interaction with LLM APIs or secret management, rendering UI components, or handling HTTP requests.

## Most Important Exported Types
- `LLMCommandTarget`
- `LLMSetupValues`
- `LLMStatusViewModel`
- `LLMScope`

These types form the public surface of the module and are the primary contracts consumed by other parts of the system.