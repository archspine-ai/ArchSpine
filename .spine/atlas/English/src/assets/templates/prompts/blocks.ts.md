<!-- spine-content-hash:dea9b628744261e839aa9294bb8aa8d2dbee697a48d43b60d3686e189ca457fc -->
# ArchSpine – Text Block Renderer

## Role
Pure utility functions for rendering structured text blocks, primarily used in LLM prompt construction within ArchSpine.

## Key Responsibilities
- Renders an identity block string that defines the role and target for a summarization task.
- Renders an instructions block string from an array of instruction items with numbered formatting.
- Renders a context block string with a title and context data, wrapped in XML-like tags.

## Notable Invariants & Negative Scope
- Functions are pure and side-effect-free.
- Output is deterministic string concatenation and formatting.
- No external dependencies or runtime configuration.
- Does **not** parse or interpret the content of rendered blocks.
- Does **not** manage state or side effects.
- Does **not** handle file I/O or network communication.

## Public Surface (Exported Functions)
- `renderIdentityBlock`
- `renderInstructionsBlock`
- `renderContextBlock`