<!-- spine-content-hash:0820fe2c4cd4a6f9a3b32ade24424451b0d5a7f686acb9fa029fe882f006a609 -->
# LLMFactory — Infrastructure Facade for LLM Client Instantiation

## Role
Infrastructure layer facade factory for instantiating LLM provider clients based on configuration.

## Key Responsibilities
- Provides a static factory method to create LLM client instances for supported providers (OpenAI, DeepSeek, OpenRouter, Groq, Gemini, Mock).
- Encapsulates provider-specific client instantiation logic behind a unified interface.
- Handles provider name normalization (case-insensitive matching) to select appropriate client implementation.
- Throws descriptive errors for unsupported provider names.

## Notable Invariants & Negative Scope
- Must expose a stable factory interface for LLM client creation.
- Must not absorb service/task/engine orchestration concerns (pure instantiation).
- Does **not** orchestrate LLM calls or manage conversation state.
- Does **not** implement provider-specific client logic (delegated to provider modules).
- Does **not** manage configuration loading or validation beyond instantiation parameters.

## Most Important Exported / Externally Visible Behavior
- `LLMFactory` — the factory class.
- `LLMFactory.createClient` — the static method that accepts a provider name and configuration, returning a ready-to-use LLM client instance.