import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { buildGraph } from '../../../src/engines/dependency-graph.js';
import type { SpineRuleDocument } from '../../../src/types/protocol/rules.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MockDep {
  targetPath: string;
  relation: 'import' | 'reexport' | 'type-import';
  symbols: string[];
}

interface MockSpineUnit {
  filePath: string;
  role?: string;
  responsibilities?: string[];
  invariants?: Array<{ id: string; description: string; enforceable: boolean }>;
  publicSurface?: Array<{ symbolName: string; description: string }>;
  dependsOn?: MockDep[];
}

function writeSpineUnit(indexDir: string, filePath: string, unit: MockSpineUnit): void {
  const jsonPath = path.join(indexDir, filePath + '.json');
  const dir = path.dirname(jsonPath);
  fs.mkdirSync(dir, { recursive: true });

  const doc = {
    schemaVersion: '1.0.0',
    identity: {
      filePath,
      contentHash: 'abc123',
      language: 'typescript',
      fileKind: 'source',
      scope: path.dirname(filePath),
    },
    semantic: {
      role: unit.role ?? '',
      responsibilities: unit.responsibilities ?? [],
      outOfScope: [],
      invariants: unit.invariants ?? [],
      changeIntent: { architecturalIntent: null, recentChangeIntent: null },
      publicSurface: unit.publicSurface ?? [],
    },
    skeleton: {
      imports: [],
      exports: [],
      declaredSymbols: [],
      structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
    },
    graph: {
      dependsOn: unit.dependsOn ?? [],
      dependedBy: [],
      reverseIndexComplete: true,
      symbolEdges: [],
    },
    provenance: {
      indexedAt: new Date().toISOString(),
      generatorVersion: 'archspine/1.0.0',
      pipelineStages: ['ast'],
    },
  };

  fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2), 'utf-8');
}

