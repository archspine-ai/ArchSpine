// ---------------------------------------------------------------------------
// Graph Diagnostics Engine
//
// Pure-function diagnostics over a KnowledgeGraph. Zero LLM cost.
// All analysis is deterministic and runs locally on the module-level graph
// produced by the S04 dependency graph builder.
// ---------------------------------------------------------------------------

import type { KnowledgeGraph, KnowledgeGraphEdge } from './dependency-graph.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Module path prefixes that are known infrastructure/scaffolding directories.
 * These are intentionally unreferenced from source code and should never be
 * flagged as dead code suspects, even when they have zero in-degree.
 */
const KNOWN_INFRA_DIRS = new Set(['.spine', '.github', 'schemas', 'scripts']);

// ---------------------------------------------------------------------------
// Report types
// ---------------------------------------------------------------------------

/** Identifies a directed cycle within the module dependency graph. */
export interface CycleReport {
  /** Unique cycle identifier (deterministic, based on sorted participant IDs). */
  cycleId: string;
  /** Module IDs that participate in the cycle, in DFS traversal order. */
  nodes: string[];
  /** Number of edges forming the cycle (equal to nodes.length). */
  length: number;
}

/** Marks a module that appears to be dead code based on in-degree heuristics. */
export interface DeadCodeReport {
  /** Module identifier. */
  moduleId: string;
  /** Human-readable classification rationale. */
  reason: string;
  /** Confidence level — "high" when all three conditions are met, "low" for isolated modules. */
  confidence: 'high' | 'low';
}

/** Identifies a hub module with disproportionately high fan-in. */
export interface HubReport {
  /** Module identifier. */
  moduleId: string;
  /** Incoming edge count. */
  fanIn: number;
  /** Percentile rank of this node's fan-in within the graph (0–100). */
  percentile: number;
}

/** Describes structural differences between two snapshots of the knowledge graph. */
export interface DriftReport {
  /** Nodes present in the current graph but absent in the previous. */
  addedNodes: string[];
  /** Nodes present in the previous graph but absent in the current. */
  removedNodes: string[];
  /** Edges present in the current graph but absent in the previous. */
  addedEdges: string[];
  /** Edges present in the previous graph but absent in the current. */
  removedEdges: string[];
  /** Nodes whose fanIn or fanOut changed by more than 20% between snapshots. */
  modifiedNodes: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * DFS color states for cycle detection (white/gray/black coloring).
 * - WHITE: Not yet visited.
 * - GRAY:  Currently in the recursion stack (back edge to GRAY = cycle).
 * - BLACK: Fully processed.
 */
const enum Color {
  WHITE = 0,
  GRAY = 1,
  BLACK = 2,
}

/** Build an adjacency list mapping each node ID to its outgoing neighbour IDs. */
function buildAdjacencyList(graph: KnowledgeGraph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const neighbours = adj.get(edge.from);
    if (neighbours) {
      neighbours.push(edge.to);
    }
  }
  return adj;
}

/**
 * Produce a canonical, deterministic cycle ID by sorting the participant
 * node IDs and joining them. This ensures the same cycle is never reported
 * twice regardless of which starting node DFS discovered it from.
 */
