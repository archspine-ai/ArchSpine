<!-- spine-content-hash:064d4eda44eb8563be07bd89326f4616c2fae95cbd8759b087fcca6876e8bd06 -->
# ArchSpine – `buildMarkdownOnlyPrompt` Utility

## Role
This is an infrastructure utility responsible for constructing localized, markdown-only prompt strings from semantic JSON input. It serves as a reusable building block for documentation generation within the ArchSpine system.

## Key Responsibilities
- Assembles a complete prompt string using the `PromptBuilder` facade, specifically for documentation generation tasks.
- Integrates localized language instructions and markdown section guidance from shared utility modules.
- Formats the provided semantic JSON and any supporting context into prompt context blocks.
- Ensures the final output adheres to the required language-specific markdown block markers (e.g., `---MARKDOWN:English---`).

## Notable Invariants & Negative Scope
- **Must** import the `PromptBuilder` facade for prompt construction; no other prompt-building mechanism should be used.
- **Must not** contain any business logic or domain-specific processing. This utility is purely structural and formatting-oriented.
- **Must** output a string that is formatted with the correct markdown block markers.
- **Out of scope**: Orchestrating service or engine execution, managing authentication or user sessions, performing data persistence or queries, and rendering UI components.

## Most Important Exported Behavior
The primary public surface is the function **`buildMarkdownOnlyPrompt`**. This function takes semantic JSON input and returns a properly formatted, localized markdown string. It is the sole entry point for generating documentation prompts from structured data.