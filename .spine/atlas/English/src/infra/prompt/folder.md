## Prompt Assembly & Orchestration Layer

This directory implements ArchSpine's core prompt assembly and orchestration layer for AI agent interactions. It provides a set of utilities and facades that enable consistent construction of structured prompts for markdown documentation and source code analysis tasks.

### Notable Submodules and Grouping

- **`builder.ts`** — `PromptBuilder` class offering a fluent interface for sequentially assembling prompt sections (identity, instructions, context, etc.) and aggregating them into a final string.
- **`shared.ts`** — Shared utility that renders the output contract section (including JSON schema, language instructions, and markdown guidance) based on the `PromptResponseMode` and target languages. Enforces English as a required base language.
- **`types.ts`** — Defines the `PromptResponseMode` type (`json-only` | `json-and-markdown`) and the `MarkdownPromptInput` interface, encoding the contract between file kinds and localization requirements.
- **`markdown.ts`** — Facade (`generateMarkdownPrompt`) that builds a localized markdown-only prompt from semantic JSON input, delegating to `PromptBuilder` and `shared.ts` utilities.
- **`source.ts`** — Facade for generating structured LLM prompts for source code analysis and validation. Offers both a standard summary variant and a validation variant (`generateSourceValidationJsonPrompt`) that performs strict architectural audits with semantic drift detection.

### Key Implementation Areas

- **Fluent prompt construction** via `PromptBuilder` with pluggable template functions for identity, instructions, and context.
- **Localization support** — generates per-language instructions and enforces required languages in the output contract.
- **Output contract enforcement** — validates response modes and produces structured JSON or JSON+markdown outputs.
- **Source code analysis pipelines** — injects environmental context (branch, git status), architectural rules, dependency context, and previous semantic contracts to guide LLM output.
- **Semantic drift detection** — compares current AST state against a previous semantic contract to flag inconsistencies during validation.