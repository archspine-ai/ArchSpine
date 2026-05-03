This directory contains the **view subsystem** of ArchSpine, which is responsible for generating, rendering, and managing architectural visualization views. It implements the complete pipeline from loading indexed code units to producing final rendered outputs in HTML or Markdown.

### Key Groups & Responsibilities

- **View Generation & Validation**  
  `architecture-diagram-view.ts` orchestrates LLM-based specification generation for architecture diagrams. It loads project and folder units, constructs prompts, invokes an LLM client, and validates the result into an `ArchDiagramSpec`. `risk-hotspots-view.ts` computes composite risk scores from indexed units using fan-in, fan-out, cross-boundary edges, and other factors, then ranks the top 12 hotspots. `public-surface-view.ts` ranks source files by public API surface likelihood using multi-factor scoring.

- **Rendering**  
  `arch-diagram-renderer.ts` is a pure SVG rendering utility that transforms architectural diagram specifications into SVG markup with styled nodes and layer ordering. `view-renderer.ts` renders multiple view artifact types (risk hotspots, CLI entries, MCP entries, public surface) into formatted Markdown reports using filesystem-loaded templates.

- **Registration & Configuration**  
  `view-registry.ts` defines the `ViewDefinition` interface and the canonical `VIEW_DEFINITIONS` array, providing O(1) lookups by ID and default enabled views. `view-runtime.ts` resolves the experimental view layer flag and the list of enabled view IDs from project config or environment variables.

- **Data Loading & Utility**  
  `index-loader.ts` loads and caches indexed `SpineUnit` JSON files from `.spine/index`, validating them and limiting folder count for diagram clarity. `common.ts` provides scoring helpers (confidence calculation, path suppression detection) and cross-boundary analysis functions.

### Most Important Implementation Areas

- **LLM-driven diagram generation** with structured output validation in `architecture-diagram-view.ts`.
- **SVG rendering pipeline** in `arch-diagram-renderer.ts` with node type styling and layout ordering.
- **Scoring engines** for risk hotspots (`risk-hotspots-view.ts`) and public surface (`public-surface-view.ts`), both leveraging multi-factor algorithms and path filtering.
- **Centralized view registry** (`view-registry.ts`) that defines all supported views and their metadata.
- **Markdown template rendering** (`view-renderer.ts`) for producing human-readable reports.

The subsystem is designed to be modular: each view generator is self-contained, and the registry decouples view definitions from their runtime activation. The `index.ts` facade centralizes exports for MCP resource consumers.