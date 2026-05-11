# View Producers

View producers generate derived artifacts (views) from the semantic index and knowledge graph. Each producer implements the `ViewProducer` interface and emits one or more output files into `.spine/view/`.

Source provenance:

- `src/services/view/producer.ts` -- `ViewProducer`, `ViewContext`, `ViewOutputManager`, `ViewArtifact`
- `src/services/view/view-registry.ts` -- `ViewDefinition`, `VIEW_DEFINITIONS`
- `src/services/view/producer-registry.ts` -- producer registration
- `src/types/view.ts` -- `ViewId`, `ViewType`, type definitions for all views
- `src/services/view/public-surface-view.ts` -- public-surface producer
- `src/services/view/risk-hotspots-view.ts` -- risk-hotspots producer
- `src/services/view/architecture-diagram-view.ts` -- architecture-diagram producer
- `src/services/view/arch-diagram-svg-renderer.ts` -- SVG layout and renderer
- `src/services/view/project-health-view.ts` -- project-health producer
- `src/services/view/agent-briefing-view.ts` -- agent-briefing producer
- `src/services/view/common.ts` -- shared scoring helpers

## ViewProducer Interface

```typescript
interface ViewProducer {
  derive(ctx: ViewContext): Promise<ViewArtifact>;
}
```

## ViewContext

```typescript
interface ViewContext {
  rootDir: string; // Repository root absolute path
  loader: ViewIndexLoader; // Loads SpineUnit from .spine/index/**
  outputManager: ViewOutputManager; // Persists view artifacts
  runtimeIO?: RuntimeIO; // Logging/IO abstraction
  llmClient?: LLMClient; // Always undefined in current implementation
  isFullSync: boolean; // Whether the current sync is a full sync
}
```

## ViewOutputManager

```typescript
interface ViewOutputManager {
  saveView(fileName: string, data: unknown): void;
  saveViewMarkdown(fileName: string, content: string): void;
  saveViewHtml(fileName: string, html: string): void;
  deleteViewArtifacts(fileNames: string[]): void;
}
```

## ViewArtifact (return envelope)

```typescript
interface ViewArtifact {
  viewType: ViewType;
  generated: boolean;
  generatedAt: string;
  reason?: string;
  metrics: Record<string, number>;
}
```

## ViewDefinition

```typescript
interface ViewDefinition {
  id: ViewId;
  title: string;
  description: string;
  defaultEnabled: boolean;
  requiresFullSync: boolean;
  requiresLlm: boolean;
  outputs: string[];
}
```

## ViewId Type

```typescript
type ViewId =
  | 'public-surface'
  | 'risk-hotspots'
  | 'architecture-diagram'
  | 'project-health'
  | 'agent-briefing'
  | 'change-impact'
  | 'module-contract'
  | 'code-wiki';
```

## ViewLifecycle

Views are enabled/disabled via `config.json`:

```json
{
  "artifacts": {
    "enabledViews": ["public-surface", "risk-hotspots", "..."]
  }
}
```

The `enabledViews` array is validated through `normalizeViewIds()` (`src/services/view/view-registry.ts`), which splits values into `known` (valid `ViewId` strings) and `unknown` (unrecognized strings). Duplicates are deduplicated.

During `spine sync`:

1. The sync pipeline iterates over enabled `ViewId` values.
2. For each enabled view, if the view definition's `requiresFullSync` is `true` but the current sync is incremental, the producer returns early with `generated: false`.
3. The producer's `derive()` method is called with a complete `ViewContext`.
4. The producer loads data from the semantic index and/or knowledge graph, performs its logic, and saves output files via `outputManager`.
5. The returned `ViewArtifact` records metrics and generation status.
6. Views not enabled are skipped entirely.

## Producer Registration

Producers register themselves at module-load time in `src/services/view/producer-registry.ts`:

