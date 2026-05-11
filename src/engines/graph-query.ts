import type { KnowledgeGraph, KnowledgeGraphEdge, KnowledgeGraphNode } from './dependency-graph.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Metadata-rich summary of a module produced by graph traversal queries. */
export interface ModuleContext {
  moduleId: string;
  path: string;
  layer: string;
  role: string;
  fanIn: number;
  violationCount: number;
  /** Number of hops from the query origin (1 = direct neighbour). */
  distance: number;
}

/** Simplified violation edge for reporting. */
export interface ViolationEdge {
  from: string;
  to: string;
  fileCount: number;
  ruleRef?: string;
  message?: string;
}

/** One depth level in a change-impact report. */
export interface AffectedModuleGroup {
  depth: number;
  modules: ModuleContext[];
}

/** Full result of a change-impact analysis. */
export interface ChangeImpactReport {
  affectedModules: AffectedModuleGroup[];
  /** IDs of every rule violated on edges in the impact cone. */
  affectedRules: string[];
  /** Total distinct modules in the impact cone (excluding the origin). */
  totalAffected: number;
  /** True when the BFS hit maxDepth and there may be more results beyond. */
  truncated: boolean;
}

/** A module matched by a semantic keyword query. */
export interface ModuleMatch {
  moduleId: string;
  path: string;
  layer: string;
  role: string;
  /** Match score = number of distinct query terms that hit. */
  score: number;
  /** Which semantic fields contributed to the match. */
  matchedFields: string[];
  /** Which query terms actually matched. */
  matchedTerms: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildNodeMap(graph: KnowledgeGraph): Map<string, KnowledgeGraphNode> {
  const map = new Map<string, KnowledgeGraphNode>();
  for (const node of graph.nodes) {
    map.set(node.id, node);
  }
  return map;
}

/** Adjacency: moduleId → list of modules it depends on (forward edges). */
function buildForwardAdjacency(graph: KnowledgeGraph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const targets = adj.get(edge.from) ?? [];
    targets.push(edge.to);
    adj.set(edge.from, targets);
  }
  return adj;
}

/** Adjacency: moduleId → list of modules that depend on it (reverse edges). */
function buildReverseAdjacency(graph: KnowledgeGraph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const dependents = adj.get(edge.to) ?? [];
    dependents.push(edge.from);
    adj.set(edge.to, dependents);
  }
  return adj;
}

function toModuleContext(node: KnowledgeGraphNode, distance: number): ModuleContext {
  return {
    moduleId: node.id,
    path: node.path,
    layer: node.layer,
    role: node.role,
    fanIn: node.fanIn,
    violationCount: node.violationCount,
    distance,
  };
}

/**
 * Resolve a file path to the module ID that contains it.
 *
 * Strategy: find the module whose `path` is the longest prefix of `filePath`.
 * If `filePath` itself is a known module ID, return it directly.
 */
function resolveToModuleId(graph: KnowledgeGraph, filePath: string): string | null {
  const nodeMap = buildNodeMap(graph);
  if (nodeMap.has(filePath)) {
    return filePath;
  }

  let bestMatch: string | null = null;
  let bestLen = 0;

  for (const node of graph.nodes) {
    const prefix = node.path + '/';
    if (filePath === node.path || filePath.startsWith(prefix)) {
      if (node.path.length > bestLen) {
        bestLen = node.path.length;
        bestMatch = node.id;
      }
    }
  }

  return bestMatch;
}

/**
 * BFS worker shared by upstreamOf, downstreamOf, and changeImpact.
 *
 * @param startId      Module to start from.
 * @param adjacency    Edge adjacency map (forward or reverse).
 * @param nodeMap      Node lookup.
 * @param maxDepth     Maximum hop distance (Infinity = unbounded).
 * @param includeStart Whether to include the start module in results.
 * @returns            ModuleContext[] ordered by BFS discovery order, and a truncated flag.
 */
function bfsTraverse(
  startId: string,
  adjacency: Map<string, string[]>,
  nodeMap: Map<string, KnowledgeGraphNode>,
  maxDepth: number = Infinity,
  _includeStart: boolean = false,
): { results: ModuleContext[]; truncated: boolean } {
  const visited = new Set<string>();
  const results: ModuleContext[] = [];
  const queue: Array<{ id: string; distance: number }> = [{ id: startId, distance: 0 }];
  visited.add(startId);
  let truncated = false;

  while (queue.length > 0) {
    const current = queue.shift()!;

    const neighbors = adjacency.get(current.id) ?? [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }

      const nextDist = current.distance + 1;

      if (nextDist > maxDepth) {
        truncated = true;
        continue;
      }

      visited.add(neighbor);
      const node = nodeMap.get(neighbor);
      if (node) {
        results.push(toModuleContext(node, nextDist));
      }
      // Enqueue even if node is missing (can happen with incomplete data)
      queue.push({ id: neighbor, distance: nextDist });
    }
  }

  return { results, truncated };
}

