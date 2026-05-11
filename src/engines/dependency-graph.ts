import * as fs from 'fs';
import * as path from 'path';
import picomatch from 'picomatch';
import type { SpineRuleDocument } from '../types/protocol/rules.js';
import type { Invariant, PublicSurfaceEntry } from '../types/protocol/index-documents.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnowledgeGraphNode {
  /** Module identifier (e.g. "src/engines", "tests", "root"). */
  id: string;
  /** Filesystem path prefix for the module. */
  path: string;
  /** Architectural layer name derived from the module path. */
  layer: string;
  /** Aggregated semantic role (first non-empty value across module files). */
  role: string;
  /** Merged responsibilities from all files in the module. */
  responsibilities: string[];
  /** Merged invariants from all files in the module. */
  invariants: Invariant[];
  /** Number of incoming module-level edges. */
  fanIn: number;
  /** Number of outgoing module-level edges. */
  fanOut: number;
  /** Number of outgoing edges that violate an enforceable rule. */
  violationCount: number;
  /** Merged public surface entries across module files. */
  publicSurface: PublicSurfaceEntry[];
}

export interface KnowledgeGraphEdge {
  /** Source module ID. */
  from: string;
  /** Target module ID. */
  to: string;
  /** Edge kind (always "import" for module-level edges). */
  type: 'import';
  /** Number of file-level imports merged into this module-level edge. */
  fileCount: number;
  /** Whether the dependency complies with all enforceable rules. */
  compliant: boolean;
  /** ID of the first violated rule, if non-compliant. */
  ruleRef?: string;
  /** Human-readable violation description, if non-compliant. */
  message?: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// ---------------------------------------------------------------------------
// SpineUnit shape (subset used at runtime – avoids coupling to the full type)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Directory names that represent known architectural layers. */
const KNOWN_LAYERS = [
  'cli',
  'services',
  'core',
  'tasks',
  'engines',
  'infra',
  'types',
  'utils',
  'ast',
  'runtime',
  'tests',
  'root',
];

// ---------------------------------------------------------------------------
// Helpers – file / module resolution
// ---------------------------------------------------------------------------

/** Returns true when targetPath is an external dependency (npm, Node built-in, bare specifier). */
function isExternalDependency(targetPath: string): boolean {
  return !targetPath.startsWith('.') && !targetPath.startsWith('/');
}

/**
 * Resolve a relative `targetPath` against the directory of `fromFilePath`.
 * Returns the canonical POSIX path WITHOUT a file extension.
 */
function resolveTargetFilePath(fromFilePath: string, targetPath: string): string {
  const fromDir = path.posix.dirname(fromFilePath);
  const resolved = path.posix.normalize(path.posix.join(fromDir, targetPath));
  return resolved.replace(/\.(?:js|ts|jsx|tsx|mjs|cjs)$/, '');
}

/**
 * D1 module aggregation strategy.
 *
 * 1. Directories containing a `package.json` → aggregated by package name.
 * 2. Otherwise, files under `src/` → aggregated by the immediate child directory of `src/`.
 * 3. Everything else → aggregated by the top-level directory name.
 */
export function getModuleId(filePath: string, rootDir?: string): string {
  const parts = filePath.split('/');

  if (parts[0] === 'src') {
    if (parts.length <= 2) {
      // File directly in src/ (no subdirectory) → module is 'src'
      return 'src';
    }
    // File in src/<subdir>/... → module is 'src/<subdir>'
    const childDir = parts[1];
    // Check for package.json (strategy 1)
    if (rootDir && packageJsonExists(rootDir, `src/${childDir}`)) {
      return `src/${childDir}`; // Package name is the directory name for simplicity
    }
    return `src/${childDir}`; // Strategy 2: src/ direct child
  }

  if (parts.length > 1) {
    return parts[0]; // Top-level directory
  }

  return 'root'; // Root-level file
}

function packageJsonExists(rootDir: string, dirPath: string): boolean {
  try {
    return fs.existsSync(path.join(rootDir, dirPath, 'package.json'));
  } catch {
    return false;
  }
}

/** Extract a human-readable layer name from a module ID. */
function getLayerName(moduleId: string): string {
  if (moduleId === 'root' || !moduleId.includes('/')) {
    return moduleId;
  }
  return moduleId.split('/').pop() || moduleId;
}

// ---------------------------------------------------------------------------
// Helpers – rule compliance
// ---------------------------------------------------------------------------

/**
 * Extract layer names that appear in a restrictive/negative context within
 * a rule's constraint text.
 *
 * This is a best-effort deterministic parser. It checks whether each known
 * layer name is mentioned near negating keywords.
 */
function extractForbiddenLayers(constraintBody: string): string[] {
  const forbidden: string[] = [];
  const lower = constraintBody.toLowerCase();
  const negPattern =
    /must not|should not|cannot|without|decoupled|instead of|avoid|forbidden|restrict|must stay|should stay|independent of/i;

  for (const layer of KNOWN_LAYERS) {
    const layerLower = layer.toLowerCase();
    const idx = lower.indexOf(layerLower);
    if (idx === -1) {
      continue;
    }

    // Check 80-char context window around the layer mention
    const start = Math.max(0, idx - 80);
    const end = Math.min(lower.length, idx + layerLower.length + 80);
    const context = lower.slice(start, end);

    if (negPattern.test(context)) {
      forbidden.push(layer);
    }
  }

  return forbidden;
}

/**
 * Determine whether a module-level edge is compliant with the provided
 * architectural rules.
 */
function checkEdgeCompliance(
  fromModule: string,
  toModule: string,
  fromLayer: string,
  toLayer: string,
  rules: SpineRuleDocument[],
): { compliant: boolean; ruleRef?: string; message?: string } {
  for (const rule of rules) {
    if (!rule.enforceable) {
      continue;
    }

    // Does the rule's appliesTo scope cover files in fromModule?
    const fromPfx = fromModule + '/';
    const matchesFrom = rule.appliesTo.some((glob) => {
      if (glob.startsWith('!')) {
        return false;
      }
      return picomatch(glob)(fromPfx + 'dummy.ts');
    });

    if (!matchesFrom) {
      continue;
    }

    // Check if the target layer is mentioned as forbidden in the constraint
    const forbiddenLayers = extractForbiddenLayers(rule.bodyMarkdown);
    if (forbiddenLayers.includes(toLayer)) {
      return {
        compliant: false,
        ruleRef: rule.ruleId,
        message: `${fromLayer} → ${toLayer} violates ${rule.ruleId}: ${rule.title}`,
      };
    }
  }

  return { compliant: true };
}

// ---------------------------------------------------------------------------
// Helpers – index traversal
// ---------------------------------------------------------------------------

interface IndexEntry {
  /** Reconstructed source file path (e.g. "src/engines/rules.ts"). */
  filePath: string;
  /** Absolute path to the index JSON file on disk. */
  jsonPath: string;
}

/** Walk the index directory tree and collect all source-file JSON entries. */
function walkIndexJson(dir: string, baseDir: string = dir): IndexEntry[] {
  const results: IndexEntry[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkIndexJson(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Skip directory-level aggregate documents
      if (entry.name === 'folder.json' || entry.name === 'project.json') {
        continue;
      }

      const relativePath = path.relative(baseDir, fullPath);
      // Strip .json suffix to reconstruct the original file path
      const filePath = relativePath.replace(/\.json$/, '');
      results.push({ filePath, jsonPath: fullPath });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Internal state accumulation
// ---------------------------------------------------------------------------

interface FileEdgeAccumulator {
  targetModule: string;
  relation: string;
}

interface ModuleAggregation {
  files: Set<string>;
  role: string;
  responsibilities: string[];
  invariants: Invariant[];
  publicSurface: PublicSurfaceEntry[];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a module-level knowledge graph from `.spine/index/** /*.json` files.
 *
 * @param indexDir   Absolute path to the `.spine/index/` directory.
 * @param rules      Architectural rules loaded from `.spine/rules/`.
 * @param rootDir    Repository root (used for package.json probes in D1 strategy).
 * @returns          A {@link KnowledgeGraph} with module nodes and edges.
 */
export function buildGraph(
  indexDir: string,
  rules: SpineRuleDocument[] = [],
  rootDir?: string,
): KnowledgeGraph {
  // 3a: empty repository — no index directory
  if (!fs.existsSync(indexDir)) {
    return { nodes: [], edges: [] };
  }

  const entries = walkIndexJson(indexDir);
  if (entries.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Per-file edge lists: filePath → [{targetModule, relation}]
  const fileEdges = new Map<string, FileEdgeAccumulator[]>();
  // Per-file semantic snapshot
  const fileSemantics = new Map<string, SpineUnitSemantic>();

  for (const { jsonPath } of entries) {
    let raw: string;
    try {
      raw = fs.readFileSync(jsonPath, 'utf-8');
    } catch {
      continue;
    }

    let unit: SpineUnitLike;
    try {
      unit = JSON.parse(raw) as SpineUnitLike;
    } catch {
      continue;
    }

    const identity = unit.identity;
    const semantic = unit.semantic || {};
    const dependsOn = unit.graph?.dependsOn ?? [];

    // 3c: dependsOn undefined → treat as empty array (handled above with ?? [])
    if (!identity?.filePath) {
      continue;
    }

    // 3b: missing semantic → empty string / empty array (handled via defaults)
    fileSemantics.set(identity.filePath, {
      role: semantic.role ?? '',
      responsibilities: semantic.responsibilities ?? [],
      invariants: semantic.invariants ?? [],
      publicSurface: semantic.publicSurface ?? [],
    });

    // Resolve file-level dependencies
    const accum: FileEdgeAccumulator[] = [];
    for (const dep of dependsOn) {
      const tp = dep.targetPath;
      if (!tp) {
        continue;
      }

      // 3d: external dependencies → skip module edges
      if (isExternalDependency(tp)) {
        continue;
      }

      const targetFile = resolveTargetFilePath(identity.filePath, tp);
      const sourceMod = getModuleId(identity.filePath, rootDir);
      const targetMod = getModuleId(targetFile, rootDir);

      // Intra-module edges are implicit — skip
      if (targetMod === sourceMod) {
        continue;
      }

      accum.push({ targetModule: targetMod, relation: dep.relation || 'import' });
    }

    if (accum.length > 0) {
      fileEdges.set(identity.filePath, accum);
    }

    // Register the file in its module even if it has no edges (for node creation)
    if (!fileSemantics.has(identity.filePath)) {
      fileSemantics.set(identity.filePath, {});
    }
  }

  // ------------------------------------------------------------------
  // Aggregation: file-level edges → module-level edges
  // ------------------------------------------------------------------

  // moduleId → Map<targetModuleId, fileCount>
  const moduleEdgeAgg = new Map<string, Map<string, number>>();
  // moduleId → Set<filePath>
  const moduleFiles = new Map<string, Set<string>>();

  for (const [filePath, edges] of fileEdges) {
    const sourceMod = getModuleId(filePath, rootDir);

    if (!moduleFiles.has(sourceMod)) {
      moduleFiles.set(sourceMod, new Set());
    }
    moduleFiles.get(sourceMod)!.add(filePath);

    if (!moduleEdgeAgg.has(sourceMod)) {
      moduleEdgeAgg.set(sourceMod, new Map());
    }
    const tmap = moduleEdgeAgg.get(sourceMod)!;

    for (const e of edges) {
      tmap.set(e.targetModule, (tmap.get(e.targetModule) || 0) + 1);
    }
  }

  // Also register files with no edges so they still produce a node
  for (const filePath of fileSemantics.keys()) {
    const mod = getModuleId(filePath, rootDir);
    if (!moduleFiles.has(mod)) {
      moduleFiles.set(mod, new Set());
    }
    moduleFiles.get(mod)!.add(filePath);
  }

  // ------------------------------------------------------------------
  // Build edges with compliance checking
  // ------------------------------------------------------------------

  const edges: KnowledgeGraphEdge[] = [];
  const violationByModule = new Map<string, number>();
  const fanInByModule = new Map<string, number>();
  const fanOutByModule = new Map<string, number>();

  for (const [sourceMod, targets] of moduleEdgeAgg) {
    for (const [targetMod, fileCount] of targets) {
      const fromLayer = getLayerName(sourceMod);
      const toLayer = getLayerName(targetMod);
      const compliance = checkEdgeCompliance(sourceMod, targetMod, fromLayer, toLayer, rules);

      edges.push({
        from: sourceMod,
        to: targetMod,
        type: 'import',
        fileCount,
        compliant: compliance.compliant,
        ...(compliance.ruleRef ? { ruleRef: compliance.ruleRef } : {}),
        ...(compliance.message ? { message: compliance.message } : {}),
      });

      // Update fan in/out counters
      fanInByModule.set(targetMod, (fanInByModule.get(targetMod) || 0) + 1);
      fanOutByModule.set(sourceMod, (fanOutByModule.get(sourceMod) || 0) + 1);

      if (!compliance.compliant) {
        violationByModule.set(sourceMod, (violationByModule.get(sourceMod) || 0) + 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Build nodes
  // ------------------------------------------------------------------

  const allModules = new Set<string>();
  for (const e of edges) {
    allModules.add(e.from);
    allModules.add(e.to);
  }
  for (const mod of moduleFiles.keys()) {
    allModules.add(mod);
  }

  const nodes: KnowledgeGraphNode[] = [];
  for (const modId of allModules) {
    // Aggregate semantics from all files in the module
    const mod: ModuleAggregation = {
      files: moduleFiles.get(modId) || new Set(),
      role: '',
      responsibilities: [],
      invariants: [],
      publicSurface: [],
    };

    for (const fp of mod.files) {
      const sem = fileSemantics.get(fp);
      if (!sem) {
        continue;
      }

      // First non-empty role wins
      if (!mod.role && sem.role) {
        mod.role = sem.role;
      }
      if (sem.responsibilities) {
        mod.responsibilities.push(...sem.responsibilities);
      }
      if (sem.invariants) {
        mod.invariants.push(...sem.invariants);
      }
      if (sem.publicSurface) {
        mod.publicSurface.push(...sem.publicSurface);
      }
    }

    nodes.push({
      id: modId,
      path: modId,
      layer: getLayerName(modId),
      role: mod.role,
      responsibilities: mod.responsibilities,
      invariants: mod.invariants,
      fanIn: fanInByModule.get(modId) || 0,
      fanOut: fanOutByModule.get(modId) || 0,
      violationCount: violationByModule.get(modId) || 0,
      publicSurface: mod.publicSurface,
    });
  }

  return { nodes, edges };
}
