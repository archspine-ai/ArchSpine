# LLM Clients

This directory provides concrete implementations and utilities for interfacing with large language model (LLM) providers within the ArchSpine mirror system. It implements the LLM client interface that generates semantic summaries across different file kinds (config, document, source, folder, project, etc.).

## Notable Children

| Submodule | Description |
|-----------|-------------|
| `gemini.ts` | Concrete provider for Google's Gemini API. Uses `GoogleGenerativeAI` to send structured prompts and parse JSON/markdown responses via utility functions. |
| `openai.ts` | Provider for OpenAI-compatible APIs (including custom endpoints). Relies on the OpenAI SDK for chat completions, prompt generation, and response parsing. |
| `mock.ts` | A mock LLM client for unit and integration testing. Provides deterministic responses, simulates architectural rule violations, and tests prompt processing pipelines. |
| `utils.ts` | Infrastructure module offering shared functions: response parsing (`parseStructuredResponse`, `parseMarkdownBlocks`), supporting context assembly (`buildSupportingContext`), and usage aggregation (`mergeUsage`). |

## Implementation Areas

- **Provider-specific communication**: Each client handles API authentication, model selection, and request/response cycles tailored to its provider.
- **Prompt construction**: Prompts are built per file kind using dedicated generators (e.g., `generateSourcePrompt`, `generateConfigPrompt`).
- **Response parsing**: Structured JSON and markdown blocks are extracted from raw LLM outputs using regex and fallback logic in `utils.ts`.
- **Usage aggregation**: Token counts and usage info are merged across sequential API calls for unified reporting.
- **Test support**: The mock client enables deterministic validation of prompt handling and rule checking without external API calls.