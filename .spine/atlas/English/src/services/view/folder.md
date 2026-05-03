## ArchSpine View Generation & Rendering Subsystem

This directory contains the core view generation and rendering subsystem for ArchSpine's architectural visualization and analysis views. It is responsible for producing, validating, persisting, and rendering multiple architectural view types—such as architecture diagrams, risk hotspots, and public surface maps—using LLM-based specifications, scoring algorithms, and Markdown templates. The subsystem also manages the view registry and runtime configuration.

### Notable children and how they are grouped

- **Rendering & Diagram Generation**  
  - `arch-diagram-renderer.ts` – Pure utility that converts `ArchDiagramSpec` into SVG markup. It defines visual styling per node type (frontend, backend, database, etc.), orders layers, calculates positions, and escapes HTML entities for safe SVG text.  
  - `architecture-diagram-view.ts` – Orchestrates generation, validation, and persistence of architecture diagrams. It loads project/folder units via `ViewIndexLoader`, constructs an LLM prompt, parses the LLM response into a validated `ArchDiagramSpec`, renders it to HTML using `ArchitectureDiagramRenderer`, and persists both the HTML and the raw spec.

- **Scoring & Analysis**  
  - `public-surface-view.ts` – A scoring engine that ranks source files by likelihood of being public API surface. It applies a multi-factor algorithm (semantic declarations, export counts, internal consumers, re-export amplification) and applies bonuses/penalties for specific surface kinds and type-only files.  
  - `risk-hotspots-view.ts` – Generator for risk hotspot computation. It calculates a composite risk score per indexed unit based on fan-in, fan-out, cross-boundary edges, public surface exposure, semantic drift, rule violations, file size, and adjacent tests. The top 12 hotspots are selected and returned in a ranked `ViewArtifactEnvelope`.  
  - `common.ts` – Pure utility module that provides scoring helpers (summation, confidence calculation), path suppression (regex for test, fixture, docs etc.), boundary extraction, and cross-boundary edge counting.

- **Index & Data Loading**  
  - `index-loader.ts` – Loads and caches `SpineFolderUnit` and `SpineProjectUnit` JSON files from the `.spine/index` directory. It validates each against `SpineUnit` schemas, warns about malformed files, and limits folder count for diagram clarity.

- **Registry & Configuration**  
  - `view-registry.ts` – Central registry defining `ViewDefinition` metadata (ID, title, description, enabled status, requirements, outputs). Provides `VIEW_DEFINITIONS` array, `VIEW_DEFINITION_MAP`, type guard `isViewId()`, and helpers `getViewDefinition()`, `getDefaultEnabledViewIds()`, `normalizeViewIds()`.  
  - `view-runtime.ts` – Resolves configuration for the experimental view layer and enabled views from project config, environment variables, or defaults. Normalizes and filters unknown view IDs.

- **Markdown Rendering & Export**  
  - `view-renderer.ts` – Renders view artifacts (risk hotspots, CLI entries, MCP entries, module entries, public surface) into formatted Markdown reports using filesystem-loaded templates. It handles severity scoring, detail formatting, Markdown escaping, and confidence display.

- **Public Facade**  
  - `index.ts` – Aggregates and re-exports all public modules to provide a stable import interface for MCP clients and external consumers.

### Implementation areas that matter most

- **LLM-driven specification generation** for architectural diagrams, with strict validation and fallback handling.  
- **Multi-factor scoring engines** for public surface detection and risk hotspot ranking, tuned with configurable thresholds and bonuses.  
- **View registry and configuration resolution** to control which views are active and how they are enabled by default.  
- **Markdown rendering pipeline** that loads templates on demand and escapes content to ensure safe output.  
- **Layer isolation** between pure utilities (scoring, rendering) and orchestration (view generators, index loader) to keep the system testable and modular.