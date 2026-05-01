<!-- spine-content-hash:232164bc0057389311d7bc59dd991b7413c339341b6da08a2039187526f09f2b -->
# ArchSpine – Prompt Facade Module

## Role
This module serves as the **public facade** for prompt generation. It provides a stable import surface for external consumers while isolating them from internal prompt implementation details.

## Key Responsibilities
- Exposes a stable public API for prompt generation components.
- Re-exports `PromptBuilder` for constructing prompts.
- Re-exports specialized prompt generators for: config, document, folder, project, markdown, source, and source validation JSON.
- Shields external consumers from internal prompt module restructuring and evolution.

## Out of Scope
- Prompt rendering logic or implementation details.
- Any service, task, or engine orchestration concerns.
- Direct interaction with external APIs or data sources.

## Invariants
- Must only re-export from `src/infra/prompt/*` internal modules.
- Must not import or re-export service, task, or engine orchestration concerns.
- Must remain a pure re-export facade without adding new logic.

## Public Surface
- `PromptBuilder`
- `generateConfigPrompt`
- `generateDocumentPrompt`
- `generateFolderPrompt`
- `generateProjectPrompt`
- `generateMarkdownPrompt`
- `generateSourcePrompt`
- `generateSourceValidationJsonPrompt`

## Architectural Intent
Establish a stable public facade for prompt generation to decouple external consumers from internal prompt module evolution.