```typescript
const registry = new Map<ViewType, ViewProducer>();

registerViewProducer('risk-hotspots', riskHotspotsProducer);
registerViewProducer('architecture-diagram', architectureDiagramProducer);
registerViewProducer('project-health', projectHealthProducer);
registerViewProducer('agent-briefing', agentBriefingProducer);
registerViewProducer('change-impact', changeImpactProducer);
registerViewProducer('module-contract', moduleContractProducer);
registerViewProducer('code-wiki', codeWikiProducer);
```

Seven producers are registered. Note: `public-surface` is **not** registered in the producer registry. It is handled directly by `ViewService`.

Query functions:

- `getViewProducer(viewType: ViewType): ViewProducer | undefined`
- `listViewTypes(): ViewType[]`

---

## Public Surface View

**ViewId**: `public-surface`
**File**: `src/services/view/public-surface-view.ts`

### Definition

| Field              | Value                                               |
| ------------------ | --------------------------------------------------- |
| Title              | Public Surface                                      |
| Description        | Fast repo entry surface map for readers and agents. |
| Default enabled    | Yes                                                 |
| Requires full sync | No                                                  |
| Requires LLM       | No                                                  |
| Outputs            | `public-surface.json`, `public-surface.md`          |

### Inputs

- All `SpineUnit` entries from `.spine/index/**` (via `ViewIndexLoader.getIndexedUnits()`).

### Scoring Algorithm

Each file is scored against 9 factors. Minimum total score is 20; maximum output items is 24. Suppressed paths match `/(^|\/)(tests?|__tests__|fixtures?|examples?|docs|dist|build)\//`.

| Factor                    | Score                 | Condition                                                                                          |
| ------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `semantic-public-surface` | `min(32, 12 + N * 5)` | `N` = number of semantically exposed symbols (`semantic.publicSurface.length`)                     |
| `explicit-cli-entry`      | 26                    | Path matches CLI patterns (in `/cli/`, starts with `src/cli/`, or matches `src/cli/commands/*.ts`) |
| `explicit-mcp-entry`      | 24                    | Path in `/mcp/` or ends with `/mcp/tools.ts` or `/mcp/server.ts`                                   |
| `explicit-config-surface` | 20                    | File is classified as `config` or `schema` kind                                                    |
| `request-entry-surface`   | 18                    | Path classified as `route` kind                                                                    |
| `exported-symbols`        | `min(12, N * 2)`      | `N` = `skeleton.exports.length`                                                                    |
| `internal-consumers`      | `min(14, N * 3)`      | `N` = `graph.dependedBy.length`                                                                    |
| `reexport-amplification`  | `min(12, N * 4)`      | `N` = number of files re-exporting this file                                                       |
| `barrel-shape`            | 6                     | `skeleton.structuralHints.isBarrel` is true                                                        |
| `type-only-penalty`       | -8                    | `skeleton.structuralHints.isTypeOnly` is true                                                      |

Confidence formula: `toConfidence(totalScore, supportCount)` = `max(0, min(0.99, 0.35 + totalScore / 200 + supportCount * 0.02))`

### Kind Classification

Files are classified into one of six `PublicSurfaceKind` values via `classifyPublicSurfaceKind()` (priority order):

| Kind            | Condition                                                                         |
| --------------- | --------------------------------------------------------------------------------- | ------ | ------ | ------- | ------------- |
| `schema`        | `fileKind === 'config'` AND path starts with `schemas/`                           |
| `mcp`           | Path contains `/mcp/` or ends with `/mcp/tools.ts` or `/mcp/server.ts`            |
| `cli`           | Path contains `/cli/`, starts with `src/cli/`, or matches `src/cli/commands/*.ts` |
| `route`         | Path matches `/(route                                                             | routes | router | handler | controller)/` |
| `config`        | `fileKind === 'config'` or basename matches `config.` or `settings.`              |
| `schema`        | Path starts with `schemas/` or matches `.schema.`                                 |
| `public-module` | Has exports or public surface symbols (fallback)                                  |

### Output Item Schema

