This directory (`src/infra/llm/`) implements the **infrastructure layer for LLM client abstraction, configuration, and resilient invocation** inside the ArchSpine mirror system. It provides a unified, provider‑agnostic way to interact with multiple LLM backends while handling configuration injection, credential management, and network resilience.

The notable children are grouped into five core modules and a subdirectory of concrete providers:

- **Core interfaces** (`base.ts`) – defines the contracts for `LLMClient`, `LLMResponse`, `UsageInfo`, `ProviderConfig`, and `PreviousSemanticContext`. These abstractions allow the rest of the system to work with any provider uniformly.
- **Client factory** (`factory.ts`) – a static factory (`LLMFactory`) that instantiates the correct client implementation based on provider name (OpenAI, DeepSeek, OpenRouter, Groq, Gemini, Mock). It normalizes names and normalizes provider‑specific construction.
- **Global configuration** (`global.ts`) – handles I/O for a JSON config file stored in a platform‑appropriate global directory (`XDG_CONFIG_HOME` or `~/.config`). Also wraps the `CredentialStore` for secure API key management via `GlobalLLMSecrets`.
- **Retry logic** (`retry.ts`) – `withRetry` implements exponential backoff with jitter for transient network errors, identifying retryable errors (e.g., `ECONNRESET`, `ETIMEDOUT`). A critical resilience component.
- **Runtime resolution** (`runtime.ts`) – merges LLM settings from project config, global config, environment variables, and runtime overrides; then calls the factory to produce a ready‑to‑use client. Also validates that required settings (e.g., API key) are present for the given command.
- **Provider implementations** (`providers/` subdirectory) – contains concrete clients for **Gemini**, **OpenAI** (and its variants), and a **Mock** provider for testing. Each implements the `LLMClient` interface with prompt construction, API communication, response parsing, and usage aggregation.

The most critical implementation areas are:
- The **interface definitions** in `base.ts`, because they set the contract every provider must fulfill.
- The **runtime resolution** and **factory** modules, which together decouple provider choice from the rest of the system.
- The **retry logic**, ensuring the system can recover from transient failures without passing those errors upward.