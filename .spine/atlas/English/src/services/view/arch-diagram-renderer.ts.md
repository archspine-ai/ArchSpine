<!-- spine-content-hash:1d7791df0810ee432819291c04933a0b0b2ef673dacd9536ba5668178aa4a7b9 -->
# ArchSpine – ArchitectureDiagramRenderer

**Role:** Pure rendering utility that transforms architectural diagram specifications into SVG markup.

**Key Responsibilities:**
- Defines visual styling (fill, stroke) for each architectural node type (frontend, backend, database, etc.).
- Orders node layers according to a predefined sequence for consistent layout.
- Converts an `ArchDiagramSpec` into a complete SVG string representation via a static `render` method.
- Calculates node positions within the SVG canvas to avoid overlaps and maintain layer separation.
- Escapes HTML entities in node labels for safe SVG text content.

**Notable Invariants & Negative Scope:**
- Pure function with no side effects; output depends solely on input spec.
- SVG generation is deterministic given the same spec.
- Node positioning algorithm ensures no overlaps within the same layer.
- **Out of scope:** Orchestrating runtime services or business logic, handling user interactions or dynamic updates, persisting diagram data or managing application state, providing interactive diagram editing capabilities.

**Most Important Exported Behavior:**
- `ArchitectureDiagramRenderer.render(spec: ArchDiagramSpec): string` – the sole public entry point that produces an SVG string from a diagram specification.