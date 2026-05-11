# Graph Diagnostics

Pure-function diagnostics over the module-level `KnowledgeGraph`. All analysis is deterministic, runs locally, and requires no LLM. Diagnostics are stored as JSON files under `.spine/view/diagnostics/` and consumed by view producers (project-health, agent-briefing).

Source provenance:

- `src/engines/graph-diagnostics.ts` -- `detectCycles()`, `detectDeadCode()`, `detectHubs()`, `detectStructuralDrift()`

## Report Types

### CycleReport

```typescript
interface CycleReport {
  cycleId: string; // Canonical cycle identifier (sorted participant IDs joined by " -> ")
  nodes: string[]; // Module IDs in the cycle, DFS traversal order
  length: number; // Number of edges forming the cycle (= nodes.length)
}
```

### DeadCodeReport

```typescript
interface DeadCodeReport {
  moduleId: string; // Module identifier
  reason: string; // Human-readable classification rationale
  confidence: 'high' | 'low'; // Confidence level
}
```

### HubReport

```typescript
interface HubReport {
  moduleId: string; // Module identifier
  fanIn: number; // Incoming edge count
  percentile: number; // Percentile rank (0-100)
}
```

### DriftReport

```typescript
interface DriftReport {
  addedNodes: string[]; // New nodes in current snapshot
  removedNodes: string[]; // Nodes removed from previous snapshot
  addedEdges: string[]; // New edges (formatted "from->to")
  removedEdges: string[]; // Removed edges (formatted "from->to")
  modifiedNodes: string[]; // Nodes with >20% fanIn or fanOut change
}
```

---

## Cycle Detection

### detectCycles(graph: KnowledgeGraph): CycleReport[]

**Time complexity**: O(V + E)

**Algorithm**: DFS with white/gray/black node coloring.

| Color     | State              | Meaning                                             |
| --------- | ------------------ | --------------------------------------------------- |
| WHITE (0) | Not visited        | Node not yet explored                               |
| GRAY (1)  | In recursion stack | Currently being explored; back edge to GRAY = cycle |
| BLACK (2) | Fully processed    | All descendants explored                            |

**Steps**:

1. Build adjacency list from graph edges (`Map<nodeId, outNeighbourIds[]>`).
2. Mark all nodes WHITE.
3. For each WHITE node, call `dfs(u)`:
   - Mark `u` GRAY.
   - For each neighbour `v` of `u`:
     - If `v` is GRAY: back edge found. Walk the parent chain from `u` back to `v` to reconstruct the cycle. Generate a canonical cycle ID.
     - If `v` is WHITE: set `parent[v] = u`, recurse into `v`.
     - If `v` is BLACK: already processed, skip.
   - Mark `u` BLACK.

**Canonical Cycle ID (`makeCycleId`)**: The cycle node list is rotated so the lexicographically smallest element is first, then joined with `->`. This ensures each directed cycle is reported exactly once regardless of discovery order.

**Output file**: `.spine/view/diagnostics/cycles.json` -- array of `CycleReport` objects. Empty array for a DAG.

---

## Dead Code Detection

### detectDeadCode(graph: KnowledgeGraph, publicSurfacesMap?: Map<string, boolean>): DeadCodeReport[]

**Heuristic**: Two-tier confidence classification based on in-degree and public surface analysis.

**Conditions evaluated per node**:

1. `fanIn === 0` (zero in-degree)
2. No public surface (node's `publicSurface` array is empty, or `publicSurfacesMap` entry is not `true`)
3. `fanOut > 0` (has outgoing edges)

| All 3 conditions          | Confidence | Meaning                                                                                             |
| ------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| 1 + 2 + 3                 | `high`     | Unreferenced, no public API, yet depends on others -- strong dead code signal                       |
| 1 + 2 only (fanOut === 0) | `low`      | Isolated module with no incoming or outgoing edges -- could be a leaf utility or unreachable island |
| fanIn > 0                 | (skipped)  | Not a dead code candidate                                                                           |
| Has public surface        | (skipped)  | Exposed API rules out dead code                                                                     |

**publicSurfacesMap parameter**: Optional override. When absent, uses the node's own `publicSurface` array length as the signal.

**Output file**: `.spine/view/diagnostics/dead-code.json` -- array of `DeadCodeReport` objects.

---

## Hub Detection

### detectHubs(graph: KnowledgeGraph, percentile: number = 95): HubReport[]

**Algorithm**: Percentile-based threshold with a guaranteed minimum.

1. Sort all nodes by `fanIn` descending.
2. Compute P-th percentile value using the nearest-rank method:
   - `idx = Math.ceil((P / 100) * nodeCount) - 1`
   - `threshold = sorted[idx].fanIn`
3. Collect all nodes with `fanIn >= threshold`.
4. Compute each hub's percentile rank: `Math.round((1 - position / nodeCount) * 100)`.
5. **D3 guarantee**: If `threshold` yields zero hubs (e.g., all fanIn values are 0), the single highest-fanIn node is returned with percentile 100.

**Parameters**:

| Parameter    | Type             | Default  | Description                           |
| ------------ | ---------------- | -------- | ------------------------------------- |
| `graph`      | `KnowledgeGraph` | required | Module-level knowledge graph          |
| `percentile` | `number`         | 95       | Percentile threshold (1-100, clamped) |

**Returns**: Guaranteed non-empty when the graph contains at least one node.

**Output file**: `.spine/view/diagnostics/hubs.json` -- array of `HubReport` objects.

---

## Structural Drift Detection

### detectStructuralDrift(prev: KnowledgeGraph, curr: KnowledgeGraph): DriftReport

**Purpose**: Compare two knowledge graph snapshots to identify structural changes between syncs.

**Steps**:

1. Build ID-indexed maps for both `prev` and `curr` nodes.
2. **Added nodes**: Present in `curr` but not `prev`.
3. **Removed nodes**: Present in `prev` but not `curr`.
4. **Added edges**: Present in `curr` but not `prev`, keyed by `"from->to"`.
5. **Removed edges**: Present in `prev` but not `curr`.
6. **Modified nodes**: A node in both snapshots where:
   - `fanIn` changed by more than 20% relative to previous value.
   - `fanOut` changed by more than 20% relative to previous value.
   - Special case: if previous value was 0, any non-zero change qualifies.

**20% threshold rationale**: Avoids noisy diffs from minor edge fluctuations during incremental syncs.

**Output file**: Not written to a standard diagnostics file; used programmatically.

---

## Report File Locations

| Report    | File Path                                | Format             |
| --------- | ---------------------------------------- | ------------------ |
| Cycles    | `.spine/view/diagnostics/cycles.json`    | `CycleReport[]`    |
| Dead Code | `.spine/view/diagnostics/dead-code.json` | `DeadCodeReport[]` |
| Hubs      | `.spine/view/diagnostics/hubs.json`      | `HubReport[]`      |

All three are consumed by the project-health and agent-briefing view producers. Each producer loads these files and falls back to null if the file is missing or unparseable.

## Internal Constants

### DFS Color States

```typescript
const enum Color {
  WHITE = 0, // Not yet visited
  GRAY = 1, // Currently in recursion stack
  BLACK = 2, // Fully processed
}
```

---
