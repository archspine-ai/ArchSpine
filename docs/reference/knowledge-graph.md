# Knowledge Graph

The knowledge graph is a module-level aggregation of file-level dependencies produced from the semantic index. It is stored at `.spine/view/knowledge-graph.json` and consumed by the architecture-diagram, project-health, and agent-briefing view producers, as well as the graph diagnostics engine.

Source provenance:

- `src/engines/dependency-graph.ts` -- `buildGraph()`, `KnowledgeGraph`, node/edge types
- `src/engines/graph-query.ts` -- `queryGraph()`, `matchSemantic()`, `changeImpact()`, `upstreamOf()`, `downstreamOf()`, `violationEdges()`, `resolveToModuleId()`

## Data Schema

### KnowledgeGraph

```typescript
interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}
```

### KnowledgeGraphNode

```typescript
interface KnowledgeGraphNode {
  id: string; // Module identifier (e.g., "src/engines", "tests", "root")
  path: string; // Filesystem path prefix (same as id)
  layer: string; // Architectural layer name (last path segment of module id)
  role: string; // First non-empty semantic role across module files
  responsibilities: string[]; // Merged from all files in the module
  invariants: Invariant[]; // Merged from all files in the module
  fanIn: number; // Number of incoming module-level edges
  fanOut: number; // Number of outgoing module-level edges
  violationCount: number; // Number of outgoing edges that violate an enforceable rule
  publicSurface: PublicSurfaceEntry[]; // Merged public surface entries
}
```

Where `Invariant` and `PublicSurfaceEntry` are imported from `src/types/protocol/index-documents.ts`:

```typescript
interface Invariant {
  id: string;
  description: string;
  enforceable: boolean;
}

interface PublicSurfaceEntry {
  symbolName: string;
  description: string;
}
```

### KnowledgeGraphEdge

```typescript
interface KnowledgeGraphEdge {
  from: string; // Source module ID
  to: string; // Target module ID
  type: 'import'; // Always "import" for module-level edges
  fileCount: number; // Number of file-level imports merged into this edge
  compliant: boolean; // Whether the edge complies with all enforceable rules
  ruleRef?: string; // ID of the first violated rule (only when non-compliant)
  message?: string; // Human-readable violation description (only when non-compliant)
}
```

## buildGraph()

```typescript
function buildGraph(indexDir: string, rules: SpineRuleDocument[], rootDir?: string): KnowledgeGraph;
```

**Parameters**:

| Parameter  | Type                  | Description                                                     |
| ---------- | --------------------- | --------------------------------------------------------------- |
| `indexDir` | `string`              | Absolute path to `.spine/index/` directory                      |
| `rules`    | `SpineRuleDocument[]` | Architectural rules loaded from `.spine/rules/`                 |
| `rootDir`  | `string \| undefined` | Repository root (used for `package.json` probes in D1 strategy) |

**Returns**: `KnowledgeGraph` with `nodes` and `edges`. Empty arrays if the index directory is missing or empty.

### Algorithm

1. **Walk index directory** (`walkIndexJson`): Recursively traverse `.spine/index/`, collecting all `.json` files except `folder.json` and `project.json`. Reconstruct source file paths by stripping the `.json` suffix.

2. **Read SpineUnit files**: For each entry, parse the JSON and extract `identity.filePath`, `semantic` fields, and `graph.dependsOn` edges.

3. **Resolve file-level dependencies**: For each `dependsOn` edge:
   - Skip empty `targetPath`.
   - Skip external dependencies (bare specifiers: no `.` or `/` prefix).
   - Resolve relative paths to canonical POSIX paths (extension stripped: `.js`, `.ts`, `.jsx`, `.tsx`, `.mjs`, `.cjs`).
   - Map both source and target to module IDs via `getModuleId()`.
   - Skip intra-module edges (source module === target module).
   - Accumulate `{ targetModule, relation }`.

4. **D1 aggregation**: File-level edges are merged into module-level edges. A `Map<sourceModule, Map<targetModule, fileCount>>` tracks how many file-level imports contribute to each module-level edge.

5. **Compliance checking** (`checkEdgeCompliance`): Each module-level edge is checked against enforceable rules:
   - The source module must be within the rule's `appliesTo` glob scope.
   - The target layer must appear in a restrictive/negative context within the rule's `bodyMarkdown` (detected via regex matching known layer names near negating keywords: `must not`, `should not`, `cannot`, `without`, `decoupled`, `instead of`, `avoid`, `forbidden`, `restrict`, `must stay`, `should stay`, `independent of`).
   - Non-compliant edges record the first violated rule's `ruleId` and a generated message.

6. **Node construction**: For each unique module ID:
   - Aggregate semantic fields (role, responsibilities, invariants, public surface) from all constituent files. First non-empty role wins.
   - Compute `fanIn`, `fanOut`, `violationCount` from edge accumulators.
   - `layer` is the last path segment of the module ID.
   - Nodes without any edges are still included (they represent modules with files that have no imports or dependents).

### D1 Aggregation Strategy (`getModuleId`)

Module identifiers are assigned in priority order:

| Priority | Condition                          | Module ID                                      |
| -------- | ---------------------------------- | ---------------------------------------------- |
| 1        | `package.json` exists in directory | `src/<dir>` (detected but uses same id scheme) |
| 2        | File under `src/<subdir>/...`      | `src/<subdir>`                                 |
| 3        | File directly in `src/`            | `src`                                          |
| 4        | File under `<top-dir>/...`         | `<top-dir>`                                    |
| 5        | Root-level file                    | `root`                                         |

