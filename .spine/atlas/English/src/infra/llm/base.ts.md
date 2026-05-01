<!-- spine-content-hash:299b6f8f446c06de3eb3caa266f026ce63ae84b6691b4316d9f1f6319d8e1ffb -->
# ArchSpine – LLM Interface Types Module

## Role
This module provides TypeScript interface definitions for LLM client abstractions, response structures, provider configuration, and semantic context tracking within the infrastructure layer.

## Key Responsibilities
- Defines the `UsageInfo` interface for tracking LLM token consumption metrics.
- Defines the `LLMResponse` interface for structured JSON and localized markdown outputs from LLM calls.
- Defines the `LLMClient` interface abstraction for provider-agnostic LLM interactions.
- Defines the `PreviousSemanticContext` interface for semantic drift detection across file versions.
- Defines the `ProviderConfig` interface for LLM provider configuration.

## Notable Invariants & Negative Scope
- **Invariants:** Exports only TypeScript interfaces and types; contains no runtime logic. Serves as a stable contract for LLM-related infrastructure across the codebase. Part of the infrastructure layer's public type surface.
- **Out of Scope:** Does not orchestrate LLM calls or manage runtime client instances. Does not implement concrete LLM provider integrations. Does not handle authentication or network communication for LLM services.

## Most Important Exported Behavior
The module exposes five key interfaces: `UsageInfo`, `LLMResponse`, `LLMClient`, `PreviousSemanticContext`, and `ProviderConfig`. These form the foundational type contracts for all LLM interactions within the infrastructure layer, enabling consistent response handling and semantic tracking across providers.