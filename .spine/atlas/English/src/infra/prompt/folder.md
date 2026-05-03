The `prompt` directory is the prompt assembly and generation layer of ArchSpine's AI interaction system. It provides a fluent builder, shared contracts, and specialized generators for constructing structured, localized, and validated prompts for AI agents.

### Notable Submodules

- **`builder.ts`** – Exports the `PromptBuilder` class, a fluent interface for sequentially assembling prompt sections (identity, instructions, context, etc.) into a final concatenated string.
- **`types.ts`** – Defines TypeScript types for the prompt generation protocol, including `PromptResponseMode` (JSON-only or JSON-and-markdown) and `MarkdownPromptInput`.
- **`shared.ts`** – Utility module that generates the formatted OUTPUT CONTRACT string and associated language/markdown guidance. Validates that English is always included as a required base language.
- **`markdown.ts`** – Facade for generating localized markdown-only prompts from semantic JSON input. Leverages `PromptBuilder` and shared guidance to instruct the model to return markdown blocks with exact language markers.
- **`source.ts`** – Facade for generating structured LLM prompts for source code analysis and validation. Injects environmental context, architectural rules, dependency context, and previous semantic contracts. Includes a dedicated validation variant for strict architectural audits and semantic drift detection.
- **`aggregate.ts`** – Present but with an unknown role; likely reserved for future aggregation logic.

### Key Implementation Areas

- **Prompt assembly orchestration** – `PromptBuilder` chains and renders structured blocks for identity, instructions, context, and output formatting.
- **Localization and output contract enforcement** – `shared.ts` builds language-specific instructions and enforces the required `English` base language.
- **Markdown-specific generation** – `markdown.ts` serializes semantic JSON and instructs models to respond exclusively in markdown blocks per language.
- **Source code analysis prompts** – `source.ts` provides comprehensive context for summarization or validation, with few-shot examples and schema-driven output constraints.
- **Validation and drift detection** – The validation variant of `source.ts` performs strict architectural audits and compares semantic contracts to detect drift.