import { describe, expect, it } from 'vitest';
import {
  detectCycles,
  detectDeadCode,
  detectHubs,
  detectStructuralDrift,
} from '../../../src/engines/graph-diagnostics.js';
import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
} from '../../../src/engines/dependency-graph.js';
import type {
  CycleReport,
  DeadCodeReport,
  HubReport,
} from '../../../src/engines/graph-diagnostics.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function emptyPublicSurface() {
  return [] as Array<{ name: string; kind: string }>;
}

function makeNode(overrides: Partial<KnowledgeGraphNode> & { id: string }): KnowledgeGraphNode {
  return {
    path: overrides.path ?? overrides.id,
    layer: overrides.layer ?? overrides.id.split('/').pop() ?? overrides.id,
    role: overrides.role ?? '',
    responsibilities: overrides.responsibilities ?? [],
    invariants: overrides.invariants ?? [],
    fanIn: overrides.fanIn ?? 0,
    fanOut: overrides.fanOut ?? 0,
    violationCount: overrides.violationCount ?? 0,
    publicSurface: overrides.publicSurface ?? emptyPublicSurface(),
    ...overrides,
  };
}

function makeEdge(
  from: string,
  to: string,
  overrides?: Partial<KnowledgeGraphEdge>,
): KnowledgeGraphEdge {
  return {
    from,
    to,
    type: 'import',
    fileCount: 1,
    compliant: true,
    ...overrides,
  };
}

function makeGraph(
  nodes: Partial<KnowledgeGraphNode> & { id: string }[],
  edges: [string, string][],
): KnowledgeGraph {
  const nodeSet = new Set<string>(nodes.map((n) => n.id));
  // Ensure targets are also in the node set
  for (const [from, to] of edges) {
    nodeSet.add(from);
    nodeSet.add(to);
  }
  const allNodes = [...nodeSet].map((id) => {
    const existing = nodes.find((n) => n.id === id);
    return makeNode(existing ?? { id });
  });
  return {
    nodes: allNodes,
    edges: edges.map(([from, to]) => makeEdge(from, to)),
  };
}

// ---------------------------------------------------------------------------
// detectCycles
// ---------------------------------------------------------------------------