```typescript
interface PublicSurfaceViewItem {
  id: string; // "entry-1", "entry-2", ...
  entrypoint: string; // Source file path
  kind: PublicSurfaceKind; // Classification
  symbols: string[]; // Up to 8 surface symbol names
  summary: string; // Human-readable summary
  confidence: number; // 0.00-0.99
  scoreBreakdown: ViewScoreContribution[]; // Per-factor detail
}
```

Envelope: `ViewArtifactEnvelope<PublicSurfaceViewItem>` (`schemaVersion`, `generatedAt`, `viewType`, `summary`, `items`).

### Markdown Output

Rendered via `ViewRenderer.renderPublicSurface()` using templates from `src/assets/templates/view/public-surface.md`. Groups items by kind: CLI entries, MCP entries, exported modules.

---

## Risk Hotspots View

**ViewId**: `risk-hotspots`
**File**: `src/services/view/risk-hotspots-view.ts`

### Definition

| Field              | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Title              | Risk Hotspots                                               |
| Description        | Structurally risky files with transparent score breakdowns. |
| Default enabled    | Yes                                                         |
| Requires full sync | No                                                          |
| Requires LLM       | No                                                          |
| Outputs            | `risk-hotspots.json`, `risk-hotspots.md`                    |

### Inputs

- All `SpineUnit` entries with line counts (via `ViewIndexLoader.getIndexedUnits()`).
- File presence set (for adjacent test detection).

### Scoring Algorithm

Minimum total score: 20. Maximum output items: 12. Suppressed paths: same as public-surface (`tests`, `fixtures`, `examples`, `docs`, `dist`, `build`).

| Factor                   | Score                                                   | Condition                                                                         |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `fan-in`                 | `min(30, N * 4)`                                        | `N` = `graph.dependedBy.length`                                                   |
| `fan-out`                | `min(18, N * 2)`                                        | `N` = `graph.dependsOn.length`                                                    |
| `cross-boundary-density` | `min(18, N * 4)`                                        | `N` = count of dependency edges crossing top-level directory boundaries           |
| `surface-exposure`       | `min(12, publicSurfaceCount * 4 + min(4, exportCount))` | Combines public surface items and export count                                    |
| `semantic-change`        | 16                                                      | `semantic.driftDetected` is true                                                  |
| `rule-violations`        | `min(18, sum)`                                          | Weighted sum: error=8, warning=5, advisory=3 per violation                        |
| `large-file`             | 8 (>= 250 lines), 12 (>= 500 lines)                     | File line count                                                                   |
| `missing-adjacent-tests` | 6                                                       | No `.test.` or `.spec.` file adjacent, AND (dependedBy >= 2 OR publicSurface > 0) |

Adjacent test detection checks four patterns:

- `{name}.test{ext}`
- `{name}.spec{ext}`
- `__tests__/{name}.test{ext}`
- `__tests__/{name}.spec{ext}`

### Impact Radius Hint

| Tier      | Condition                                 | Hint                                                          |
| --------- | ----------------------------------------- | ------------------------------------------------------------- |
| Broad     | `dependedBy >= 6` OR `crossBoundary >= 4` | "Likely broad impact across multiple modules."                |
| Medium    | `dependedBy >= 3` OR `crossBoundary >= 2` | "Likely medium impact beyond the local directory."            |
| Localized | Otherwise                                 | "Likely localized impact with a few downstream touch points." |

### Output Item Schema

```typescript
interface RiskHotspotViewItem {
  id: string; // "hotspot-1", "hotspot-2", ...
  hotspotPath: string; // Source file path
  riskFactors: string[]; // Top 4 positive scoring factors
  summary: string; // Human-readable summary
  impactRadiusHint: string; // Impact radius tier
  confidence: number; // 0.00-0.99
  totalScore: number; // Sum of all factor scores
  scoreBreakdown: ViewScoreContribution[]; // Full factor detail
}
```

