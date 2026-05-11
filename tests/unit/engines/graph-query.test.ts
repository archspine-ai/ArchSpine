import { describe, expect, it } from 'vitest';
import {
  upstreamOf,
  downstreamOf,
  violationEdges,
  changeImpact,
  matchSemantic,
} from '../../../src/engines/graph-query.js';
import type { KnowledgeGraph } from '../../../src/engines/dependency-graph.js';

// ---------------------------------------------------------------------------
// Helpers – graph fixtures
// ---------------------------------------------------------------------------

/**
 * Layout:
 *
 *   cli ──────────→ services ──────────→ core
 *                     │                   ↑
 *                     ├──────────────────→ infra (depends on services)
 *                     │
 *                     └──────────────────→ utils
 *
 *   A → B  means A imports/depends on B.
 *
 *   Nodes: cli, services, core, infra, utils
 *   Edges: cli→services, services→core, services→infra, services→utils
 *
 *   Reverse: services←cli, core←services, infra←services, utils←services
 */
function makeFixtureGraph(overrides?: Partial<KnowledgeGraph>): KnowledgeGraph {
  if (overrides) {
    return { nodes: [], edges: [], ...overrides };
  }

  return {
    nodes: [
      {
        id: 'src/cli',
        path: 'src/cli',
        layer: 'cli',
        role: 'CLI entrypoint',
        responsibilities: ['Dispatch user commands', 'Route to services'],
        invariants: [
          { id: 'inv-cli-1', description: 'CLI must not depend on infra', enforceable: true },
        ],
        fanIn: 0,
        fanOut: 1,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/services',
        path: 'src/services',
        layer: 'services',
        role: 'Business service layer',
        responsibilities: ['Orchestrate tasks', 'Manage pipeline execution'],
        invariants: [
          { id: 'inv-svc-1', description: 'Services must validate input', enforceable: true },
        ],
        fanIn: 1,
        fanOut: 3,
        violationCount: 1,
        publicSurface: [],
      },
      {
        id: 'src/core',
        path: 'src/core',
        layer: 'core',
        role: 'Core domain types and pipeline auth',
        responsibilities: ['Define pipeline stages', 'Enforce task state transitions'],
        invariants: [
          { id: 'inv-core-1', description: 'Task states must be monotonic', enforceable: true },
        ],
        fanIn: 1,
        fanOut: 0,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/infra',
        path: 'src/infra',
        layer: 'infra',
        role: 'Infrastructure layer',
        responsibilities: ['Provide runtime I/O', 'Manage database connections'],
        invariants: [],
        fanIn: 1,
        fanOut: 0,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/utils',
        path: 'src/utils',
        layer: 'utils',
        role: 'Shared utilities',
        responsibilities: ['String formatting', 'Date helpers'],
        invariants: [],
        fanIn: 1,
        fanOut: 0,
        violationCount: 0,
        publicSurface: [],
      },
    ],
    edges: [
      {
        from: 'src/cli',
        to: 'src/services',
        type: 'import',
        fileCount: 3,
        compliant: true,
      },
      {
        from: 'src/services',
        to: 'src/core',
        type: 'import',
        fileCount: 5,
        compliant: true,
      },
      {
        from: 'src/services',
        to: 'src/infra',
        type: 'import',
        fileCount: 2,
        compliant: false,
        ruleRef: 'no-services-to-infra',
        message:
          'services → infra violates no-services-to-infra: Services must not depend on infra',
      },
      {
        from: 'src/services',
        to: 'src/utils',
        type: 'import',
        fileCount: 1,
        compliant: true,
      },
    ],
  };
}

/**
 * Deeper graph for testing multi-hop traversal:
 *
 *   app → cli → services → core → types
 *                       ↘ infra
 */
