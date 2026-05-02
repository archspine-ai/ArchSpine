<!-- spine-content-hash:92e8d378bb0d2ed1663f84a423962d192b7822771ca56f60cae220ffb012056d -->
# OpenAICompatibleClient

This file implements the `LLMClient` interface as an OpenAI-compatible provider. Its primary role is to initialize the OpenAI SDK client with configurable parameters (endpoint, model, API key, timeout from ProviderConfig) and generate semantic summaries for each FileKind (source, document, config, folder, project, markdown). However, it violates the **Infra Facade** design rule by absorbing orchestration logic (prompt generation, response parsing, strategy orchestration) that should reside in a dedicated orchestration layer.

**Key Responsibilities:**
- Initialize the OpenAI client from `ProviderConfig`.
- Generate structured prompts for each file type using imported generators (`generateSourcePrompt`, `generateConfigPrompt`, etc.).
- Call the chat completions API and parse responses into structured JSON and markdown blocks via utility functions.
- Merge token usage across sequential calls for aggregated reporting.
- Build supporting context using the imported `buildSupportingContext` utility.

**Notable Invariants & Negative Scope:**
- LLM provider clients should be thin transport facades exposing only a single `generate(prompt)` method. This file imports prompt generation and response parsing utilities, which belong in an orchestration layer.
- FileKind-specific content preparation (mapping file types to prompts) and strategy orchestration are out of scope for this module.
- Public infra facades should be preferred over direct imports from deep private implementation paths.

**Drift Detected:** Yes. The file header explicitly states it has drifted beyond a pure LLM client interface by absorbing orchestration concerns. Semantic analysis confirms this pattern.

**Public Surface:**
- `class OpenAICompatibleClient implements LLMClient`

**Rule Violations:**
- `infra-facade-imports` (warning): Imports from orchestration domain, violating the rule that infra modules must not absorb orchestration concerns.

**Architectural Intent:** The intended architecture is a clean layered design where providers are transport facades, with prompt generation and response parsing extracted into a shared orchestration layer. This file currently violates that intent.