Envelope: `ViewArtifactEnvelope<RiskHotspotViewItem>`.

### Markdown Output

Rendered via `ViewRenderer.renderRiskHotspots()` using templates from `src/assets/templates/view/risk-hotspots.md`. Contains a summary table (rank, path, factors, impact, score) and detailed per-item score breakdowns.

---

## Architecture Diagram View

**ViewId**: `architecture-diagram`
**File**: `src/services/view/architecture-diagram-view.ts`, `src/services/view/arch-diagram-svg-renderer.ts`

### Definition

| Field              | Value                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| Title              | Architecture Diagram                                                     |
| Description        | Full-sync deterministic architecture diagram rendered as standalone SVG. |
| Default enabled    | Yes                                                                      |
| Requires full sync | **Yes**                                                                  |
| Requires LLM       | No                                                                       |
| Outputs            | `architecture-diagram.json`, `architecture-diagram.svg`                  |

### Inputs

- Knowledge graph from `.spine/view/knowledge-graph.json` (`KnowledgeGraph` with `nodes` and `edges`).

### Guard

Returns `generated: false` with reason `"Requires full build."` when `ctx.isFullSync` is `false`. The knowledge graph is only rebuilt during full sync.

### SVG Layout Algorithm

Sugiyama-style layered layout (`generateArchitectureDiagramSvg()` in `src/services/view/arch-diagram-svg-renderer.ts`):

1. **Layer assignment**: Nodes are grouped by their `layer` field. Layers are topologically sorted using Kahn's algorithm on inter-layer dependency edges.
2. **Crossing reduction**: Within each layer, nodes are ordered using the barycenter heuristic -- each node's position is weighted by the average position of its sources from the previous layer.
3. **Coordinate assignment**: Nodes are positioned with uniform spacing (`marginX=64`, `marginY=80`, `layerGap=96`, `nodeGapX=48`), centered within each layer row.

### SVG Rendering Details

- **Theme**: Dark background (`#0b1121`).
- **Node colors**: 10-color palette, each layer assigned a unique color cyclically.

  | Index | Fill      | Stroke    | Text      |
  | ----- | --------- | --------- | --------- |
  | 0     | `#1e3a5f` | `#3b82f6` | `#93c5fd` |
  | 1     | `#14532d` | `#22c55e` | `#86efac` |
  | 2     | `#451a03` | `#f59e0b` | `#fcd34d` |
  | 3     | `#450a0a` | `#ef4444` | `#fca5a5` |
  | 4     | `#2e1065` | `#8b5cf6` | `#c4b5fd` |
  | 5     | `#4a044e` | `#ec4899` | `#f9a8d4` |
  | 6     | `#164e63` | `#06b6d4` | `#67e8f9` |
  | 7     | `#431407` | `#f97316` | `#fdba74` |
  | 8     | `#134e4a` | `#14b8a6` | `#5eead4` |
  | 9     | `#172554` | `#6366f1` | `#a5b4fc` |

- **Node size**: Scaled by `fanIn + fanOut`, linearly interpolated between min (100x44) and max (200x80).
- **Compliant edges**: Gray (`#64748b`) solid lines, 1.5px width, with triangle arrowhead.
- **Violation edges**: Red (`#ef4444`) dashed lines (`stroke-dasharray="8 5"`), 2.5px width, with red triangle arrowhead. A label box displays the `ruleRef` or `message` at the edge midpoint.
- **Node tooltips**: SVG `<title>` element on each node showing module ID, layer, role, fanIn, fanOut, violations, public surface symbols. GitHub-native hover support.
- **Legend**: Layer color swatches and edge type legend (compliant vs. violation).
- **Inline CSS**: `.graph-node:hover rect { filter: brightness(1.3); }`.
- Empty graph renders a fallback SVG with informational text.

### JSON Output

Lightweight metadata envelope:

```json
{
  "title": "Architecture Diagram",
  "subtitle": "Dependency graph with N modules and M edges.",
  "nodeCount": 0,
  "edgeCount": 0,
  "generatedAt": "ISO-8601"
}
```