function makeCycleId(nodes: string[]): string {
  // Rotate so the smallest element is first, then the natural edge order.
  // This gives a stable representation of the directed cycle.
  const minIdx = nodes.reduce((best, val, i) => (val < nodes[best] ? i : best), 0);
  const rotated = [...nodes.slice(minIdx), ...nodes.slice(0, minIdx)];
  return rotated.join(' → ');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect all directed cycles in the knowledge graph using DFS coloring
 * (white/gray/black). Each cycle is reported exactly once via a canonical
 * cycle ID derived from the sorted participant list.
 *
 * Time complexity: O(V + E).
 *
 * @param graph  The module-level knowledge graph.
 * @returns       Array of {@link CycleReport}, empty for a DAG.
 */
export function detectCycles(graph: KnowledgeGraph): CycleReport[] {
  const adj = buildAdjacencyList(graph);
  const color = new Map<string, Color>();
  const parent = new Map<string, string>();
  const discovered = new Set<string>(); // canonical cycle IDs already emitted

  for (const node of graph.nodes) {
    color.set(node.id, Color.WHITE);
  }

  const reports: CycleReport[] = [];

  function dfs(u: string): void {
    color.set(u, Color.GRAY);

    const neighbours = adj.get(u) ?? [];
    for (const v of neighbours) {
      const vColor = color.get(v);
      if (vColor === Color.GRAY) {
        // Back edge found — walk the parent chain to reconstruct the cycle
        const cycle: string[] = [v];
        let cursor = u;
        while (cursor !== v) {
          cycle.push(cursor);
          cursor = parent.get(cursor) ?? '';
          if (!cursor) {
            break;
          } // safety guard
        }
        // cycle now contains [v, ... u] in reverse walk order
        // canonical ID uses the nodes sorted, but we report the natural edge order

        const cycleId = makeCycleId(cycle);
        if (!discovered.has(cycleId)) {
          discovered.add(cycleId);
          reports.push({
            cycleId,
            nodes: [...cycle],
            length: cycle.length,
          });
        }
      } else if (vColor === Color.WHITE) {
        parent.set(v, u);
        dfs(v);
      }
      // BLACK nodes are already fully processed — skip
    }

    color.set(u, Color.BLACK);
  }

  for (const node of graph.nodes) {
    if (color.get(node.id) === Color.WHITE) {
      dfs(node.id);
    }
  }

  return reports;
}

// ---------------------------------------------------------------------------
// Dead Code Detection
// ---------------------------------------------------------------------------

/**
 * Detect potentially dead (unreferenced) modules based on in-degree analysis.
 *
 * Heuristic:
 * - **High confidence**: fanIn = 0, publicSurface is empty, AND fanOut > 0.
 *   This module is unreferenced from anywhere yet depends on others — strong
 *   signal of dead code.
 * - **Low confidence**: fanIn = 0, publicSurface is empty, AND fanOut = 0.
 *   This is an isolated module with no incoming or outgoing edges. It may be
 *   a leaf utility or a genuinely unreachable island.
 *
 * @param graph              The module-level knowledge graph.
 * @param publicSurfacesMap  Optional map from module ID to whether it surfaces
 *                           any public API (e.g., from a package.json "main"
 *                           or "exports" field). When absent, the node's own
 *                           `publicSurface` array is used as the signal.
 * @returns                   Array of {@link DeadCodeReport}.
 */
export function detectDeadCode(
  graph: KnowledgeGraph,
  publicSurfacesMap?: Map<string, boolean>,
): DeadCodeReport[] {
  const reports: DeadCodeReport[] = [];

  for (const node of graph.nodes) {
    // Skip known infrastructure directories that are intentionally unreferenced.
    if (KNOWN_INFRA_DIRS.has(node.id)) {
      continue;
    }

    // Condition 1: zero in-degree
    if (node.fanIn !== 0) {
      continue;
    }

    // Condition 2: no public surface
    const hasPublicSurface = publicSurfacesMap
      ? publicSurfacesMap.get(node.id) === true
      : node.publicSurface.length > 0;
    if (hasPublicSurface) {
      continue;
    }

    // All three conditions evaluated
    const hasFanOut = node.fanOut > 0;

    if (hasFanOut) {
      // D2 high-confidence: unreferenced, no public API, yet depends on others
      reports.push({
        moduleId: node.id,
        reason: `Module "${node.id}" has zero incoming edges, no public surface, but ${node.fanOut} outgoing edge(s) — likely dead code.`,
        confidence: 'high',
      });
    } else {
      // D2 low-confidence: completely isolated island
      reports.push({
        moduleId: node.id,
        reason: `Module "${node.id}" has zero incoming edges and no public surface but also no outgoing edges — isolated module (low confidence).`,
        confidence: 'low',
      });
    }
  }

  return reports;
}

// ---------------------------------------------------------------------------
// Hub Detection
// ---------------------------------------------------------------------------

/**
 * Identify architectural hubs — modules whose fan-in falls at or above the
 * given percentile threshold.
 *
 * Algorithm:
 * 1. Sort all nodes by fanIn descending.
 * 2. Compute the value at the P-th percentile.
 * 3. All nodes with fanIn >= that threshold are hubs.
 * 4. If the threshold yields zero hubs (e.g., all nodes have zero fanIn),
 *    the single highest-fanIn node is returned as a guaranteed minimum.
 *
 * @param graph       The module-level knowledge graph.
 * @param percentile  Percentile threshold (1–100). Default 95.
 * @returns            Array of {@link HubReport}, guaranteed non-empty
 *                     when the graph contains at least one node.
 */
export function detectHubs(graph: KnowledgeGraph, percentile: number = 95): HubReport[] {
  if (graph.nodes.length === 0) {
    return [];
  }

  const sorted = [...graph.nodes]
    .map((n) => ({ id: n.id, fanIn: n.fanIn }))
    .sort((a, b) => b.fanIn - a.fanIn);

  // Compute P-th percentile value using linear interpolation between
  // ranks. The "nearest-rank" method is used for clarity.
  const p = Math.max(1, Math.min(100, percentile));
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  const clampedIdx = Math.max(0, Math.min(idx, sorted.length - 1));
  const threshold = sorted[clampedIdx].fanIn;

  // Collect all nodes meeting or exceeding the threshold
  const hubs: HubReport[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const node = sorted[i];
    if (node.fanIn >= threshold) {
      // Percentile rank: (1 - i / N) * 100, clamped to [0, 100]
      const rank = Math.round((1 - i / sorted.length) * 100);
      hubs.push({ moduleId: node.id, fanIn: node.fanIn, percentile: rank });
    }
  }

  // D3 guarantee: at least 1 hub (the highest fanIn node)
  if (hubs.length === 0 && sorted.length > 0) {
    const top = sorted[0];
    hubs.push({ moduleId: top.id, fanIn: top.fanIn, percentile: 100 });
  }

  return hubs;
}

// ---------------------------------------------------------------------------
// Structural Drift Detection
// ---------------------------------------------------------------------------

/**
 * Compare two knowledge graph snapshots and produce a structural diff.
 *
 * A node is considered **modified** if either its fanIn or fanOut changed
 * by more than 20% relative to the previous value. This avoids noisy diffs
 * from minor edge fluctuations.
 *
 * @param prev  Previous (baseline) knowledge graph.
 * @param curr  Current knowledge graph.
 * @returns      {@link DriftReport} summarising additions, removals, and modifications.
 */
export function detectStructuralDrift(prev: KnowledgeGraph, curr: KnowledgeGraph): DriftReport {
  // Index by ID
  const prevNodeMap = new Map(prev.nodes.map((n) => [n.id, n]));
  const currNodeMap = new Map(curr.nodes.map((n) => [n.id, n]));

  const prevIds = new Set(prevNodeMap.keys());
  const currIds = new Set(currNodeMap.keys());

  // Added / removed nodes
  const addedNodes: string[] = [];
  const removedNodes: string[] = [];
  for (const id of currIds) {
    if (!prevIds.has(id)) {
      addedNodes.push(id);
    }
  }
  for (const id of prevIds) {
    if (!currIds.has(id)) {
      removedNodes.push(id);
    }
  }

  // Added / removed edges (keyed by "from→to")
  const edgeKey = (e: KnowledgeGraphEdge): string => `${e.from}→${e.to}`;
  const prevEdgeSet = new Set(prev.edges.map(edgeKey));
  const currEdgeSet = new Set(curr.edges.map(edgeKey));

  const addedEdges: string[] = [];
  const removedEdges: string[] = [];
  for (const key of currEdgeSet) {
    if (!prevEdgeSet.has(key)) {
      addedEdges.push(key);
    }
  }
  for (const key of prevEdgeSet) {
    if (!currEdgeSet.has(key)) {
      removedEdges.push(key);
    }
  }

  // Modified nodes: fanIn or fanOut changed by > 20%
  const modifiedNodes: string[] = [];
  const THRESHOLD = 0.2;

  for (const id of currIds) {
    const prevNode = prevNodeMap.get(id);
    const currNode = currNodeMap.get(id);
    if (!prevNode || !currNode) {
      continue;
    }

    const fanInChanged =
      prevNode.fanIn === 0
        ? currNode.fanIn !== 0
        : Math.abs(currNode.fanIn - prevNode.fanIn) / prevNode.fanIn > THRESHOLD;
    const fanOutChanged =
      prevNode.fanOut === 0
        ? currNode.fanOut !== 0
        : Math.abs(currNode.fanOut - prevNode.fanOut) / prevNode.fanOut > THRESHOLD;

    if (fanInChanged || fanOutChanged) {
      modifiedNodes.push(id);
    }
  }

  return {
    addedNodes,
    removedNodes,
    addedEdges,
    removedEdges,
    modifiedNodes,
  };
}
