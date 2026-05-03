The `src/infra/llm` directory forms the infrastructure layer for large language model (LLM) client abstraction, configuration, and execution within the ArchSpine mirror system. Its primary responsibility is to provide a unified interface for interacting with multiple LLM providers, enabling the generation of semantic summaries for different file types with consistent error handling and configuration merging.

The directory is logically grouped into several key areas:

- **Interface definitions** (`base.ts`): Defines core TypeScript interfaces including `LLMClient` (provider-agnostic abstraction), `LLMResponse` (structured JSON and localized markdown outputs), `UsageInfo` (token consumption), `ProviderConfig` (per-provider settings), and `PreviousSemanticContext` (for semantic drift detection). These serve as the contract for all LLM interactions.

- **Global configuration and secrets** (`global.ts`): Manages a global JSON config file (`GlobalLLMConfig`) stored at `XDG_CONFIG_HOME` or `~/.config`, handling reading, writing, and pruning. It also wraps a `CredentialStore` (`GlobalLLMSecrets`) for secure API key management, and exports `getGlobalArchSpineDir` for resolving the configuration directory location.

- **Retry logic** (`retry.ts`): Implements a configurable `withRetry` function that wraps async operations with exponential backoff and jitter, retrying only on transient errors identified by `isRetryableError` (e.g., network resets, timeouts, socket errors).

- **Factory pattern** (`factory.ts`): Provides a static factory (`LLMFactory`) to instantiate LLM client instances for supported providers (OpenAI, DeepSeek, OpenRouter, Groq, Gemini, and a Mock client for testing). It normalizes provider names (case-insensitive) and throws descriptive errors for unsupported providers.

- **Runtime resolution** (`runtime.ts`): Resolves LLM settings (provider, model, base URL, API key) by merging project configuration, global configuration, environment variables, and runtime overrides with defined precedence. It also parses and validates LLM mode, prompt policy tier, and validate policy, then creates the provider client via `LLMFactory`.

- **Concrete provider implementations** (`providers/`): Contains actual LLM client implementations for Gemini, OpenAI, and a mock test client, along with shared utilities for parsing structured responses, assembling prompts, and aggregating usage information. This subdirectory is where provider-specific logic lives, allowing the rest of the infrastructure to remain provider-agnostic.

The most important implementation areas are the unified `LLMClient` interface (ensuring consistency across providers), the configuration merging logic in `runtime.ts` (determining which settings take precedence), and the retry mechanism (providing resilience against transient failures). The factory and concrete providers together ensure that adding a new LLM provider requires only a new client implementation and a factory case.