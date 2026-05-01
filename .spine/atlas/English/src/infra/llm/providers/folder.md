<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/llm/providers","role":"LLM provider implementations and utilities for generating semantic summaries.","responsibility":"Provides concrete LLM client implementations (Gemini, OpenAI, mock) and supporting utilities for assembling prompts, parsing structured responses, and merging usage data, enabling the ArchSpine mirror system to generate semantic summaries for various file kinds.","children":[{"filePath":"src/infra/llm/providers/gemini.ts","role":"Concrete LLM provider implementation for Google's Gemini API, handling structured summary generation for ArchSpine's mirror system.","fileKind":"source"},{"filePath":"src/infra/llm/providers/mock.ts","role":"Test infrastructure mock LLM client simulating LLM provider responses for unit and integration testing.","fileKind":"source"},{"filePath":"src/infra/llm/providers/openai.ts","role":"OpenAI-compatible LLM provider client implementing the LLMClient interface, with embedded prompt generation orchestration for ArchSpine's semantic analysis pipeline.","fileKind":"source"},{"filePath":"src/infra/llm/providers/utils.ts","role":"Infrastructure utility module providing content assembly, structured response parsing, and usage merging for the ArchSpine mirror system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:39.744Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/llm/providers` — LLM Provider Implementations

This directory contains the concrete LLM client implementations and supporting utilities that power ArchSpine's semantic summary generation. It is the execution layer of the mirror system's AI pipeline, translating abstract summarization requests into real API calls and parsing the results into structured data.

## Notable Children

- **`gemini.ts`** — Implements the `LLMClient` interface for Google's Gemini API. Handles structured summary generation for all file kinds tracked by ArchSpine.
- **`openai.ts`** — OpenAI-compatible client that also embeds prompt generation orchestration directly, making it a self-contained provider for the semantic analysis pipeline.
- **`mock.ts`** — A test double that simulates LLM responses, used in unit and integration tests to avoid external API dependencies.
- **`utils.ts`** — Shared infrastructure for assembling content prompts, parsing structured JSON responses from LLMs, and merging usage metadata across multiple calls.

## Key Implementation Areas

- **Provider abstraction**: Each client implements a common `LLMClient` interface, allowing the system to swap providers without changing higher-level orchestration.
- **Prompt assembly**: Utilities in `utils.ts` build context-aware prompts that include file metadata, AST summaries, and previous analysis results.
- **Response parsing**: Structured output (e.g., JSON schemas) is extracted and validated from free-form LLM responses, ensuring downstream consumers receive consistent data.
- **Usage tracking**: Token counts and cost estimates are merged across multiple LLM calls per file, enabling accurate billing and quota management.