describe('detectCycles', () => {
  it('finds and reports exactly one cycle in a graph with a single cycle', () => {
    // A → B → C → A (one cycle of length 3)
    const graph = makeGraph(
      [
        { id: 'A', fanIn: 1, fanOut: 1 },
        { id: 'B', fanIn: 1, fanOut: 1 },
        { id: 'C', fanIn: 1, fanOut: 1 },
      ],
      [
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'A'],
      ],
    );

    const result: CycleReport[] = detectCycles(graph);

    expect(result.length).toBe(1);
    expect(result[0].length).toBe(3);
    expect(result[0].nodes).toContain('A');
    expect(result[0].nodes).toContain('B');
    expect(result[0].nodes).toContain('C');
  });

  it('returns an empty array for a DAG (no cycles)', () => {
    // A → B → C (directed acyclic)
    const graph = makeGraph(
      [
        { id: 'A', fanIn: 0, fanOut: 1 },
        { id: 'B', fanIn: 1, fanOut: 1 },
        { id: 'C', fanIn: 1, fanOut: 0 },
      ],
      [
        ['A', 'B'],
        ['B', 'C'],
      ],
    );

    const result: CycleReport[] = detectCycles(graph);

    expect(result.length).toBe(0);
  });

  it('does not duplicate the same cycle discovered from different starting nodes', () => {
    // A → B → A (simple 2-cycle) plus extra edge C → A to trigger another DFS entry
    const graph = makeGraph(
      [
        { id: 'A', fanIn: 2, fanOut: 1 },
        { id: 'B', fanIn: 1, fanOut: 1 },
        { id: 'C', fanIn: 0, fanOut: 1 },
      ],
      [
        ['A', 'B'],
        ['B', 'A'],
        ['C', 'A'],
      ],
    );

    const result: CycleReport[] = detectCycles(graph);

    expect(result.length).toBe(1);
    expect(result[0].length).toBe(2);
  });

  it('works with an empty graph', () => {
    const graph: KnowledgeGraph = { nodes: [], edges: [] };
    const result: CycleReport[] = detectCycles(graph);
    expect(result.length).toBe(0);
  });

  it('works with nodes that have no edges', () => {
    const graph = makeGraph(
      [
        { id: 'A', fanIn: 0, fanOut: 0 },
        { id: 'B', fanIn: 0, fanOut: 0 },
      ],
      [],
    );

    const result: CycleReport[] = detectCycles(graph);
    expect(result.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// detectDeadCode
// ---------------------------------------------------------------------------

describe('detectDeadCode', () => {
  it('flags a node with zero fanIn, empty publicSurface, and fanOut > 0 as high confidence', () => {
    // Dead code: nobody imports it, no public surface, but it imports others
    const graph = makeGraph(
      [
        { id: 'dead-module', fanIn: 0, fanOut: 2, publicSurface: emptyPublicSurface() },
        { id: 'lib-a', fanIn: 1, fanOut: 0 },
        { id: 'lib-b', fanIn: 1, fanOut: 0 },
      ],
      [
        ['dead-module', 'lib-a'],
        ['dead-module', 'lib-b'],
      ],
    );

    const result: DeadCodeReport[] = detectDeadCode(graph);

    const dead = result.filter((r) => r.moduleId === 'dead-module');
    expect(dead.length).toBe(1);
    expect(dead[0].confidence).toBe('high');
  });

  it('flags an isolated module (fanIn=0, no publicSurface, fanOut=0) as low confidence', () => {
    const graph = makeGraph(
      [
        { id: 'isolated', fanIn: 0, fanOut: 0, publicSurface: emptyPublicSurface() },
        { id: 'active', fanIn: 0, fanOut: 1, publicSurface: [{ name: 'foo', kind: 'function' }] },
      ],
      [],
    );

    const result: DeadCodeReport[] = detectDeadCode(graph);

    const isolated = result.filter((r) => r.moduleId === 'isolated');
    expect(isolated.length).toBe(1);
    expect(isolated[0].confidence).toBe('low');
  });

  it('does not flag a node with non-empty public surface', () => {
    const graph = makeGraph(
      [
        {
          id: 'entry',
          fanIn: 0,
          fanOut: 3,
          publicSurface: [{ name: 'main', kind: 'function' }],
        },
        { id: 'dep-a', fanIn: 1, fanOut: 0 },
        { id: 'dep-b', fanIn: 1, fanOut: 0 },
        { id: 'dep-c', fanIn: 1, fanOut: 0 },
      ],
      [
        ['entry', 'dep-a'],
        ['entry', 'dep-b'],
        ['entry', 'dep-c'],
      ],
    );

    const result: DeadCodeReport[] = detectDeadCode(graph);

    const entry = result.filter((r) => r.moduleId === 'entry');
    expect(entry.length).toBe(0);
  });

  it('does not flag a node with fanIn > 0 even if other conditions match', () => {
    const graph = makeGraph(
      [
        { id: 'referenced', fanIn: 1, fanOut: 1, publicSurface: emptyPublicSurface() },
        { id: 'caller', fanIn: 0, fanOut: 1 },
      ],
      [['caller', 'referenced']],
    );

    const result: DeadCodeReport[] = detectDeadCode(graph);

    const ref = result.filter((r) => r.moduleId === 'referenced');
    expect(ref.length).toBe(0);
  });

  it('uses the provided publicSurfacesMap when passed', () => {
    const graph = makeGraph(
      [
        {
          id: 'pkg-entry',
          fanIn: 0,
          fanOut: 1,
          publicSurface: emptyPublicSurface(),
        },
        { id: 'dep', fanIn: 1, fanOut: 0 },
      ],
      [['pkg-entry', 'dep']],
    );

    // The map says pkg-entry has a public surface (e.g. package.json exports)
    const publicSurfacesMap = new Map<string, boolean>([['pkg-entry', true]]);

    const result: DeadCodeReport[] = detectDeadCode(graph, publicSurfacesMap);

    const entry = result.filter((r) => r.moduleId === 'pkg-entry');
    expect(entry.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// detectHubs
// ---------------------------------------------------------------------------

describe('detectHubs', () => {
  it('identifies a hub node with fanIn far above the mean', () => {
    // One node with very high fanIn (hub), many with low fanIn.
    // Build 20 nodes: hub at fanIn=50 and 19 leaves at fanIn=0.
    // P95 with 20 nodes selects the top ceil(0.05*20)=1 node (hub).
    const nodeDefs: Array<Partial<KnowledgeGraphNode> & { id: string }> = [
      { id: 'hub', fanIn: 50, fanOut: 0 },
    ];
    const edges: [string, string][] = [];
    for (let i = 0; i < 19; i++) {
      const leafId = 'leaf-' + i;
      nodeDefs.push({ id: leafId, fanIn: 0, fanOut: 1 });
      edges.push([leafId, 'hub']);
    }

    const graph = makeGraph(nodeDefs, edges);

    const result: HubReport[] = detectHubs(graph, 95);

    const hubReport = result.find((r) => r.moduleId === 'hub');
    expect(hubReport).toBeDefined();
    expect(hubReport!.fanIn).toBe(50);
  });

  it('guarantees at least 1 hub when the graph is non-empty (fallback)', () => {
    // All nodes have the same fanIn, so P95 threshold won't find anything
    const graph = makeGraph(
      [
        { id: 'A', fanIn: 0, fanOut: 0 },
        { id: 'B', fanIn: 0, fanOut: 0 },
        { id: 'C', fanIn: 0, fanOut: 0 },
      ],
      [],
    );

    const result: HubReport[] = detectHubs(graph, 95);

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('returns an empty array for an empty graph', () => {
    const graph: KnowledgeGraph = { nodes: [], edges: [] };
    const result: HubReport[] = detectHubs(graph);
    expect(result.length).toBe(0);
  });

  it('identifies hubs at lower percentile when specified', () => {
    const graph = makeGraph(
      [
        { id: 'top', fanIn: 10, fanOut: 0 },
        { id: 'mid-a', fanIn: 5, fanOut: 0 },
        { id: 'mid-b', fanIn: 4, fanOut: 0 },
        { id: 'low-a', fanIn: 1, fanOut: 0 },
        { id: 'low-b', fanIn: 1, fanOut: 0 },
        { id: 'low-c', fanIn: 0, fanOut: 0 },
      ],
      [
        ['low-a', 'top'],
        ['low-b', 'top'],
        ['low-c', 'top'],
        ['low-a', 'mid-a'],
        ['low-b', 'mid-a'],
        ['low-a', 'mid-b'],
      ],
    );

    // At P50, the threshold should include mid nodes as well
    const result: HubReport[] = detectHubs(graph, 50);

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((r) => r.moduleId === 'top')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// detectStructuralDrift
// ---------------------------------------------------------------------------

describe('detectStructuralDrift', () => {
  it('accurately describes added, removed, and modified elements between two graphs', () => {
    const prev = makeGraph(
      [
        { id: 'A', fanIn: 0, fanOut: 2 },
        { id: 'B', fanIn: 1, fanOut: 1 },
        { id: 'C', fanIn: 1, fanOut: 0 },
        { id: 'D', fanIn: 0, fanOut: 0 }, // will be removed
      ],
      [
        ['A', 'B'],
        ['B', 'C'],
      ],
    );

    const curr = makeGraph(
      [
        { id: 'A', fanIn: 0, fanOut: 1 }, // fanOut changed from 2 → 1 (>20%)
        { id: 'B', fanIn: 1, fanOut: 2 }, // fanOut changed from 1 → 2 (>20%)
        { id: 'C', fanIn: 1, fanOut: 0 }, // unchanged
        { id: 'E', fanIn: 1, fanOut: 0 }, // new node
      ],
      [
        ['A', 'B'],
        ['B', 'E'], // new edge
        // ['B', 'C'] removed
      ],
    );

    const drift = detectStructuralDrift(prev, curr);

    // Added
    expect(drift.addedNodes).toContain('E');
    expect(drift.addedNodes.length).toBe(1);

    // Removed
    expect(drift.removedNodes).toContain('D');
    expect(drift.removedNodes.length).toBe(1);

    // Added edges
    expect(drift.addedEdges.length).toBe(1);
    expect(drift.addedEdges[0]).toContain('B');
    expect(drift.addedEdges[0]).toContain('E');

    // Removed edges
    expect(drift.removedEdges.length).toBe(1);
    expect(drift.removedEdges[0]).toContain('B');
    expect(drift.removedEdges[0]).toContain('C');

    // Modified nodes (fanIn/fanOut > 20% change)
    expect(drift.modifiedNodes).toContain('A');
    expect(drift.modifiedNodes).toContain('B');
    expect(drift.modifiedNodes).not.toContain('C');
  });

  it('returns empty arrays when graphs are identical', () => {
    const graph = makeGraph(
      [
        { id: 'A', fanIn: 0, fanOut: 1 },
        { id: 'B', fanIn: 1, fanOut: 0 },
      ],
      [['A', 'B']],
    );

    const drift = detectStructuralDrift(graph, graph);

    expect(drift.addedNodes.length).toBe(0);
    expect(drift.removedNodes.length).toBe(0);
    expect(drift.addedEdges.length).toBe(0);
    expect(drift.removedEdges.length).toBe(0);
    expect(drift.modifiedNodes.length).toBe(0);
  });

  it('handles a fanIn change from 0 to non-zero as a modification', () => {
    const prev = makeGraph([{ id: 'leaf', fanIn: 0, fanOut: 0 }], []);

    const curr = makeGraph(
      [
        { id: 'leaf', fanIn: 5, fanOut: 0 },
        { id: 'new-caller', fanIn: 0, fanOut: 1 },
      ],
      [['new-caller', 'leaf']],
    );

    const drift = detectStructuralDrift(prev, curr);

    expect(drift.modifiedNodes).toContain('leaf');
  });

  it('does not flag minor fanIn/fanOut changes (<=20%)', () => {
    const prev = makeGraph([{ id: 'stable', fanIn: 10, fanOut: 10 }], []);

    // 11 is only 10% more than 10 — under the threshold
    const curr = makeGraph([{ id: 'stable', fanIn: 11, fanOut: 11 }], []);

    const drift = detectStructuralDrift(prev, curr);

    expect(drift.modifiedNodes).not.toContain('stable');
  });
});
