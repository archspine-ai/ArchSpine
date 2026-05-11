import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { projectHealthProducer } from '../../../../src/services/view/project-health-view.js';
import { OutputManager } from '../../../../src/infra/output.js';
import type { ViewContext, ViewOutputManager } from '../../../../src/services/view/producer.js';
import type { LoadedUnit } from '../../../../src/services/view/types.js';
import { CURRENT_SCHEMA_VERSION } from '../../../../src/types/protocol.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function writeJson(dir: string, fileName: string, data: unknown): void {
  const fullPath = path.join(dir, fileName);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

function mockRuntimeIO() {
  return {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    confirm: vi.fn().mockResolvedValue(true),
  };
}

function makeUnit(
  filePath: string,
  ruleViolations?: Array<{ id: string; severity: string }>,
): LoadedUnit {
  return {
    unit: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      identity: {
        filePath,
        contentHash: `hash-${filePath}`,
        language: 'typescript',
        fileKind: 'source',
        scope: path.dirname(filePath),
      },
      semantic: {
        role: `Role for ${filePath}`,
        responsibilities: [],
        outOfScope: [],
        invariants: [],
        changeIntent: { architecturalIntent: null, recentChangeIntent: null },
        publicSurface: [],
        ruleViolations,
      },
      skeleton: {
        imports: [],
        exports: [],
        declaredSymbols: [],
        structuralHints: { importCount: 0, exportCount: 0, isBarrel: false, isTypeOnly: false },
      },
      graph: {
        dependsOn: [],
        dependedBy: [],
        reverseIndexComplete: true,
        symbolEdges: [],
      },
      provenance: {
        indexedAt: new Date().toISOString(),
        generatorVersion: 'archspine/1.0.0',
        pipelineStages: ['ast'],
      },
    },
    lineCount: 10,
  } as LoadedUnit;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('projectHealthProducer', () => {
  const tempDirs: string[] = [];

  function setupTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-ph-'));
    tempDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // Main path: full markdown with all 5 sections
  // ------------------------------------------------------------------

  it('Main Path: produces markdown with all 5 sections when all data is present', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    // Write knowledge-graph.json
    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src/services',
          path: 'src/services',
          layer: 'services',
          role: 'Services',
          responsibilities: ['Orchestration'],
          invariants: [],
          fanIn: 2,
          fanOut: 3,
          violationCount: 1,
          publicSurface: [],
        },
        {
          id: 'src/cli',
          path: 'src/cli',
          layer: 'cli',
          role: 'CLI',
          responsibilities: ['Commands'],
          invariants: [],
          fanIn: 0,
          fanOut: 1,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'src/core',
          path: 'src/core',
          layer: 'core',
          role: 'Core',
          responsibilities: ['Pipeline'],
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
          fileCount: 1,
          compliant: false,
          ruleRef: 'no-cli-to-services',
        },
        {
          from: 'src/services',
          to: 'src/core',
          type: 'import',
          fileCount: 2,
          compliant: true,
        },
        {
          from: 'src/core',
          to: 'src/services',
          type: 'import',
          fileCount: 1,
          compliant: true,
        },
      ],
    });

    // Write diagnostics - one cycle, one dead code, one hub
    writeJson(spineDir, 'view/data/diagnostics/cycles.json', [
      {
        cycleId: 'src/core → src/services → src/core',
        nodes: ['src/core', 'src/services'],
        length: 2,
      },
    ]);
    writeJson(spineDir, 'view/data/diagnostics/dead-code.json', [
      { moduleId: 'src/cli', reason: 'No incoming edges', confidence: 'low' },
    ]);
    writeJson(spineDir, 'view/data/diagnostics/hubs.json', [
      { moduleId: 'src/services', fanIn: 3, percentile: 95 },
    ]);

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi
          .fn()
          .mockReturnValue([
            makeUnit('src/services.ts', [{ id: 'R1', severity: 'error' }]),
            makeUnit('src/cli.ts', [{ id: 'R2', severity: 'warning' }]),
          ]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await projectHealthProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.viewType).toBe('project-health');
    expect(result.metrics.moduleCount).toBe(3);
    expect(result.metrics.edgeCount).toBe(3);
    expect(result.metrics.cycleCount).toBe(1);
    expect(result.metrics.deadCodeSuspectCount).toBe(1);
    expect(result.metrics.hubCount).toBe(1);
    expect(result.metrics.distinctViolationTypes).toBe(2);

    // Verify markdown was saved
    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    expect(fs.existsSync(mdPath)).toBe(true);
    const markdown = fs.readFileSync(mdPath, 'utf-8');

    // Verify JSON was saved
    const jsonPath = path.join(spineDir, 'view', 'data', 'project-health.json');
    expect(fs.existsSync(jsonPath)).toBe(true);
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    expect(jsonData.viewType).toBe('project-health');
    expect(jsonData.schemaVersion).toBeTruthy();
    expect(jsonData.items).toHaveLength(1);
    expect(jsonData.items[0].topology.moduleCount).toBe(3);
    expect(jsonData.items[0].topology.nonCompliantEdgeCount).toBe(1);
    expect(jsonData.items[0].cycles).toHaveLength(1);
    expect(jsonData.items[0].deadCode).toHaveLength(1);
    expect(jsonData.items[0].hubs).toHaveLength(1);
    expect(jsonData.items[0].violations).toHaveLength(2);

    // Check all 5 sections
    expect(markdown).toContain('# Project Health Report');
    expect(markdown).toContain('## Topology Overview');
    expect(markdown).toContain('## Cycle Dependencies');
    expect(markdown).toContain('## Suspicious Dead Code');
    expect(markdown).toContain('## Hub Module Risks');
    expect(markdown).toContain('## Active Violations Summary');

    // Check topology metrics
    expect(markdown).toContain('- **Modules**: 3');
    expect(markdown).toContain('- **Dependency edges**: 3');
    expect(markdown).toContain('- **Non-compliant edges**: 1');

    // Check cycle content
    expect(markdown).toContain('src/core → src/services → src/core');

    // Check dead code
    expect(markdown).toContain('src/cli');
    expect(markdown).toContain('No incoming edges');

    // Check hub
    expect(markdown).toContain('src/services');
    expect(markdown).toContain('95');

    // Check violations
    expect(markdown).toContain('R1');
    expect(markdown).toContain('R2');
  });

  // ------------------------------------------------------------------
  // Graceful degradation: missing data
  // ------------------------------------------------------------------

  it('degradation: handles missing knowledge-graph.json gracefully', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await projectHealthProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.metrics.moduleCount).toBe(0);
    expect(result.metrics.edgeCount).toBe(0);

    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('Topology data unavailable');
  });

  it('degradation: handles missing diagnostics gracefully', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src/mod',
          path: 'src/mod',
          layer: 'mod',
          role: 'M',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await projectHealthProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.metrics.cycleCount).toBe(0);
    expect(result.metrics.deadCodeSuspectCount).toBe(0);
    expect(result.metrics.hubCount).toBe(0);

    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('No cycle dependencies detected');
    expect(markdown).toContain('No suspicious dead code detected');
    expect(markdown).toContain('No hub module risks detected');
  });

  // ------------------------------------------------------------------
  // Edge cases: zero violations, zero cycles
  // ------------------------------------------------------------------

  it('renders zero-state for clean project with no issues', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src/a',
          path: 'src/a',
          layer: 'a',
          role: 'A',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 1,
          violationCount: 0,
          publicSurface: [],
        },
        {
          id: 'src/b',
          path: 'src/b',
          layer: 'b',
          role: 'B',
          responsibilities: [],
          invariants: [],
          fanIn: 1,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [{ from: 'src/a', to: 'src/b', type: 'import', fileCount: 1, compliant: true }],
    });
    writeJson(spineDir, 'view/data/diagnostics/cycles.json', []);
    writeJson(spineDir, 'view/data/diagnostics/dead-code.json', []);
    writeJson(spineDir, 'view/data/diagnostics/hubs.json', []);

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await projectHealthProducer.derive(ctx);

    expect(result.generated).toBe(true);

    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');

    expect(markdown).toContain('- **Compliant edge ratio**: 100.0%');
    expect(markdown).toContain('- **Non-compliant edges**: 0');
    expect(markdown).toContain('No cycle dependencies detected');
    expect(markdown).toContain('No active rule violations detected');
  });

  // ------------------------------------------------------------------
  // Violations aggregation
  // ------------------------------------------------------------------

  it('aggregates violations across indexed units', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src/mod',
          path: 'src/mod',
          layer: 'mod',
          role: 'M',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([
          makeUnit('src/a.ts', [
            { id: 'R1', severity: 'error' },
            { id: 'R1', severity: 'error' },
          ]),
          makeUnit('src/b.ts', [{ id: 'R1', severity: 'error' }]),
          makeUnit('src/c.ts', [{ id: 'R2', severity: 'warning' }]),
        ]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await projectHealthProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.metrics.distinctViolationTypes).toBe(2);

    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');

    // R1 should have count 3
    expect(markdown).toContain('| R1 | error | 3 |');
    expect(markdown).toContain('| R2 | warning | 1 |');
  });

  // ------------------------------------------------------------------
  // Hub risk hints
  // ------------------------------------------------------------------

  it('renders risk hints for hub modules based on percentile', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'hub',
          path: 'hub',
          layer: 'hub',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 10,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    });
    writeJson(spineDir, 'view/data/diagnostics/hubs.json', [
      { moduleId: 'hub', fanIn: 10, percentile: 97 },
    ]);

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    await projectHealthProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('hub');
    expect(markdown).toContain('10');
    expect(markdown).toContain('97');
    expect(markdown).toContain('Critical hub');
  });

  // ------------------------------------------------------------------
  // No hub modules with fanIn < 2
  // ------------------------------------------------------------------

  it('filters out insignificant hubs with fanIn < 2', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'mod',
          path: 'mod',
          layer: 'mod',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 1,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    });
    writeJson(spineDir, 'view/data/diagnostics/hubs.json', [
      { moduleId: 'mod', fanIn: 1, percentile: 100 },
    ]);

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    await projectHealthProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('No modules with significant fan-in detected');
  });

  // ------------------------------------------------------------------
  // Violations: empty case
  // ------------------------------------------------------------------

  it('renders no violations message when no units have violations', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'm',
          path: 'm',
          layer: 'm',
          role: '',
          responsibilities: [],
          invariants: [],
          fanIn: 0,
          fanOut: 0,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [],
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([makeUnit('src/clean.ts', [])]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    await projectHealthProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'project-health.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('No active rule violations detected');
  });

  // ------------------------------------------------------------------
  // Edge case: empty graph, empty all
  // ------------------------------------------------------------------

  it('handles completely empty project gracefully', async () => {
    const rootDir = setupTempDir();

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx: ViewContext = {
      rootDir,
      loader: {
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await projectHealthProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.metrics.moduleCount).toBe(0);
    expect(result.metrics.distinctViolationTypes).toBe(0);
  });
});
