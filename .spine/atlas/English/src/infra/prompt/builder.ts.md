<!-- spine-content-hash:0b52d314a4fec087f5dee6e8bca398c3b805e7c41e8775dd4bfe41021ec1bebe -->
# PromptBuilder — Prompt Assembly Utility

## Role
The `PromptBuilder` class is a fluent builder that orchestrates the assembly of structured prompt blocks for AI agent interactions. It provides a clean, chainable interface for constructing prompts by sequentially adding sections.

## Key Responsibilities
- **Fluent Builder Interface**: Offers methods like `setIdentity(role, target)` to sequentially add prompt sections.
- **Delegated Rendering**: Relies on imported template functions (from a dedicated assets directory) to render individual blocks such as identity, instructions, and context.
- **Internal Aggregation**: Collects rendered blocks into an internal array of strings, then concatenates them into the final prompt.
- **Public API**: Exports the `PromptBuilder` class as the primary entry point for prompt construction.

## Notable Invariants
- Imports are strictly limited to template rendering functions from the `assets` directory.
- All builder methods return `this` to enable method chaining.
- Internal state is a simple array of strings, assembled in the order they are added.

## Out of Scope
- Does **not** directly render or format raw text (this is delegated to template functions).
- Does **not** manage AI model interactions or API calls.
- Does **not** orchestrate core infrastructure services or runtime tasks.

## Exported Behavior
- **Class**: `PromptBuilder`
- **Method**: `PromptBuilder.setIdentity(role: string, target: string): this` — adds an identity block to the prompt.