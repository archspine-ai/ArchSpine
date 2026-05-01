<!-- spine-content-hash:e24d3e25f9cef0e11b46e8684a4ea56674072b80cbc6e40fdd8477757ce66709 -->
# ArchSpine OpenAI-Compatible LLM Client

## Role
This file implements the `LLMClient` interface as an OpenAI-compatible provider client. It also embeds prompt generation orchestration for ArchSpine's semantic analysis pipeline.

## Key Responsibilities
- Initializes the OpenAI SDK client using a `ProviderConfig` that specifies API endpoint, API key, model, and timeout.
- Implements all `LLMClient` interface methods for generating semantic summaries across all `FileKind` types: source, document, config, folder, project, and markdown.
- Executes structured prompts by importing and using prompt generators (`generateConfigPrompt`, `generateDocumentPrompt`, etc.) from `../../prompt.js` and `../../lite-prompt.js`.
- Parses LLM responses into structured JSON and markdown blocks using utility functions.
- Accumulates and merges usage information across multiple LLM calls within a single summary generation.

## Notable Invariants & Negative Scope
- **Must** implement the `LLMClient` interface from `../base.js`.
- **Must** use the OpenAI SDK for all API communication.
- **Must** support all `FileKind` types for prompt generation.
- **Must** parse LLM responses into structured formats.
- **Out of scope:** Direct database or filesystem access, user authentication/authorization, network request handling beyond OpenAI API calls, caching or persistence of LLM responses.

## Most Important Exported Behavior
- **Class:** `OpenAICompatibleClient`
- **Constructor:** `constructor(config: ProviderConfig)`
- **Public methods:** `generateSource`, `generateDocument`, `generateConfig`, `generateFolder`, `generateProject`, `generateMarkdown` — each corresponding to a `FileKind` type.

## Architectural Note
This client has drifted from its original contract as a pure LLM provider. It now also orchestrates prompt generation by importing prompt generators directly, which is a broader responsibility. This violates the rule that infra modules should not absorb service/task/engine orchestration concerns. The client should ideally receive pre-built prompts or delegate prompt generation to a separate orchestration layer.