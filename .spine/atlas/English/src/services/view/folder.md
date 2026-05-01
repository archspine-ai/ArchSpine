<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/services/view","role":"View layer for generating and rendering architectural visualizations and analysis reports.","responsibility":"Provides a unified subsystem for defining, generating, scoring, and rendering architectural views (such as architecture diagrams, risk hotspots, and public surface analysis) from indexed project metadata, with support for LLM-based specification generation and markdown report output.","children":[{"filePath":"src/services/view/arch-diagram-renderer.ts","role":"Pure rendering utility that transforms architectural diagram specifications into SVG markup.","fileKind":"source"},{"filePath":"src/services/view/architecture-diagram-view.ts","role":"ArchSpine view derivation service for generating and rendering interactive architecture diagrams from project metadata using LLM-based specification generation.","fileKind":"source"},{"filePath":"src/services/view/common.ts","role":"Pure utility module providing scoring and path suppression functions for the view layer.","fileKind":"source"},{"filePath":"src/services/view/index-loader.ts","role":"Infrastructure module that loads and caches indexed Spine units from the .spine/index directory for view layer consumption, particularly architecture diagram generation.","fileKind":"source"},{"filePath":"src/services/view/index.ts","role":"Public facade module for the view subsystem, centralizing exports for view-specific runtime and rendering components within the MCP (Model Context Protocol) resource layer.","fileKind":"source"},{"filePath":"src/services/view/public-surface-view.ts","role":"View generation scoring engine that ranks source files by their likelihood of being public API surface.","fileKind":"source"},{"filePath":"src/services/view/risk-hotspots-view.ts","role":"Pure view generator function that calculates architectural risk hotspots from indexed code units.","fileKind":"source"},{"filePath":"src/services/view/types.ts","role":"TypeScript interface defining a metadata wrapper for SpineUnit with line count, used by infrastructure components for index reading.","fileKind":"source"},{"filePath":"src/services/view/view-registry.ts","role":"Central registry and type definition module for architectural visualization views within the ArchSpine system.","fileKind":"source"},{"filePath":"src/services/view/view-renderer.ts","role":"View service module that renders architectural view artifacts (risk hotspots, CLI entries, MCP entries, module entries, public surface) into formatted markdown reports using filesystem-loaded templates.","fileKind":"source"},{"filePath":"src/services/view/view-runtime.ts","role":"Configuration resolution module for the experimental view layer and enabled views within the ArchSpine system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.695Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine View Layer (`src/services/view/`)

The view layer is the presentation subsystem of ArchSpine. It consumes indexed project metadata and produces architectural visualizations, analysis reports, and interactive diagrams. This directory contains all modules responsible for defining, generating, scoring, and rendering architectural views.

## Core Architecture

The subsystem is organized around three main responsibilities:

1. **View Definition & Registry** – `view-registry.ts` acts as the central catalog of all available architectural views (architecture diagrams, risk hotspots, public surface analysis, CLI entries, MCP entries, module entries). `view-runtime.ts` resolves configuration for which views are enabled at runtime.

2. **View Generation & Scoring** – Individual generators produce view-specific data:
   - `architecture-diagram-view.ts` uses LLM-based specification generation to create interactive architecture diagrams from project metadata.
   - `risk-hotspots-view.ts` calculates architectural risk hotspots by analyzing indexed code units for coupling, complexity, and instability.
   - `public-surface-view.ts` ranks source files by their likelihood of being public API surface, using a scoring engine.

3. **Rendering & Output** – `view-renderer.ts` transforms generated view artifacts into formatted markdown reports using filesystem-loaded templates. `arch-diagram-renderer.ts` is a pure utility that converts diagram specifications into SVG markup.

## Supporting Infrastructure

- `index-loader.ts` loads and caches indexed Spine units from `.spine/index` for consumption by view generators.
- `common.ts` provides shared scoring utilities and path suppression functions.
- `types.ts` defines metadata wrappers (e.g., `SpineUnitWithLineCount`) used across the layer.
- `index.ts` is the public facade, centralizing exports for the MCP resource layer.

## Key Implementation Areas

- **LLM Integration**: The architecture diagram view (`architecture-diagram-view.ts`) is the primary consumer of LLM-based specification generation, making it the most AI-dependent component.
- **Risk Analysis**: `risk-hotspots-view.ts` implements the core architectural risk scoring algorithm, critical for identifying problematic modules.
- **Template-Based Rendering**: `view-renderer.ts` uses filesystem templates for markdown output, enabling customizable report formatting.
- **Registry Pattern**: `view-registry.ts` implements a plugin-like architecture where views are registered and discovered dynamically.