Known layer names (used for compliance parsing): `cli`, `services`, `core`, `tasks`, `engines`, `infra`, `types`, `utils`, `ast`, `runtime`, `tests`, `root`.

## Graph Query API

All query functions in `src/engines/graph-query.ts`.

### resolveToModuleId(graph, filePath): string | null

Resolves a file path to its containing module ID via longest-prefix matching. If `filePath` is already a known module ID, it is returned directly. Otherwise, finds the module whose `path` is the longest prefix of `filePath` (prefix + `/` required).

### upstreamOf(graph, moduleId): ModuleContext[]

Finds all modules that depend on the given module (reverse-edge BFS). "Who depends on me." Returns `ModuleContext[]` ordered by BFS discovery.

```typescript
interface ModuleContext {
  moduleId: string;
  path: string;
  layer: string;
  role: string;
  fanIn: number;
  violationCount: number;
  distance: number; // Number of hops from origin (1 = direct dependant)
}
```

### downstreamOf(graph, moduleId): ModuleContext[]

Finds all modules that the given module depends on (forward-edge BFS). "Who do I depend on." Returns `ModuleContext[]`.

### changeImpact(graph, filePathOrModuleId, maxDepth = 3): ChangeImpactReport

Pre-computed BFS impact radius for a module. Follows reverse edges (upstream direction): a change to module X affects modules that import X.

```typescript
interface ChangeImpactReport {
  affectedModules: AffectedModuleGroup[];
  affectedRules: string[]; // Unique rule IDs violated in the impact cone
  totalAffected: number; // Distinct modules excluding origin
  truncated: boolean; // True if BFS hit maxDepth
}

interface AffectedModuleGroup {
  depth: number; // 1 = direct dependants
  modules: ModuleContext[];
}
```

The `affectedRules` field collects `ruleRef` values from non-compliant edges where either endpoint is in the reachable set for the origin module.

### violationEdges(graph): ViolationEdge[]

Returns all non-compliant edges in the graph.

```typescript
interface ViolationEdge {
  from: string;
  to: string;
  fileCount: number;
  ruleRef?: string;
  message?: string;
}
```

### matchSemantic(graph, query): ModuleMatch[]

Case-insensitive substring search across `role`, `responsibilities`, and invariant `description` fields.

**Query syntax**:

- Space-separated terms = AND group (score = count of matched terms)
- Comma-separated groups = OR (best-matching group wins)

Partial AND matches are included with lower scores. Results sorted by score descending, then moduleId ascending.

```typescript
interface ModuleMatch {
  moduleId: string;
  path: string;
  layer: string;
  role: string;
  score: number; // Number of matched query terms (OR group max)
  matchedFields: string[]; // Which fields contributed: "role", "responsibilities", "invariants"
  matchedTerms: string[]; // Which query terms matched
}
```

### Internal Helpers

`bfsTraverse(startId, adjacency, nodeMap, maxDepth, includeStart)`: Generic BFS with configurable depth limit and start-node inclusion. Returns `{ results: ModuleContext[], truncated: boolean }`.

`buildNodeMap(graph)`, `buildForwardAdjacency(graph)`, `buildReverseAdjacency(graph)`: Build index maps for traversal.

`reachableModuleSet(originId, reverseAdj, maxDepth)`: Builds the set of all module IDs reachable within a BFS depth bound (forward adjacency), used for filtering affected rules in `changeImpact`.

## Edge Compliance Checking

Rule-based compliance is performed by `checkEdgeCompliance(fromModule, toModule, fromLayer, toLayer, rules)`:

1. Filter rules to only those marked `enforceable`.
2. For each rule, verify the source module matches the rule's `appliesTo` glob patterns (using `picomatch`).
3. If the source matches, extract forbidden layer names from the rule's `bodyMarkdown` using `extractForbiddenLayers()`.
4. If the target layer is among the forbidden layers, the edge is non-compliant.

The forbidden layer extraction heuristic scans each known layer name in the constraint text and checks for negating keywords within an 80-character context window.

### Internal Data Shapes (Runtime Subset)

```typescript
interface SpineUnitIdentity {
  filePath: string;
}
interface SpineUnitSemantic {
  role?: string;
  responsibilities?: string[];
  invariants?: Invariant[];
  publicSurface?: PublicSurfaceEntry[];
}
interface FileDepEdge {
  targetPath: string;
  relation?: string;
  symbols?: string[];
}
interface SpineUnitGraph {
  dependsOn?: FileDepEdge[];
}
interface SpineUnitLike {
  identity?: SpineUnitIdentity;
  semantic?: SpineUnitSemantic;
  graph?: SpineUnitGraph;
}
```

### Edge Cases Handled

- **Empty repository**: `indexDir` does not exist -> `{ nodes: [], edges: [] }`.
- **No index entries**: `walkIndexJson` returns empty -> `{ nodes: [], edges: [] }`.
- **Missing identity.filePath**: Entry is skipped.
- **Undefined dependsOn**: Treated as empty array (`?? []`).
- **Missing semantic fields**: Role defaults to `''`, arrays to `[]`.
- **External dependencies**: Bare specifiers (no `.` or `/` prefix) are skipped and do not produce module edges.
- **Intra-module edges**: Source and target in the same module -> skipped.
- **File with no edges**: Still registered in `moduleFiles` so a node is produced.
- **JSON parse errors**: Individual files with malformed JSON are silently skipped.

## Output Location

The knowledge graph is written to `.spine/view/knowledge-graph.json` during full sync by the knowledge graph task (`src/tasks/knowledge-graph.ts`). View producers and diagnostics engines read it from this path.

---