function makeDeepGraph(): KnowledgeGraph {
  return {
    nodes: [
      {
        id: 'app',
        path: 'app',
        layer: 'app',
        role: 'Application root',
        responsibilities: [],
        invariants: [],
        fanIn: 0,
        fanOut: 1,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/cli',
        path: 'src/cli',
        layer: 'cli',
        role: 'CLI',
        responsibilities: [],
        invariants: [],
        fanIn: 1,
        fanOut: 1,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/services',
        path: 'src/services',
        layer: 'services',
        role: 'Services',
        responsibilities: [],
        invariants: [],
        fanIn: 1,
        fanOut: 2,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/core',
        path: 'src/core',
        layer: 'core',
        role: 'Core',
        responsibilities: [],
        invariants: [],
        fanIn: 1,
        fanOut: 1,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/types',
        path: 'src/types',
        layer: 'types',
        role: 'Types',
        responsibilities: [],
        invariants: [],
        fanIn: 1,
        fanOut: 0,
        violationCount: 0,
        publicSurface: [],
      },
      {
        id: 'src/infra',
        path: 'src/infra',
        layer: 'infra',
        role: 'Infra',
        responsibilities: [],
        invariants: [],
        fanIn: 1,
        fanOut: 0,
        violationCount: 0,
        publicSurface: [],
      },
    ],
    edges: [
      { from: 'app', to: 'src/cli', type: 'import', fileCount: 1, compliant: true },
      { from: 'src/cli', to: 'src/services', type: 'import', fileCount: 2, compliant: true },
      { from: 'src/services', to: 'src/core', type: 'import', fileCount: 3, compliant: true },
      { from: 'src/core', to: 'src/types', type: 'import', fileCount: 2, compliant: true },
      { from: 'src/services', to: 'src/infra', type: 'import', fileCount: 1, compliant: true },
    ],
  };
}

// ---------------------------------------------------------------------------
// upstreamOf
// ---------------------------------------------------------------------------

