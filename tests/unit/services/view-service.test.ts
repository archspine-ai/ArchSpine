import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ViewService } from '../../../src/services/view/view-service.js';
import {
  CURRENT_SCHEMA_VERSION,
  GENERATOR_VERSION,
  type SpineUnit,
} from '../../../src/types/protocol.js';

function writeIndexedUnit(
  rootDir: string,
  filePath: string,
  unit: SpineUnit,
  content: string,
): void {
  const sourcePath = path.join(rootDir, filePath);
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.writeFileSync(sourcePath, content);

  const indexPath = path.join(rootDir, '.spine', 'index', `${filePath}.json`);
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(unit, null, 2));
}

function createUnit(filePath: string, overrides: Partial<SpineUnit> = {}): SpineUnit {
  const scope = path.dirname(filePath) === '.' ? '' : path.dirname(filePath);
  const unit: SpineUnit = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    identity: {
      filePath,
      contentHash: `hash-${filePath}`,
      language: 'typescript',
      fileKind: 'source',
      scope,
    },
    semantic: {
      role: `Role for ${filePath}`,
      responsibilities: [],
      outOfScope: [],
      invariants: [],
      changeIntent: {
        architecturalIntent: null,
        recentChangeIntent: null,
      },
      publicSurface: [],
    },
    skeleton: {
      imports: [],
      exports: [],
      declaredSymbols: [],
      structuralHints: {
        importCount: 0,
        exportCount: 0,
        isBarrel: false,
        isTypeOnly: false,
      },
    },
    graph: {
      dependsOn: [],
      dependedBy: [],
      reverseIndexComplete: true,
      symbolEdges: [],
    },
    provenance: {
      indexedAt: '2026-04-13T00:00:00.000Z',
      generatorVersion: GENERATOR_VERSION,
      pipelineStages: ['ast', 'llm'],
    },
  };

  return {
    ...unit,
    ...overrides,
    identity: {
      ...unit.identity,
      ...(overrides.identity || {}),
    },
    semantic: {
      ...unit.semantic,
      ...(overrides.semantic || {}),
    },
    skeleton: {
      ...unit.skeleton,
      ...(overrides.skeleton || {}),
      structuralHints: {
        ...unit.skeleton.structuralHints,
        ...(overrides.skeleton?.structuralHints || {}),
      },
    },
    graph: {
      ...unit.graph,
      ...(overrides.graph || {}),
    },
    provenance: {
      ...unit.provenance,
      ...(overrides.provenance || {}),
    },
  };
}