### Metrics

| Metric      | Description                    |
| ----------- | ------------------------------ |
| `nodeCount` | Number of graph nodes rendered |
| `edgeCount` | Number of graph edges rendered |

---

## Project Health View

**ViewId**: `project-health`
**File**: `src/services/view/project-health-view.ts`

### Definition

| Field              | Value                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Title              | Project Health                                                                               |
| Description        | Human-readable project health report with topology, cycles, dead code, hubs, and violations. |
| Default enabled    | Yes                                                                                          |
| Requires full sync | No                                                                                           |
| Requires LLM       | No                                                                                           |
| Outputs            | `project-health.md`                                                                          |

### Inputs

| Source           | Path                                                       | Fallback                              |
| ---------------- | ---------------------------------------------------------- | ------------------------------------- |
| Knowledge graph  | `.spine/view/knowledge-graph.json`                         | "Topology data unavailable"           |
| Cycles report    | `.spine/view/diagnostics/cycles.json`                      | "No cycle dependencies detected."     |
| Dead code report | `.spine/view/diagnostics/dead-code.json`                   | "No suspicious dead code detected."   |
| Hubs report      | `.spine/view/diagnostics/hubs.json`                        | "No hub module risks detected."       |
| Violations       | Aggregated from indexed units' `semantic.ruleViolations[]` | "No active rule violations detected." |

### Output Sections

1. **Topology Overview**: Module count, edge count, compliant edge ratio (compliant/total as percentage), non-compliant edge count.

2. **Cycle Dependencies**: Table (`cycleId`, modules list, length). Sorted by length descending.

3. **Suspicious Dead Code**: Table (`moduleId`, reason, confidence). Sorted by entry order.

4. **Hub Module Risks**: Table (`moduleId`, fanIn, percentile, risk hint). Only modules with `fanIn >= 2`. Risk hints:

   | Percentile | Hint                                               |
   | ---------- | -------------------------------------------------- |
   | >= 90      | "Critical hub -- single point of failure risk"     |
   | >= 80      | "High hub -- broad blast radius"                   |
   | >= 70      | "Moderate hub -- growing dependency concentration" |
   | >= 50      | "Low hub -- notable fan-in"                        |
   | < 50       | "Minimal risk"                                     |

5. **Active Violations Summary**: Table (`ruleId`, severity, occurrences). Aggregated across all indexed units, sorted by count descending then ruleId ascending.

### Metrics

| Metric                   | Description                      |
| ------------------------ | -------------------------------- |
| `moduleCount`            | Number of knowledge graph nodes  |
| `edgeCount`              | Number of knowledge graph edges  |
| `cycleCount`             | Number of detected cycles        |
| `deadCodeSuspectCount`   | Number of dead code suspects     |
| `hubCount`               | Number of hub modules            |
| `distinctViolationTypes` | Unique rule violation type count |

---

## Agent Briefing View

**ViewId**: `agent-briefing`
**File**: `src/services/view/agent-briefing-view.ts`

### Definition

| Field              | Value                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Title              | Agent Briefing                                                                                                       |
| Description        | One-page project briefing for AI agents covering tech stack, entry points, module topology, constraints, and health. |
| Default enabled    | Yes                                                                                                                  |
| Requires full sync | No                                                                                                                   |
| Requires LLM       | No                                                                                                                   |
| Outputs            | `agent-briefing.md`                                                                                                  |

### Inputs

