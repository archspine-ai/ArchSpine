<!-- spine-content-hash:14ea2fb427d9d05ed2c4c88281e16eaf35384bde93e7ce55df5b622d7b517fe2 -->
# GeminiClient — ArchSpine LLM Provider

## Role
Concrete implementation of the `LLMClient` interface for Google's Gemini API. This class is responsible for generating structured semantic summaries for all file kinds in ArchSpine's mirror system.

## Key Responsibilities
- Implements `LLMClient` to produce summaries for config, document, source, folder, and project file kinds.
- Formats prompts using ArchSpine's prompt engine (`generateConfigPrompt`, `generateDocumentPrompt`, etc.), selecting the appropriate template per `FileKind`.
- Sends requests to the Gemini API with configurable model, generation strategy, and timeout.
- Applies retry logic via the `withRetry` utility for robustness against transient failures.
- Parses and structures LLM responses using `parseMarkdownBlocks` and `parseStructuredResponse`.

## Notable Invariants
- Must fully adhere to the `LLMClient` interface contract for all supported file kinds.
- Must use the provided prompt utilities from `infra` to ensure consistency across providers.
- Must not absorb service or task orchestration concerns (enforced by the `infra-facade-imports` rule).

## Out of Scope
- High-level task orchestration or engine workflows (delegated to services).
- API key storage or rotation (handled by configuration).
- Custom prompt templates outside the provided prompt utilities.

## Public Surface
- `GeminiClient` class (implements `LLMClient`)

## Architectural Intent
Provide a stable, configurable LLM provider facade for Gemini API integration, isolating vendor-specific details from the core summary generation logic. Recent changes have focused on hardening client stability through retry logic and error handling improvements.