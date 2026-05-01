<!-- spine-content-hash:092bd83998d0ce3b7fedecaf90b959688096b7610870ed79eed858053b1c42bc -->
# ArchSpine – Prompt Facade Module

## Role
Infrastructure facade module providing a stable public API for prompt rendering and composition utilities.

## Key Responsibilities
- Exposes the `PromptBuilder` class for programmatic prompt assembly
- Provides aggregate prompt generation functions for different architectural scopes: config, document, folder, project
- Exports specialized prompt generators for Markdown and source code contexts
- Maintains a stable import boundary separating prompt assembly from policy and budgeting concerns

## Out of Scope (Negative Scope)
- Prompt policy or budgeting logic
- Service orchestration or task execution
- Engine runtime concerns

## Invariants
- Must not import or re-export service, task, or engine orchestration modules
- Must only expose prompt rendering and builder capabilities
- Callers should prefer this public facade over importing deep private implementation paths

## Public Surface (Exported Symbols)
- `PromptBuilder`
- `generateConfigPrompt`
- `generateDocumentPrompt`
- `generateFolderPrompt`
- `generateProjectPrompt`
- `generateMarkdownPrompt`
- `generateSourcePrompt`
- `generateSourceValidationJsonPrompt`

## Architectural Intent
This module serves as a clean infrastructure facade, isolating prompt assembly from policy and budgeting concerns. It aligns with a broader refactoring effort to establish subsystem facades and resolve layer inversions.