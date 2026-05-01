<!-- spine-content-hash:db0ec1c2e54c8c2276fb1af7f12a266f430a8dfc7fbe96d5beba72cc5e4b022d -->
# ArchSpine View Derivation Service

## Role
ArchSpine view derivation service for generating and rendering interactive architecture diagrams from project metadata using LLM-based specification generation.

## Key Responsibilities
- Loads project and folder units from the view index via `ViewIndexLoader` to gather architectural context.
- Constructs LLM prompts using the predefined `generateArchitectureDiagramPrompt` template to request an architecture diagram specification.
- Invokes a text-generation LLM client to produce a structured `ArchDiagramSpec` JSON.
- Validates the generated specification for required fields, node types, and structural integrity using internal validation logic.
- Renders the validated specification into HTML using `ArchitectureDiagramRenderer`.
- Saves the rendered HTML and view data via `OutputManager` for persistence.

## Out of Scope
- Directly managing LLM client configuration or authentication.
- Handling low-level diagram rendering graphics or SVG generation.
- Providing user interface components for diagram interaction.

## Invariants
- Requires a text-generation LLM client for diagram specification generation.
- Depends on `ViewIndexLoader` for architectural context.
- Outputs must be saved via `OutputManager`'s `saveView` and `saveViewHtml` methods.

## Exported Surface
- `deriveArchitectureDiagramView` function