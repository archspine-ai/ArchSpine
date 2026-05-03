The `providers/` directory houses all concrete LLM provider implementations and shared utility modules for the ArchSpine mirror system. Its primary responsibility is to generate semantic summaries for different file kinds (config, document, source, folder, project) by interfacing with external AI models.

Notable children are organized into two groups:

- **LLM client implementations**: `gemini.ts` (Google Gemini API), `openai.ts` (OpenAI-compatible API), and `mock.ts` (deterministic mock for testing). Each implements the `LLMClient` interface and handles provider-specific request/response cycles.
- **Shared utilities**: `utils.ts` provides response parsing (structured JSON and markdown blocks), prompt assembly via imported generators, and aggregation of token usage across multiple API calls.

Key implementation areas include structured summary generation per file kind, prompt formatting using the ArchSpine prompt engine, and robust parsing of model output into localized content blocks. The mock client also supports simulated architectural rule violations for testing the rule engine.