describe('view service', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-view-service-'));
    fs.mkdirSync(path.join(testDir, '.spine', 'index'), { recursive: true });
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('extracts and ranks public surface candidates from explicit entry signals', () => {
    writeIndexedUnit(
      testDir,
      'src/cli/index.ts',
      createUnit('src/cli/index.ts', {
        semantic: {
          role: 'CLI root entry',
          responsibilities: ['Dispatches top-level commands'],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [{ symbolName: 'run', description: 'Run CLI commands' }],
        },
        skeleton: {
          imports: [],
          exports: [{ name: 'run', kind: 'function', signature: '() => void' }],
          declaredSymbols: [],
          structuralHints: { importCount: 0, exportCount: 1, isBarrel: false, isTypeOnly: false },
        },
        graph: {
          dependsOn: [],
          dependedBy: [
            {
              targetPath: 'src/bootstrap.ts',
              relation: 'import',
              edgeProvenance: 'ast',
              symbols: ['run'],
            },
          ],
          reverseIndexComplete: true,
          symbolEdges: [],
        },
      }),
      'export function run() {}\n',
    );

    writeIndexedUnit(
      testDir,
      'src/infra/mcp/tools.ts',
      createUnit('src/infra/mcp/tools.ts', {
        semantic: {
          role: 'MCP tool registry',
          responsibilities: ['Registers MCP tools'],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [{ symbolName: 'registerTools', description: 'Register MCP tools' }],
        },
        skeleton: {
          imports: [],
          exports: [{ name: 'registerTools', kind: 'function', signature: '() => void' }],
          declaredSymbols: [],
          structuralHints: { importCount: 0, exportCount: 1, isBarrel: false, isTypeOnly: false },
        },
      }),
      'export function registerTools() {}\n',
    );

    writeIndexedUnit(
      testDir,
      'src/internal/helper.ts',
      createUnit('src/internal/helper.ts', {
        semantic: {
          role: 'Internal helper',
          responsibilities: [],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [],
        },
        skeleton: {
          imports: [],
          exports: [{ name: 'helper', kind: 'function', signature: '() => void' }],
          declaredSymbols: [],
          structuralHints: { importCount: 0, exportCount: 1, isBarrel: false, isTypeOnly: false },
        },
      }),
      'export function helper() {}\n',
    );

    const saved = new Map<string, unknown>();
    const service = new ViewService(
      testDir,
      {
        saveView: (fileName: string, data: unknown) => {
          saved.set(fileName, data);
        },
        saveViewMarkdown: (fileName: string, content: string) => {
          saved.set(fileName, content);
        },
      },
      undefined,
    );

    const result = service.deriveSelectedViews();

    expect(result.publicSurfaceCount).toBeGreaterThanOrEqual(2);
    const publicSurface = saved.get('public-surface.json') as {
      items: Array<{ entrypoint: string; kind: string; symbols: string[] }>;
    };
    expect(publicSurface.items[0].entrypoint).toBe('src/cli/index.ts');
    expect(
      publicSurface.items.some(
        (item) => item.entrypoint === 'src/infra/mcp/tools.ts' && item.kind === 'mcp',
      ),
    ).toBe(true);
    expect(publicSurface.items.some((item) => item.entrypoint === 'src/internal/helper.ts')).toBe(
      false,
    );
  });

  it('builds risk hotspots with transparent additive scoring factors', () => {
    const dependedBy = Array.from({ length: 4 }, (_, index) => ({
      targetPath: `src/feature-${index}.ts`,
      relation: 'import' as const,
      edgeProvenance: 'ast' as const,
      symbols: ['shared'],
    }));

    const dependsOn = [
      {
        targetPath: 'src/core/state.ts',
        relation: 'import' as const,
        edgeProvenance: 'ast' as const,
        symbols: ['state'],
      },
      {
        targetPath: 'schemas/project.schema.json',
        relation: 'import' as const,
        edgeProvenance: 'ast' as const,
        symbols: ['schema'],
      },
    ];

    writeIndexedUnit(
      testDir,
      'src/core/shared.ts',
      createUnit('src/core/shared.ts', {
        semantic: {
          role: 'Shared coordination module',
          responsibilities: ['Coordinates state changes'],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [{ symbolName: 'shared', description: 'Shared entry' }],
          ruleViolations: [
            { id: 'no-direct-db', severity: 'warning', reason: 'Crosses a layer boundary' },
          ],
          driftDetected: true,
          driftReason: 'Role expanded beyond previous responsibility.',
        },
        skeleton: {
          imports: [],
          exports: [{ name: 'shared', kind: 'function', signature: '() => void' }],
          declaredSymbols: [],
          structuralHints: { importCount: 8, exportCount: 1, isBarrel: false, isTypeOnly: false },
        },
        graph: {
          dependsOn,
          dependedBy,
          reverseIndexComplete: true,
          symbolEdges: [],
        },
      }),
      `${Array.from({ length: 280 }, (_, index) => `line-${index}`).join('\n')}\n`,
    );

    writeIndexedUnit(
      testDir,
      'src/core/state.ts',
      createUnit('src/core/state.ts'),
      'export const state = {};\n',
    );

    writeIndexedUnit(
      testDir,
      'schemas/project.schema.json',
      createUnit('schemas/project.schema.json', {
        identity: {
          filePath: 'schemas/project.schema.json',
          contentHash: 'hash-schemas/project.schema.json',
          language: 'unsupported',
          fileKind: 'config',
          scope: 'schemas',
        },
      }),
      '{ "type": "object" }\n',
    );

    const saveView = vi.fn();
    const saveViewMarkdown = vi.fn();
    const saveViewHtml = vi.fn();
    const service = new ViewService(
      testDir,
      { saveView, saveViewMarkdown, saveViewHtml },
      undefined,
    );
    const result = service.deriveSelectedViews();

    expect(result.riskHotspotCount).toBeGreaterThanOrEqual(1);
    const riskEnvelope = saveView.mock.calls.find(
      (call) => call[0] === 'risk-hotspots.json',
    )?.[1] as {
      items: Array<{
        hotspotPath: string;
        riskFactors: string[];
        totalScore: number;
        scoreBreakdown: Array<{ factor: string }>;
      }>;
    };
    expect(riskEnvelope.items[0].hotspotPath).toBe('src/core/shared.ts');
    expect(riskEnvelope.items[0].riskFactors).toContain('fan-in');
    expect(
      riskEnvelope.items[0].scoreBreakdown.some((item) => item.factor === 'semantic-change'),
    ).toBe(true);
    expect(riskEnvelope.items[0].totalScore).toBeGreaterThanOrEqual(20);
    expect(saveViewMarkdown).toHaveBeenCalledWith(
      'risk-hotspots.md',
      expect.stringContaining('# Risk Hotspots Report'),
    );
  });

  it('keeps re-export amplification in the public surface scorer through the shared candidate builder', () => {
    writeIndexedUnit(
      testDir,
      'src/public/api.ts',
      createUnit('src/public/api.ts', {
        semantic: {
          role: 'Public API module',
          responsibilities: ['Expose package API'],
          outOfScope: [],
          invariants: [],
          changeIntent: { architecturalIntent: null, recentChangeIntent: null },
          publicSurface: [{ symbolName: 'api', description: 'Public api export' }],
        },
        skeleton: {
          imports: [],
          exports: [{ name: 'api', kind: 'function', signature: '() => void' }],
          declaredSymbols: [],
          structuralHints: { importCount: 0, exportCount: 1, isBarrel: false, isTypeOnly: false },
        },
      }),
      'export function api() {}\n',
    );

    writeIndexedUnit(
      testDir,
      'src/index.ts',
      createUnit('src/index.ts', {
        graph: {
          dependsOn: [
            {
              targetPath: 'src/public/api.ts',
              relation: 'reexport',
              edgeProvenance: 'ast',
              symbols: ['api'],
            },
          ],
          dependedBy: [],
          reverseIndexComplete: true,
          symbolEdges: [],
        },
      }),
      "export { api } from './public/api.js';\n",
    );

    const saved = new Map<string, unknown>();
    const service = new ViewService(
      testDir,
      {
        saveView: (fileName: string, data: unknown) => saved.set(fileName, data),
        saveViewMarkdown: vi.fn(),
      },
      undefined,
    );

    service.derivePublicSurfaceView();
    const publicSurface = saved.get('public-surface.json') as {
      items: Array<{ entrypoint: string; scoreBreakdown: Array<{ factor: string }> }>;
    };

    const apiEntry = publicSurface.items.find((item) => item.entrypoint === 'src/public/api.ts');
    expect(apiEntry).toBeDefined();
    expect(apiEntry?.scoreBreakdown.some((item) => item.factor === 'reexport-amplification')).toBe(
      true,
    );
  });

  it('derives an architecture diagram SVG from a knowledge graph', async () => {
    // Seed a minimal knowledge-graph.json (normally produced by KnowledgeGraphTask)
    const viewDir = path.join(testDir, '.spine', 'view');
    fs.mkdirSync(path.join(viewDir, 'data'), { recursive: true });
    fs.writeFileSync(
      path.join(viewDir, 'data', 'knowledge-graph.json'),
      JSON.stringify({
        nodes: [
          {
            id: 'src/cli',
            path: 'src/cli',
            layer: 'cli',
            role: 'CLI entry point',
            responsibilities: ['Command dispatch'],
            invariants: [],
            fanIn: 0,
            fanOut: 2,
            violationCount: 0,
            publicSurface: ['index.ts'],
          },
          {
            id: 'src/services',
            path: 'src/services',
            layer: 'services',
            role: 'Runtime services',
            responsibilities: ['Sync orchestration'],
            invariants: [],
            fanIn: 1,
            fanOut: 1,
            violationCount: 0,
            publicSurface: ['sync-service.ts'],
          },
          {
            id: 'src/infra',
            path: 'src/infra',
            layer: 'infra',
            role: 'Infrastructure layer',
            responsibilities: ['Config', 'LLM', 'Output'],
            invariants: [],
            fanIn: 1,
            fanOut: 0,
            violationCount: 0,
            publicSurface: ['output.ts'],
          },
        ],
        edges: [
          { from: 'src/cli', to: 'src/services', type: 'import', fileCount: 1, compliant: true },
          { from: 'src/services', to: 'src/infra', type: 'import', fileCount: 1, compliant: true },
        ],
      }),
    );

    const saveView = vi.fn();
    const saveViewMarkdown = vi.fn();
    const saveViewHtml = vi.fn();
    const service = new ViewService(testDir, { saveView, saveViewMarkdown, saveViewHtml });

    const result = await service.deriveArchitectureDiagramView();

    expect(result.generated).toBe(true);
    // SVG is written to view/pages/ via saveViewMarkdown
    expect(saveViewMarkdown).toHaveBeenCalledWith(
      'architecture-diagram.svg',
      expect.stringContaining('<svg'),
    );
    expect(saveView).toHaveBeenCalledWith(
      'architecture-diagram.json',
      expect.objectContaining({
        title: 'Architecture Diagram',
      }),
    );
  });

  it('skips architecture diagram generation when knowledge-graph.json is missing', async () => {
    // No knowledge-graph.json — the producer should skip gracefully
    const saveView = vi.fn();
    const saveViewMarkdown = vi.fn();
    const saveViewHtml = vi.fn();
    const service = new ViewService(testDir, { saveView, saveViewMarkdown, saveViewHtml });

    const result = await service.deriveArchitectureDiagramView();

    expect(result.generated).toBe(false);
    expect(result.reason).toContain('knowledge-graph.json');
    expect(saveViewMarkdown).not.toHaveBeenCalled();
    expect(saveViewHtml).not.toHaveBeenCalled();
    expect(saveView).not.toHaveBeenCalledWith('architecture-diagram.json', expect.anything());
  });

  it('skips unsupported indexed units and warns that a rebuild is required', () => {
    const warn = vi.fn();
    writeIndexedUnit(
      testDir,
      'src/cli/index.ts',
      createUnit('src/cli/index.ts', {
        schemaVersion: '9.9.9',
      }),
      'export function unsupported() {}\n',
    );

    const service = new ViewService(
      testDir,
      {
        saveView: vi.fn(),
        saveViewMarkdown: vi.fn(),
        saveViewHtml: vi.fn(),
        deleteViewArtifacts: vi.fn(),
      },
      { info: vi.fn(), warn } as any,
    );

    const result = service.deriveSelectedViews();

    expect(result.publicSurfaceCount).toBe(0);
    expect(result.riskHotspotCount).toBe(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('expects "1.0.0"'));
  });
});