/**
 * Collect distinct ruleRef values from a set of edges.
 */
function collectAffectedRules(edges: KnowledgeGraphEdge[]): string[] {
  const rules = new Set<string>();
  for (const edge of edges) {
    if (edge.ruleRef) {
      rules.add(edge.ruleRef);
    }
  }
  return [...rules].sort();
}

/**
 * Build the set of module IDs found within a distance-bounded BFS cone
 * (forward adjacency), so we can filter relevant edges.
 *
 * This re-runs the same BFS reachability check used by changeImpact.
 */
function reachableModuleSet(
  originId: string,
  reverseAdj: Map<string, string[]>,
  maxDepth: number,
): Set<string> {
  const visited = new Set<string>();
  const queue: Array<{ id: string; dist: number }> = [{ id: originId, dist: 0 }];
  visited.add(originId);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const neighbors = reverseAdj.get(cur.id) ?? [];
    for (const n of neighbors) {
      if (visited.has(n)) {
        continue;
      }
      if (cur.dist + 1 > maxDepth) {
        continue;
      }
      visited.add(n);
      queue.push({ id: n, dist: cur.dist + 1 });
    }
  }

  visited.delete(originId);
  return visited;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find all modules that depend on the given module ("who depends on me").
 *
 * Uses BFS reverse-edge traversal: for edge `A → B`, B is the dependency,
 * and A is the dependent.  `upstreamOf` follows the reverse direction to
 * discover A, then A's dependents, and so on.
 */
export function upstreamOf(graph: KnowledgeGraph, moduleId: string): ModuleContext[] {
  const nodeMap = buildNodeMap(graph);
  if (!nodeMap.has(moduleId)) {
    return [];
  }

  const reverseAdj = buildReverseAdjacency(graph);
  const { results } = bfsTraverse(moduleId, reverseAdj, nodeMap);
  return results;
}

/**
 * Find all modules that the given module depends on ("who do I depend on").
 *
 * Uses BFS forward-edge traversal from the module to its direct and
 * transitive dependencies.
 */
export function downstreamOf(graph: KnowledgeGraph, moduleId: string): ModuleContext[] {
  const nodeMap = buildNodeMap(graph);
  if (!nodeMap.has(moduleId)) {
    return [];
  }

  const forwardAdj = buildForwardAdjacency(graph);
  const { results } = bfsTraverse(moduleId, forwardAdj, nodeMap);
  return results;
}

/**
 * Return every edge in the graph that is non-compliant.
 */
export function violationEdges(graph: KnowledgeGraph): ViolationEdge[] {
  return graph.edges
    .filter((e) => !e.compliant)
    .map((e) => ({
      from: e.from,
      to: e.to,
      fileCount: e.fileCount,
      ...(e.ruleRef ? { ruleRef: e.ruleRef } : {}),
      ...(e.message ? { message: e.message } : {}),
    }));
}

/**
 * Change-impact analysis.
 *
 * Given a file path or module ID, find every module that directly or
 * transitively depends on it.  Results are grouped by distance, capped at
 * `maxDepth` (default 3), and include any architectural rules violated within
 * the impact cone.
 *
 * BFS follows reverse edges (the same direction as `upstreamOf`), because a
 * change to module X affects modules that import X.
 */