function makeRule(
  overrides: Partial<SpineRuleDocument> & { ruleId: string; title: string },
): SpineRuleDocument {
  return {
    schemaVersion: '1.0.0',
    summary: overrides.title,
    appliesTo: [],
    severity: 'error',
    enforceable: true,
    bodyMarkdown: '',
    ...overrides,
  } as SpineRuleDocument;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildGraph', () => {
  const tempDirs: string[] = [];

  function setupIndexDir(): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-dg-'));
    tempDirs.push(root);
    return root;
  }

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  // ------------------------------------------------------------------
  // Main path
  // ------------------------------------------------------------------

  it('builds a graph from 2-3 mock SpineUnits with correct node and edge counts', () => {
    const indexDir = setupIndexDir();

    // File 1: src/engines/scanner.ts imports from src/infra/
    writeSpineUnit(indexDir, 'src/engines/scanner.ts', {
      role: 'File scanner',
      responsibilities: ['Scan all tracked files'],
      invariants: [],
      publicSurface: [{ symbolName: 'Scanner', description: 'Main scanner class' }],
      dependsOn: [
        { targetPath: '../infra/runtime-io.js', relation: 'import', symbols: ['defaultRuntimeIO'] },
      ],
    });

    // File 2: src/services/sync-service.ts imports from src/core/ and src/engines/
    writeSpineUnit(indexDir, 'src/services/sync-service.ts', {
      role: 'Sync orchestrator',
      responsibilities: ['Orchestrate sync pipeline'],
      invariants: [
        { id: 'inv-1', description: 'Must be instantiated with valid options', enforceable: true },
      ],
      publicSurface: [{ symbolName: 'SyncService', description: 'Service class' }],
      dependsOn: [
        { targetPath: '../core/pipeline.js', relation: 'import', symbols: ['TaskRunner'] },
        { targetPath: '../engines/scanner.js', relation: 'import', symbols: ['Scanner'] },
      ],
    });

    // File 3: src/cli/commands/sync.ts imports from src/services/
    writeSpineUnit(indexDir, 'src/cli/commands/sync.ts', {
      role: 'CLI sync command',
      responsibilities: ['Dispatch sync from CLI'],
      dependsOn: [
        {
          targetPath: '../../services/sync-service.js',
          relation: 'import',
          symbols: ['SyncService'],
        },
      ],
    });

    const graph = buildGraph(indexDir);

    // Nodes: src/engines, src/services, src/cli, src/core, src/infra = 5
    expect(graph.nodes).toHaveLength(5);
    // Edges: engines→infra, services→core, services→engines, cli→services = 4
    expect(graph.edges).toHaveLength(4);

    // Verify node structure
    const enginesNode = graph.nodes.find((n) => n.id === 'src/engines');
    expect(enginesNode).toBeDefined();
    expect(enginesNode!.layer).toBe('engines');
    expect(enginesNode!.role).toBe('File scanner');
    expect(enginesNode!.responsibilities).toHaveLength(1);
    expect(enginesNode!.publicSurface).toHaveLength(1);
    expect(enginesNode!.fanOut).toBe(1); // → infra
    expect(enginesNode!.fanIn).toBe(1); // ← services

    const servicesNode = graph.nodes.find((n) => n.id === 'src/services');
    expect(servicesNode).toBeDefined();
    expect(servicesNode!.fanOut).toBe(2); // → core, → engines
    expect(servicesNode!.fanIn).toBe(1); // ← cli
    expect(servicesNode!.invariants).toHaveLength(1);

    // Verify edge structure
    const e1 = graph.edges.find((e) => e.from === 'src/engines' && e.to === 'src/infra');
    expect(e1).toBeDefined();
    expect(e1!.type).toBe('import');
    expect(e1!.fileCount).toBe(1);
    expect(e1!.compliant).toBe(true); // No rules supplied

    // Single file with no deps → node should still exist
    const cliNode = graph.nodes.find((n) => n.id === 'src/cli');
    expect(cliNode).toBeDefined();
    expect(cliNode!.fanOut).toBe(1);
  });

  it('merges fileCount when multiple files in the same module import the same target', () => {
    const indexDir = setupIndexDir();

    // Two files in src/services both importing from src/infra
    writeSpineUnit(indexDir, 'src/services/sync-service.ts', {
      role: 'Sync',
      dependsOn: [{ targetPath: '../infra/runtime-io.js', relation: 'import', symbols: ['io'] }],
    });
    writeSpineUnit(indexDir, 'src/services/check-service.ts', {
      role: 'Check',
      dependsOn: [{ targetPath: '../infra/runtime-io.js', relation: 'import', symbols: ['io'] }],
    });

    const graph = buildGraph(indexDir);

    expect(graph.nodes).toHaveLength(2); // services, infra
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].from).toBe('src/services');
    expect(graph.edges[0].to).toBe('src/infra');
    expect(graph.edges[0].fileCount).toBe(2);
    expect(graph.edges[0].compliant).toBe(true);
  });

  // ------------------------------------------------------------------
  // Boundary: empty input
  // ------------------------------------------------------------------

  it('returns { nodes: [], edges: [] } for a non-existent index directory', () => {
    const graph = buildGraph('/tmp/non-existent-spine-index-abcdef');
    expect(graph).toEqual({ nodes: [], edges: [] });
  });

  it('returns { nodes: [], edges: [] } for an empty index directory', () => {
    const indexDir = setupIndexDir();
    const graph = buildGraph(indexDir);
    expect(graph).toEqual({ nodes: [], edges: [] });
  });

  // ------------------------------------------------------------------
  // Boundary: rule matching
  // ------------------------------------------------------------------

  it('marks an edge as non-compliant when a rule forbids the dependency', () => {
    const indexDir = setupIndexDir();

    // services imports cli
    writeSpineUnit(indexDir, 'src/services/sync-service.ts', {
      role: 'Sync',
      dependsOn: [
        {
          targetPath: '../cli/commands/sync.js',
          relation: 'import',
          symbols: ['executeSyncCommand'],
        },
      ],
    });
    writeSpineUnit(indexDir, 'src/cli/commands/sync.ts', {
      role: 'CLI sync',
    });

    const rules: SpineRuleDocument[] = [
      makeRule({
        ruleId: 'no-services-to-cli',
        title: 'Services must not depend on CLI',
        severity: 'error',
        enforceable: true,
        appliesTo: ['src/services/**'],
        bodyMarkdown:
          'Services should not import or depend on cli modules. CLI is an entrypoint layer.',
      }),
    ];

    const graph = buildGraph(indexDir, rules);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].from).toBe('src/services');
    expect(graph.edges[0].to).toBe('src/cli');
    expect(graph.edges[0].compliant).toBe(false);
    expect(graph.edges[0].ruleRef).toBe('no-services-to-cli');
    expect(graph.edges[0].message).toContain('cli');
    expect(graph.edges[0].message).toContain('no-services-to-cli');

    // violationCount should be reflected on the source node
    const servicesNode = graph.nodes.find((n) => n.id === 'src/services');
    expect(servicesNode!.violationCount).toBe(1);
  });

  it('marks edge as compliant when rule does not apply to the from module', () => {
    const indexDir = setupIndexDir();

    // engines imports infra (engines is NOT covered by this rule)
    writeSpineUnit(indexDir, 'src/engines/scanner.ts', {
      role: 'Scanner',
      dependsOn: [{ targetPath: '../infra/runtime-io.js', relation: 'import', symbols: ['io'] }],
    });
    writeSpineUnit(indexDir, 'src/infra/runtime-io.ts', {
      role: 'Runtime IO',
    });

    const rules: SpineRuleDocument[] = [
      makeRule({
        ruleId: 'no-cli-to-infra',
        title: 'CLI must not depend on infra',
        severity: 'error',
        enforceable: true,
        appliesTo: ['src/cli/**'],
        bodyMarkdown: 'CLI entrypoints must not directly depend on infra modules.',
      }),
    ];

    const graph = buildGraph(indexDir, rules);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].compliant).toBe(true); // Rule does not apply to engines
  });

  it('skips non-enforceable rules during compliance checking', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'src/services/sync-service.ts', {
      role: 'Sync',
      dependsOn: [{ targetPath: '../cli/commands/sync.js', relation: 'import', symbols: ['cmd'] }],
    });
    writeSpineUnit(indexDir, 'src/cli/commands/sync.ts', {
      role: 'CLI',
    });

    const rules: SpineRuleDocument[] = [
      makeRule({
        ruleId: 'advisory-only',
        title: 'Services should prefer not to import CLI',
        severity: 'advisory',
        enforceable: false,
        appliesTo: ['src/services/**'],
        bodyMarkdown: 'Services should not depend on cli.',
      }),
    ];

    const graph = buildGraph(indexDir, rules);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].compliant).toBe(true); // Non-enforceable → always compliant
  });

  // ------------------------------------------------------------------
  // Boundary: single file
  // ------------------------------------------------------------------

  it('produces a single node and zero edges for a single-file repo with no deps', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'src/index.ts', {
      role: 'Entry point',
      dependsOn: [], // No dependencies
    });

    const graph = buildGraph(indexDir);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].id).toBe('src');
    expect(graph.nodes[0].layer).toBe('src');
    expect(graph.edges).toHaveLength(0);
    expect(graph.nodes[0].fanIn).toBe(0);
    expect(graph.nodes[0].fanOut).toBe(0);
    expect(graph.nodes[0].violationCount).toBe(0);
  });

  // ------------------------------------------------------------------
  // Boundary: data resilience
  // ------------------------------------------------------------------

  it('treats graph.dependsOn === undefined as an empty array', () => {
    const indexDir = setupIndexDir();

    // Write a unit without graph at all (simulates undefined dependsOn)
    const jsonPath = path.join(indexDir, 'src/lib/helper.ts.json');
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({
        schemaVersion: '1.0.0',
        identity: {
          filePath: 'src/lib/helper.ts',
          contentHash: 'abc',
          language: 'typescript',
          fileKind: 'source',
          scope: 'src/lib',
        },
        semantic: {
          role: 'Helper',
          responsibilities: [],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [],
        },
        skeleton: {
          imports: [],
          exports: [],
          declaredSymbols: [],
          structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
        },
        // graph key is deliberately omitted
        provenance: {
          indexedAt: new Date().toISOString(),
          generatorVersion: 'archspine/1.0.0',
          pipelineStages: ['ast'],
        },
      }),
      'utf-8',
    );

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].id).toBe('src/lib'); // D1: lib is a direct child of src/
    expect(graph.edges).toHaveLength(0);
  });

  it('handles missing semantic field with empty defaults', () => {
    const indexDir = setupIndexDir();

    const jsonPath = path.join(indexDir, 'src/engines/bare.ts.json');
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({
        schemaVersion: '1.0.0',
        identity: {
          filePath: 'src/engines/bare.ts',
          contentHash: 'abc',
          language: 'typescript',
          fileKind: 'source',
          scope: 'src/engines',
        },
        // semantic key is deliberately omitted
        skeleton: {
          imports: [],
          exports: [],
          declaredSymbols: [],
          structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
        },
        graph: { dependsOn: [], dependedBy: [], reverseIndexComplete: true, symbolEdges: [] },
        provenance: {
          indexedAt: new Date().toISOString(),
          generatorVersion: 'archspine/1.0.0',
          pipelineStages: ['ast'],
        },
      }),
      'utf-8',
    );

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(1);
    const node = graph.nodes[0];
    expect(node.role).toBe('');
    expect(node.responsibilities).toEqual([]);
    expect(node.invariants).toEqual([]);
    expect(node.publicSurface).toEqual([]);
  });

  it('handles dependsOn entries with missing edgeProvenance gracefully', () => {
    const indexDir = setupIndexDir();

    // Write a unit where dependsOn has NO edgeProvenance (as seen in real data)
    const jsonPath = path.join(indexDir, 'src/engines/consumer.ts.json');
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({
        schemaVersion: '1.0.0',
        identity: {
          filePath: 'src/engines/consumer.ts',
          contentHash: 'abc',
          language: 'typescript',
          fileKind: 'source',
          scope: 'src/engines',
        },
        semantic: {
          role: 'Consumer',
          responsibilities: [],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [],
        },
        skeleton: {
          imports: [],
          exports: [],
          declaredSymbols: [],
          structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
        },
        graph: {
          dependsOn: [
            {
              targetPath: '../infra/runtime-io.js',
              relation: 'import',
              symbols: ['defaultRuntimeIO'],
              // edgeProvenance is intentionally absent (matches real-world data)
            },
          ],
          dependedBy: [],
          reverseIndexComplete: true,
          symbolEdges: [],
        },
        provenance: {
          indexedAt: new Date().toISOString(),
          generatorVersion: 'archspine/1.0.0',
          pipelineStages: ['ast'],
        },
      }),
      'utf-8',
    );
    writeSpineUnit(indexDir, 'src/infra/runtime-io.ts', { role: 'IO' });

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].from).toBe('src/engines');
    expect(graph.edges[0].to).toBe('src/infra');
  });

  // ------------------------------------------------------------------
  // Boundary: external and intra-module deps
  // ------------------------------------------------------------------

  it('excludes external dependencies (npm packages, Node built-ins) from module edges', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'src/engines/scanner.ts', {
      role: 'Scanner',
      dependsOn: [
        { targetPath: 'picomatch', relation: 'import', symbols: ['picomatch'] },
        { targetPath: 'fs', relation: 'import', symbols: ['*'] },
        { targetPath: 'path', relation: 'import', symbols: ['*'] },
      ],
    });

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(1); // Only the engines node
    expect(graph.edges).toHaveLength(0); // No edges for external deps
  });

  it('excludes intra-module edges (self-references within the same module)', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'src/engines/scanner.ts', {
      role: 'Scanner',
      dependsOn: [
        { targetPath: './scanner-utils.js', relation: 'import', symbols: ['normalizePath'] },
      ],
    });
    writeSpineUnit(indexDir, 'src/engines/scanner-utils.ts', {
      role: 'Scanner utils',
    });

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(1); // Both files in the same module 'src/engines'
    expect(graph.edges).toHaveLength(0); // Intra-module edge is skipped
  });

  // ------------------------------------------------------------------
  // Edge: fanIn / fanOut computation
  // ------------------------------------------------------------------

  it('correctly computes fanIn and fanOut for all nodes', () => {
    const indexDir = setupIndexDir();

    // Layout:
    //   cli → services → core
    //                ↘ infra
    writeSpineUnit(indexDir, 'src/cli/main.ts', {
      role: 'CLI',
      dependsOn: [
        { targetPath: '../services/sync-service.js', relation: 'import', symbols: ['sync'] },
      ],
    });
    writeSpineUnit(indexDir, 'src/services/sync-service.ts', {
      role: 'Sync',
      dependsOn: [
        { targetPath: '../core/pipeline.js', relation: 'import', symbols: ['TaskRunner'] },
        { targetPath: '../infra/runtime-io.js', relation: 'import', symbols: ['io'] },
      ],
    });
    writeSpineUnit(indexDir, 'src/core/pipeline.ts', { role: 'Pipeline' });
    writeSpineUnit(indexDir, 'src/infra/runtime-io.ts', { role: 'IO' });

    const graph = buildGraph(indexDir);

    const cli = graph.nodes.find((n) => n.id === 'src/cli')!;
    const services = graph.nodes.find((n) => n.id === 'src/services')!;
    const core = graph.nodes.find((n) => n.id === 'src/core')!;
    const infra = graph.nodes.find((n) => n.id === 'src/infra')!;

    expect(cli.fanIn).toBe(0);
    expect(cli.fanOut).toBe(1);

    expect(services.fanIn).toBe(1);
    expect(services.fanOut).toBe(2);

    expect(core.fanIn).toBe(1);
    expect(core.fanOut).toBe(0);

    expect(infra.fanIn).toBe(1);
    expect(infra.fanOut).toBe(0);
  });

  // ------------------------------------------------------------------
  // Edge: root-level files and non-src modules
  // ------------------------------------------------------------------

  it('handles root-level files (outside src/) as root module', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'CLAUDE.md', {
      role: 'Project instructions',
    });

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].id).toBe('root');
    expect(graph.nodes[0].layer).toBe('root');
  });

  it('handles test files as a separate module', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'tests/unit/scanner.test.ts', {
      role: 'Scanner tests',
      dependsOn: [
        { targetPath: '../../src/engines/scanner.js', relation: 'import', symbols: ['Scanner'] },
      ],
    });
    writeSpineUnit(indexDir, 'src/engines/scanner.ts', {
      role: 'Scanner',
    });

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(2);

    const testNode = graph.nodes.find((n) => n.id === 'tests');
    expect(testNode).toBeDefined();
    expect(testNode!.layer).toBe('tests');
    expect(testNode!.fanOut).toBe(1);

    const engineNode = graph.nodes.find((n) => n.id === 'src/engines');
    expect(engineNode!.fanIn).toBe(1);

    const edge = graph.edges[0];
    expect(edge.from).toBe('tests');
    expect(edge.to).toBe('src/engines');
  });

  // ------------------------------------------------------------------
  // Edge: corrupt/invalid JSON files are silently skipped
  // ------------------------------------------------------------------

  it('skips corrupt JSON files without throwing', () => {
    const indexDir = setupIndexDir();

    // Write a valid file and a corrupt one
    writeSpineUnit(indexDir, 'src/good.ts', { role: 'Good file' });

    const badPath = path.join(indexDir, 'src/bad.ts.json');
    fs.mkdirSync(path.dirname(badPath), { recursive: true });
    fs.writeFileSync(badPath, '{ not valid json @@@', 'utf-8');

    const graph = buildGraph(indexDir);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].id).toBe('src');
  });

  // ------------------------------------------------------------------
  // Module ID: D1 strategy
  // ------------------------------------------------------------------

  it('aggregates files under src/ by immediate child directory', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'src/engines/scanner.ts', { role: 'Scanner' });
    writeSpineUnit(indexDir, 'src/engines/rules.ts', { role: 'Rules' });
    writeSpineUnit(indexDir, 'src/services/sync.ts', { role: 'Sync' });
    writeSpineUnit(indexDir, 'src/services/check.ts', { role: 'Check' });

    const graph = buildGraph(indexDir);

    expect(graph.nodes).toHaveLength(2);
    const ids = graph.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(['src/engines', 'src/services']);
  });

  it('aggregates deeply nested files under the correct src/ child', () => {
    const indexDir = setupIndexDir();

    writeSpineUnit(indexDir, 'src/cli/commands/sync.ts', { role: 'CLI sync' });
    writeSpineUnit(indexDir, 'src/cli/commands/publish.ts', { role: 'CLI publish' });
    writeSpineUnit(indexDir, 'src/infra/llm/providers/openai.ts', { role: 'OpenAI provider' });

    const graph = buildGraph(indexDir);

    const ids = graph.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(['src/cli', 'src/infra']);
  });
});
