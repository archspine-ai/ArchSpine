<!-- spine-content-hash:896e26edc789c47b18d4f53498e1d58645225357d3fefb240591d301bcbbfa26 -->
# ArchSpine Prompt Factory

## Role
The Prompt Factory is a centralized, reusable layer for constructing structured prompt strings used in ArchSpine's semantic synthesis pipeline. It produces prompts for documents, configuration files, directories, and project units by configuring a `PromptBuilder` with target-specific identity, instructions, localization, environmental context, JSON schema, and source content.

## Key Responsibilities
- **Document prompts**: Builds prompts for document analysis using document-specific identity, instructions, localized language instructions, environmental context, JSON schema, and source content.
- **Config prompts**: Builds prompts for configuration file analysis with an operational safety focus, using config-specific identity and schema.
- **Folder prompts**: Builds prompts for directory (L2 aggregation) analysis with a simplified instruction set and folder schema.
- **Project prompts**: Builds prompts for project unit analysis using project schema and appropriate identity.
- **Shared utilities**: Uses `buildLocalizedLanguageInstructions` and `renderOutputContract` to enforce output contract and generate multilingual instructions.

## Notable Invariants
- All generated prompts enforce a JSON output contract via `renderOutputContract`.
- All prompts include localized language instructions when multiple languages are specified.
- `PromptBuilder` is always used with `setIdentity`, `addInstructions`, `addEnvironmentalContext`, `addJSONSchema`, and `addSourceContent` in a consistent pipeline.
- The module remains a pure factory, free of service/task/engine orchestration concerns.

## Negative Scope (Out of Scope)
- Does not execute or orchestrate any analysis or service logic.
- Does not handle file I/O, scanning, or runtime state.
- Does not define or validate schemas; imports them from templates.
- Does not manage prompt caching or lifecycle.

## Public Surface
- `generateDocumentPrompt`
- `generateConfigPrompt`
- `generateFolderPrompt`
- `generateProjectPrompt`

## Architectural Intent
Provide a centralized, reusable prompt generation layer for all semantic analysis targets, ensuring consistency in output format, localization, and environmental context injection. This aligns with the broader goal of modularizing the CLI and decoupling core infrastructure services by isolating prompt construction from service orchestration.