describe('upstreamOf', () => {
  it('returns correct upstream modules with correct distance for a known graph', () => {
    const graph = makeFixtureGraph();

    // upstreamOf('src/services') → who depends on services?
    // cli → services, so cli depends on services
    const result = upstreamOf(graph, 'src/services');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      moduleId: 'src/cli',
      layer: 'cli',
      distance: 1,
    });
  });

  it('returns upstream modules sorted by BFS distance (direct first)', () => {
    const graph = makeFixtureGraph();

    // upstreamOf('src/core') → services → core, cli → services → core
    const result = upstreamOf(graph, 'src/core');

    expect(result).toHaveLength(2);

    // Direct dependent at distance 1
    const direct = result.filter((r) => r.distance === 1);
    expect(direct).toHaveLength(1);
    expect(direct[0].moduleId).toBe('src/services');

    // Transitive dependent at distance 2
    const transitive = result.filter((r) => r.distance === 2);
    expect(transitive).toHaveLength(1);
    expect(transitive[0].moduleId).toBe('src/cli');
  });

  it('returns empty array for a module with no upstream dependents', () => {
    const graph = makeFixtureGraph();

    // No one depends on cli
    const result = upstreamOf(graph, 'src/cli');
    expect(result).toEqual([]);
  });

  it('returns empty array for an unknown module ID', () => {
    const graph = makeFixtureGraph();
    const result = upstreamOf(graph, 'nonexistent');
    expect(result).toEqual([]);
  });

  it('returns ModuleContext with correct fields', () => {
    const graph = makeFixtureGraph();

    const result = upstreamOf(graph, 'src/services');
    expect(result).toHaveLength(1);

    const ctx = result[0];
    expect(ctx.moduleId).toBe('src/cli');
    expect(ctx.path).toBe('src/cli');
    expect(ctx.layer).toBe('cli');
    expect(ctx.role).toBe('CLI entrypoint');
    expect(ctx.fanIn).toBe(0);
    expect(ctx.violationCount).toBe(0);
    expect(ctx.distance).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// downstreamOf
// ---------------------------------------------------------------------------

describe('downstreamOf', () => {
  it('returns correct downstream modules with correct distance for a known graph', () => {
    const graph = makeFixtureGraph();

    // downstreamOf('src/services') → who does services depend on?
    // services → core, services → infra, services → utils
    const result = downstreamOf(graph, 'src/services');

    expect(result).toHaveLength(3);
    const ids = result.map((r) => r.moduleId).sort();
    expect(ids).toEqual(['src/core', 'src/infra', 'src/utils']);

    // All are direct dependencies → distance = 1
    for (const r of result) {
      expect(r.distance).toBe(1);
    }
  });

  it('returns multi-hop downstream modules', () => {
    const graph = makeFixtureGraph();

    // downstreamOf('src/cli') → services → core, infra, utils
    const result = downstreamOf(graph, 'src/cli');

    expect(result).toHaveLength(4); // services, core, infra, utils

    const direct = result.filter((r) => r.distance === 1);
    expect(direct).toHaveLength(1);
    expect(direct[0].moduleId).toBe('src/services');

    const transitive = result.filter((r) => r.distance === 2);
    expect(transitive).toHaveLength(3);
    expect(transitive.map((t) => t.moduleId).sort()).toEqual([
      'src/core',
      'src/infra',
      'src/utils',
    ]);
  });

  it('returns empty array for a leaf module with no downstream deps', () => {
    const graph = makeFixtureGraph();
    const result = downstreamOf(graph, 'src/core');
    expect(result).toEqual([]);
  });

  it('returns empty array for an unknown module ID', () => {
    const graph = makeFixtureGraph();
    const result = downstreamOf(graph, 'nonexistent');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// violationEdges
// ---------------------------------------------------------------------------

describe('violationEdges', () => {
  it('returns only non-compliant edges', () => {
    const graph = makeFixtureGraph();

    const result = violationEdges(graph);

    // Only 1 edge is non-compliant: services → infra
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      from: 'src/services',
      to: 'src/infra',
      fileCount: 2,
    });
    expect(result[0].ruleRef).toBe('no-services-to-infra');
    expect(result[0].message).toContain('violates');
  });

  it('returns empty array when all edges are compliant', () => {
    const graph: KnowledgeGraph = {
      nodes: [
        {
          id: 'a',
          path: 'a',
          layer: 'a',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 1,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'b',
          path: 'b',
          layer: 'b',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 1,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [{ from: 'a', to: 'b', type: 'import', fileCount: 1, compliant: true }],
    };

    const result = violationEdges(graph);
    expect(result).toEqual([]);
  });

  it('returns multiple violation edges when present', () => {
    const graph: KnowledgeGraph = {
      nodes: [
        {
          id: 'a',
          path: 'a',
          layer: 'a',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 2,
          violationCount: 2,
          publicSurface: [],
        },
        {
          id: 'b',
          path: 'b',
          layer: 'b',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 2,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'c',
          path: 'c',
          layer: 'c',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 1,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [
        {
          from: 'a',
          to: 'b',
          type: 'import',
          fileCount: 1,
          compliant: false,
          ruleRef: 'R1',
          message: 'bad: a→b',
        },
        {
          from: 'a',
          to: 'c',
          type: 'import',
          fileCount: 1,
          compliant: false,
          ruleRef: 'R2',
          message: 'bad: a→c',
        },
      ],
    };

    const result = violationEdges(graph);
    expect(result).toHaveLength(2);
    expect(result[0].ruleRef).toBe('R1');
    expect(result[1].ruleRef).toBe('R2');
  });
});

// ---------------------------------------------------------------------------
// changeImpact
// ---------------------------------------------------------------------------

describe('changeImpact', () => {
  it('returns depth-1 impact with direct dependents grouped as depth 1', () => {
    const graph = makeFixtureGraph();

    // Change to services → who is impacted? cli (direct), nothing at depth 2 (no one depends on cli)
    // Wait, let me re-check the graph:
    // cli → services → core, infra, utils
    // If we change 'services', then cli depends on services → cli is affected at depth 1
    // No one depends on cli → depth 2 empty, depth 3 empty
    const report = changeImpact(graph, 'src/services', 3);

    expect(report.totalAffected).toBe(1); // only cli
    expect(report.truncated).toBe(false);
    expect(report.affectedModules).toHaveLength(3); // depths 1,2,3 all present

    const depth1 = report.affectedModules.find((g) => g.depth === 1)!;
    expect(depth1.modules).toHaveLength(1);
    expect(depth1.modules[0].moduleId).toBe('src/cli');
    expect(depth1.modules[0].distance).toBe(1);

    const depth2 = report.affectedModules.find((g) => g.depth === 2)!;
    expect(depth2.modules).toHaveLength(0);

    const depth3 = report.affectedModules.find((g) => g.depth === 3)!;
    expect(depth3.modules).toHaveLength(0);
  });

  it('returns depth-2 impact with transitive dependents', () => {
    const graph = makeFixtureGraph();

    // Change core → services depends on core → services is affected at depth 1
    // cli depends on services → cli is affected at depth 2
    const report = changeImpact(graph, 'src/core', 3);

    expect(report.totalAffected).toBe(2);
    expect(report.truncated).toBe(false);

    const depth1 = report.affectedModules.find((g) => g.depth === 1)!;
    expect(depth1.modules).toHaveLength(1);
    expect(depth1.modules[0].moduleId).toBe('src/services');

    const depth2 = report.affectedModules.find((g) => g.depth === 2)!;
    expect(depth2.modules).toHaveLength(1);
    expect(depth2.modules[0].moduleId).toBe('src/cli');

    const depth3 = report.affectedModules.find((g) => g.depth === 3)!;
    expect(depth3.modules).toHaveLength(0);
  });

  it('returns depth-3 impact for a deep graph', () => {
    const graph = makeDeepGraph();

    // Chain: app → cli → services → core → types
    // Change types:
    //   depth 1: core (depends directly on types)
    //   depth 2: services (depends on core)
    //   depth 3: cli (depends on services)
    //   depth 4+: app (but capped at 3, so truncated)
    const report = changeImpact(graph, 'src/types', 3);

    expect(report.totalAffected).toBe(3); // core, services, cli (not app, beyond maxDepth)
    expect(report.truncated).toBe(true); // app at depth 4 exceeds maxDepth

    const depth1 = report.affectedModules.find((g) => g.depth === 1)!;
    expect(depth1.modules.map((m) => m.moduleId)).toEqual(['src/core']);

    const depth2 = report.affectedModules.find((g) => g.depth === 2)!;
    expect(depth2.modules.map((m) => m.moduleId)).toEqual(['src/services']);

    const depth3 = report.affectedModules.find((g) => g.depth === 3)!;
    expect(depth3.modules.map((m) => m.moduleId)).toEqual(['src/cli']);
  });

  it('resolves file paths to the containing module', () => {
    const graph = makeFixtureGraph();

    // Pass a file path inside src/services
    const report = changeImpact(graph, 'src/services/sync-service.ts', 3);

    expect(report.totalAffected).toBeGreaterThan(0);
    const d1 = report.affectedModules.find((g) => g.depth === 1)!;
    expect(d1.modules.some((m) => m.moduleId === 'src/cli')).toBe(true);
  });

  it('uses maxDepth parameter to limit BFS (custom depth 1)', () => {
    const graph = makeDeepGraph();

    // Change types with maxDepth 1 → only direct dependents
    const report = changeImpact(graph, 'src/types', 1);

    expect(report.totalAffected).toBe(1); // only core
    expect(report.truncated).toBe(true); // services at depth 2 is truncated
    expect(report.affectedModules).toHaveLength(1);
    expect(report.affectedModules[0].depth).toBe(1);
    expect(report.affectedModules[0].modules).toHaveLength(1);
    expect(report.affectedModules[0].modules[0].moduleId).toBe('src/core');
  });

  it('uses maxDepth parameter to limit BFS (custom depth 2)', () => {
    const graph = makeDeepGraph();

    const report = changeImpact(graph, 'src/types', 2);

    expect(report.totalAffected).toBe(2); // core, services
    expect(report.truncated).toBe(true); // cli at depth 3 is truncated
  });

  it('returns affectedRules for violated edges in the impact cone', () => {
    const graph = makeFixtureGraph();

    // Change core: impact cone is services (d=1), cli (d=2)
    // Edge: services → infra has a violation (ruleRef='no-services-to-infra')
    // services' from edge to infra is in the cone
    const report = changeImpact(graph, 'src/core', 3);

    // services → infra is a violating edge AND services is in the impact cone
    expect(report.affectedRules).toContain('no-services-to-infra');
  });

  it('returns empty report for an unknown file path', () => {
    const graph = makeFixtureGraph();
    const report = changeImpact(graph, 'unknown/path/file.ts');
    expect(report).toEqual({
      affectedModules: [],
      affectedRules: [],
      totalAffected: 0,
      truncated: false,
    });
  });

  it('returns empty report when changing a leaf with no reverse dependents', () => {
    const graph = makeFixtureGraph();

    // cli has no incoming edges (nothing depends on cli)
    const report = changeImpact(graph, 'src/cli', 3);

    expect(report.totalAffected).toBe(0);
    expect(report.truncated).toBe(false);
    expect(report.affectedRules).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// matchSemantic
// ---------------------------------------------------------------------------

describe('matchSemantic', () => {
  it('matches modules by role containing query term, sorted by match score', () => {
    const graph: KnowledgeGraph = {
      nodes: [
        {
          id: 'auth-service',
          path: 'src/auth',
          layer: 'auth',
          role: 'Authentication service',
          responsibilities: ['Handle login', 'Manage tokens'],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'user-module',
          path: 'src/user',
          layer: 'user',
          role: 'User profile management',
          responsibilities: ['Update profile', 'Manage user preferences'],
          invariants: [{ id: 'inv-1', description: 'Auth token must be valid', enforceable: true }],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'payment',
          path: 'src/payment',
          layer: 'payment',
          role: 'Payment processing',
          responsibilities: ['Handle payments', 'Process refunds'],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    };

    const results = matchSemantic(graph, 'auth');

    // auth-service: role contains "auth" → score 1
    // user-module: invariant description contains "auth" → score 1
    // payment: nothing → excluded

    expect(results).toHaveLength(2);

    // Both have score 1, sorted by moduleId ascending
    expect(results[0].moduleId).toBe('auth-service');
    expect(results[0].matchedFields).toContain('role');
    expect(results[0].matchedTerms).toContain('auth');
    expect(results[0].score).toBe(1);

    expect(results[1].moduleId).toBe('user-module');
    expect(results[1].matchedFields).toContain('invariants');
    expect(results[1].matchedTerms).toContain('auth');
    expect(results[1].score).toBe(1);
  });

  it('sorts results by match score descending', () => {
    const graph: KnowledgeGraph = {
      nodes: [
        {
          id: 'm1',
          path: 'm1',
          layer: 'm1',
          role: 'Authentication and authorization',
          responsibilities: ['auth login handler', 'auth logout'],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'm2',
          path: 'm2',
          layer: 'm2',
          role: 'Auth middleware serving login',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    };

    // 'auth login handler' → three AND terms
    // m1: role has "auth" and "authorization" (includes "auth"), responsibilities[0] has
    //     "auth login handler" → all three terms match → score 3
    // m2: role has "auth" and "login" but not "handler" → score 2
    const results = matchSemantic(graph, 'auth login handler');

    expect(results).toHaveLength(2);
    expect(results[0].moduleId).toBe('m1');
    expect(results[0].score).toBe(3);
    expect(results[1].moduleId).toBe('m2');
    expect(results[1].score).toBe(2);
  });

  it('applies AND logic for space-separated terms', () => {
    const graph: KnowledgeGraph = {
      nodes: [
        {
          id: 'm1',
          path: 'm1',
          layer: 'm1',
          role: 'Auth handler',
          responsibilities: ['Handle login', 'Manage sessions'],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'm2',
          path: 'm2',
          layer: 'm2',
          role: 'Auth handler with token management',
          responsibilities: ['Handle login', 'Manage token'],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    };

    // 'login token' → soft AND: both terms contribute to score
    // m1: 'login' ✓, 'token' ✗ (nothing in m1 contains "token") → score 1
    // m2: 'login' ✓ (in responsibilities), 'token' ✓ (in role["token management"]) → score 2
    const results = matchSemantic(graph, 'login token');

    expect(results).toHaveLength(2);
    expect(results[0].moduleId).toBe('m2');
    expect(results[0].score).toBe(2); // both terms matched
    expect(results[1].moduleId).toBe('m1');
    expect(results[1].score).toBe(1); // only 'login' matched
  });

  it('applies OR logic for comma-separated groups', () => {
    const graph: KnowledgeGraph = {
      nodes: [
        {
          id: 'auth-svc',
          path: 'auth-svc',
          layer: 'auth',
          role: 'Authentication service',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'pay-svc',
          path: 'pay-svc',
          layer: 'payment',
          role: 'Payment processor',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'mixed',
          path: 'mixed',
          layer: 'mixed',
          role: 'Both auth and payment',
          responsibilities: ['Handle authentication', 'Process payment'],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    };

    // 'auth, payment' → OR: match 'auth' OR 'payment'
    // auth-svc: matches 'auth' (single term group) → score 1
    // pay-svc: matches 'payment' (single term group) → score 1
    // mixed: matches 'auth' OR 'payment' — both single-term groups match → best score 1
    const results = matchSemantic(graph, 'auth, payment');

    expect(results).toHaveLength(3);
    // All score 1; sorted by moduleId ascending
    expect(results.map((r) => r.moduleId)).toEqual(['auth-svc', 'mixed', 'pay-svc']);
  });

  it('returns empty array for an empty query', () => {
    const graph = makeFixtureGraph();
    expect(matchSemantic(graph, '')).toEqual([]);
    expect(matchSemantic(graph, '   ')).toEqual([]);
  });

  it('returns empty array when no module matches', () => {
    const graph = makeFixtureGraph();
    const results = matchSemantic(graph, 'zzzNotPresent');
    expect(results).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Empty graph boundary
// ---------------------------------------------------------------------------

describe('empty graph', () => {
  const emptyGraph: KnowledgeGraph = { nodes: [], edges: [] };

  it('upstreamOf returns empty array', () => {
    expect(upstreamOf(emptyGraph, 'any')).toEqual([]);
  });

  it('downstreamOf returns empty array', () => {
    expect(downstreamOf(emptyGraph, 'any')).toEqual([]);
  });

  it('violationEdges returns empty array', () => {
    expect(violationEdges(emptyGraph)).toEqual([]);
  });

  it('changeImpact returns empty report', () => {
    expect(changeImpact(emptyGraph, 'any')).toEqual({
      affectedModules: [],
      affectedRules: [],
      totalAffected: 0,
      truncated: false,
    });
  });

  it('matchSemantic returns empty array', () => {
    expect(matchSemantic(emptyGraph, 'auth')).toEqual([]);
  });
});