export function changeImpact(
  graph: KnowledgeGraph,
  filePathOrModuleId: string,
  maxDepth: number = 3,
): ChangeImpactReport {
  const nodeMap = buildNodeMap(graph);

  // Resolve file path → module ID
  const moduleId = resolveToModuleId(graph, filePathOrModuleId);
  if (!moduleId) {
    return {
      affectedModules: [],
      affectedRules: [],
      totalAffected: 0,
      truncated: false,
    };
  }

  const reverseAdj = buildReverseAdjacency(graph);

  // Collect all reachable module IDs within the depth bound
  const reachable = reachableModuleSet(moduleId, reverseAdj, maxDepth);

  // Re-run BFS with per-depth grouping
  const visited = new Set<string>();
  const depthGroups = new Map<number, ModuleContext[]>();
  const queue: Array<{ id: string; dist: number }> = [{ id: moduleId, dist: 0 }];
  visited.add(moduleId);
  let truncated = false;

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const neighbors = reverseAdj.get(cur.id) ?? [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }

      const nextDist = cur.dist + 1;
      if (nextDist > maxDepth) {
        truncated = true;
        continue;
      }

      visited.add(neighbor);
      const node = nodeMap.get(neighbor);
      if (node) {
        const ctx = toModuleContext(node, nextDist);
        const group = depthGroups.get(nextDist) ?? [];
        group.push(ctx);
        depthGroups.set(nextDist, group);
      }
      queue.push({ id: neighbor, dist: nextDist });
    }
  }

  // Build sorted affectedModules groups
  const affectedModules: AffectedModuleGroup[] = [];
  for (let d = 1; d <= maxDepth; d++) {
    const mods = depthGroups.get(d) ?? [];
    affectedModules.push({ depth: d, modules: mods });
  }

  // Collect affected rules: only edges whose from OR to is in the reachable set,
  // plus edges originating from the changed module itself
  const affectedRules = collectAffectedRules(
    graph.edges.filter((e) => reachable.has(e.from) || reachable.has(e.to) || e.from === moduleId),
  );

  return {
    affectedModules,
    affectedRules,
    totalAffected: visited.size - 1, // exclude origin
    truncated,
  };
}

/**
 * Semantic keyword search over module nodes.
 *
 * Queries the `role`, `responsibilities`, and invariant `description` fields.
 *
 * Query syntax:
 * - Space-separated terms = AND group (score = matched terms from the group)
 * - Comma-separated groups = OR (best-matching group wins)
 *
 * Matching is case-insensitive substring.  Partial AND matches are included
 * with a lower score, so results are ranked by how many query terms hit.
 *
 * Results are sorted by score descending, then by moduleId ascending for
 * deterministic tie-breaking.
 */
export function matchSemantic(graph: KnowledgeGraph, query: string): ModuleMatch[] {
  if (!query.trim()) {
    return [];
  }

  // Split into OR groups (commas), each group is AND terms (spaces)
  const orGroups = query
    .split(',')
    .map((g) =>
      g
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0),
    )
    .filter((g) => g.length > 0);

  if (orGroups.length === 0) {
    return [];
  }

  const results: ModuleMatch[] = [];

  for (const node of graph.nodes) {
    let bestScore = 0;
    let bestMatchedTerms: string[] = [];
    let bestMatchedFields: string[] = [];

    for (const group of orGroups) {
      let groupScore = 0;
      const groupMatchedTerms: string[] = [];
      const groupMatchedFields: string[] = [];

      for (const term of group) {
        const termLower = term.toLowerCase();
        let termMatched = false;

        // Check role
        if (node.role && node.role.toLowerCase().includes(termLower)) {
          termMatched = true;
          if (!groupMatchedFields.includes('role')) {
            groupMatchedFields.push('role');
          }
        }

        // Check responsibilities
        if (node.responsibilities) {
          for (const resp of node.responsibilities) {
            if (resp && resp.toLowerCase().includes(termLower)) {
              termMatched = true;
              if (!groupMatchedFields.includes('responsibilities')) {
                groupMatchedFields.push('responsibilities');
              }
              break;
            }
          }
        }

        // Check invariants
        if (node.invariants) {
          for (const inv of node.invariants) {
            if (inv && inv.description && inv.description.toLowerCase().includes(termLower)) {
              termMatched = true;
              if (!groupMatchedFields.includes('invariants')) {
                groupMatchedFields.push('invariants');
              }
              break;
            }
          }
        }

        if (termMatched) {
          groupScore++;
          groupMatchedTerms.push(term);
        }
      }

      // Soft AND: any match count qualifies; best (highest) score wins
      if (groupScore > 0 && groupScore > bestScore) {
        bestScore = groupScore;
        bestMatchedTerms = groupMatchedTerms;
        bestMatchedFields = groupMatchedFields;
      }
    }

    if (bestScore > 0) {
      results.push({
        moduleId: node.id,
        path: node.path,
        layer: node.layer,
        role: node.role,
        score: bestScore,
        matchedFields: bestMatchedFields,
        matchedTerms: bestMatchedTerms,
      });
    }
  }

  // Sort by score descending, then by moduleId ascending for deterministic order
  results.sort((a, b) => b.score - a.score || a.moduleId.localeCompare(b.moduleId));

  return results;
}
