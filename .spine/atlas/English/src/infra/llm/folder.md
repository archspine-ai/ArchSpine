<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/llm","role":"Core LLM abstraction layer for ArchSpine's mirror system, providing provider-agnostic interfaces, configuration management, and retry logic.","responsibility":"Defines base interfaces (LLMResponse, LLMClient, etc.), implements a factory for provider instantiation, manages global LLM configuration and secrets, provides retry with exponential backoff, resolves runtime settings from multiple sources, and contains concrete provider implementations (Gemini, OpenAI, mock) for generating semantic summaries.","children":[{"filePath":"src/infra/llm/base.ts","role":"TypeScript interface definitions module for LLM client abstractions, response structures, provider configuration, and semantic context tracking within the infrastructure layer.","fileKind":"source"},{"filePath":"src/infra/llm/factory.ts","role":"Infrastructure layer facade factory for instantiating LLM provider clients based on configuration.","fileKind":"source"},{"filePath":"src/infra/llm/global.ts","role":"Infrastructure facade for global LLM configuration file I/O and credential store integration.","fileKind":"source"},{"filePath":"src/infra/llm/providers","role":"LLM provider implementations and utilities for generating semantic summaries.","fileKind":"folder"},{"filePath":"src/infra/llm/retry.ts","role":"Infrastructure utility providing configurable retry logic with exponential backoff for resilient asynchronous operations.","fileKind":"source"},{"filePath":"src/infra/llm/runtime.ts","role":"Infrastructure runtime configuration resolver and LLM provider client factory within the LLM subsystem.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-02T07:41:45.798Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine LLM Infrastructure Layer

The `src/infra/llm` directory forms the core LLM abstraction layer for ArchSpine's mirror system. It provides provider-agnostic interfaces, centralized configuration, and resilient retry logic to decouple the application from any single LLM provider.

## Key Responsibilities

- **Interface Contracts**: `base.ts` defines fundamental types such as `LLMResponse`, `LLMClient`, and provider configuration structures, establishing a common contract for all LLM interactions.
- **Provider Factory**: `factory.ts` offers a facade for instantiating concrete provider clients based on runtime configuration, enabling seamless switching between LLM backends.
- **Global Configuration**: `global.ts` manages file I/O for global LLM configuration and integrates with the credential store, centralizing secrets and settings.
- **Retry with Backoff**: `retry.ts` implements configurable exponential backoff retry logic for resilient asynchronous operations, crucial for handling transient API failures.
- **Runtime Resolution**: `runtime.ts` resolves LLM settings from multiple sources (config files, environment variables, secrets) and exposes a factory to create the appropriate provider client.

## Notable Children

The `providers/` folder contains concrete implementations for specific LLM backends:
- **Gemini provider**
- **OpenAI provider**
- **Mock provider** (for testing and local development)

These implementations generate semantic summaries and are instantiated via the factory, making ArchSpine's LLM usage modular and extensible.

## Important Implementation Areas

- **Base interfaces** (`base.ts`) – the foundation for all LLM operations.
- **Retry utility** (`retry.ts`) – ensures resilience against network or service failures.
- **Runtime configuration** (`runtime.ts`) – dynamically resolves provider settings.
- **Provider implementations** (`providers/`) – the actual API integrations that matter for production use.