| Source             | Path                                              | Fallback                                          |
| ------------------ | ------------------------------------------------- | ------------------------------------------------- |
| Project config     | `.spine/config.json`                              | Project name defaults to `path.basename(rootDir)` |
| Language snapshot  | `.spine/languages.json`                           | "Language data not available"                     |
| Public surface     | `.spine/view/public-surface.json`                 | "Public surface data not available"               |
| Knowledge graph    | `.spine/view/knowledge-graph.json`                | "Module topology data not available"              |
| Architecture rules | `.spine/rules/` (loaded via `loadRulesFromDir()`) | "No rules directory found"                        |
| Cycle report       | `.spine/view/diagnostics/cycles.json`             | --                                                |
| Dead code report   | `.spine/view/diagnostics/dead-code.json`          | --                                                |
| Hubs report        | `.spine/view/diagnostics/hubs.json`               | --                                                |

### Output Sections

1. **Project Definition**: Project name, ArchSpine-managed note.

2. **Tech Stack**: Languages table from `.spine/languages.json`, including detected but unregistered extensions. Status values: `Available`, `Unavailable`, `Unsupported`.

3. **Entry Point Map**: Grouped by `PublicSurfaceKind` with labels:

   | Kind            | Label          |
   | --------------- | -------------- |
   | `cli`           | CLI Commands   |
   | `mcp`           | MCP Tools      |
   | `config`        | Configuration  |
   | `schema`        | Schemas        |
   | `route`         | HTTP Routes    |
   | `public-module` | Public Modules |

4. **Module Topology**: Table with columns: `Module`, `Layer`, `Fan-In`, `Fan-Out`, `Violations`, `Direction`, `Cycle`. Direction classification:

   | Condition                     | Direction    |
   | ----------------------------- | ------------ |
   | `fanIn === 0 && fanOut === 0` | Isolated     |
   | `fanIn >= fanOut * 2`         | Hub (served) |
   | `fanOut >= fanIn * 2`         | Consumer     |
   | Otherwise                     | Balanced     |

   Subsection "Violation Edges" lists each non-compliant edge with `from -> to`, `ruleRef`, and `message`.

5. **Architecture Constraints**: Rules loaded from `.spine/rules/` (both `.md` frontmatter and `.yml`/`.yaml` formats). Sorted by severity (`error` > `warning` > `advisory`). Severity badges: `error` = :no_entry:, `warning` = :warning:, `advisory` = :information_source:.

6. **Health Summary**: Metrics table (total violations, cycle count, dead code candidates, hub count). Drill-down subsections:
   - Cyclic Dependencies: unique participant count and top 5 largest cycles.
   - Dead Code Candidates: per-module details.
   - Hub Modules: top 5 by fanIn.

### Metrics

| Metric              | Description                                |
| ------------------- | ------------------------------------------ |
| `moduleCount`       | Knowledge graph node count                 |
| `edgeCount`         | Knowledge graph edge count                 |
| `violationCount`    | Non-compliant edge count                   |
| `cycleCount`        | Detected cycles count                      |
| `deadCodeCount`     | Dead code suspects count                   |
| `hubCount`          | Hub module count                           |
| `hasKnowledgeGraph` | 1 if KG loaded, 0 otherwise                |
| `hasDiagnostics`    | 1 if all 3 diagnostics loaded, 0 otherwise |

---

## Shared Scoring Utilities

File: `src/services/view/common.ts`

### isSuppressedPath(filePath: string): boolean

Returns `true` if the file path matches the suppression regex `/(^|\/)(tests?|__tests__|fixtures?|examples?|docs|dist|build)\//`. Paths matching this pattern are excluded from public-surface and risk-hotspots scoring.

### sumScores(scoreBreakdown: ViewScoreContribution[]): number

Sums all `score` values in the breakdown.

### toConfidence(totalScore: number, supportCount: number): number

```typescript
max(0, min(0.99, 0.35 + totalScore / 200 + supportCount * 0.02));
```

Rounded to 2 decimal places.

### countCrossBoundaryEdges(unit: SpineUnit): number

Counts dependency edges where the target's top-level directory differs from the source's top-level directory. External packages (bare specifiers) are excluded. Handles both `dependsOn` and `dependedBy` edges.

### topLevelBoundary(filePath: string): string

Returns the first path segment (top-level directory) of a normalized file path.

---
