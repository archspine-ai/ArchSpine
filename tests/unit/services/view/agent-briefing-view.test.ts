import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { agentBriefingProducer } from '../../../../src/services/view/agent-briefing-view.js';
import { OutputManager } from '../../../../src/infra/output.js';
import type { ViewContext, ViewOutputManager } from '../../../../src/services/view/producer.js';
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('agentBriefingProducer', () => {
  const tempDirs: string[] = [];

  function setupTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-ab-'));
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
  // Main path: full markdown with all 6 sections
  // ------------------------------------------------------------------

  it('Main Path: produces markdown with all 6 sections when all data is present', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    // Write config.json
    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'TestProject', locales: ['en-US', 'zh-CN'] },
    });

    // Write knowledge-graph.json
    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src/core',
          path: 'src/core',
          layer: 'core',
          role: 'Core logic',
          responsibilities: ['Handle pipeline'],
          invariants: [],
          fanIn: 1,
          fanOut: 2,
          violationCount: 1,
          publicSurface: [{ symbolName: 'Runner', description: 'Pipeline runner' }],
        },
        {
          id: 'src/cli',
          path: 'src/cli',
          layer: 'cli',
          role: 'CLI entry',
          responsibilities: ['Parse commands'],
          invariants: [],
          fanIn: 0,
          fanOut: 1,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [
        {
          from: 'src/cli',
          to: 'src/core',
          type: 'import',
          fileCount: 1,
          compliant: false,
          ruleRef: 'no-cli-to-core',
          message: 'cli → core violates no-cli-to-core',
        },
        {
          from: 'src/core',
          to: 'src/cli',
          type: 'import',
          fileCount: 1,
          compliant: true,
        },
      ],
    });

    // Write diagnostics
    writeJson(spineDir, 'view/data/diagnostics/cycles.json', [
      { cycleId: 'src/core → src/cli → src/core', nodes: ['src/core', 'src/cli'], length: 2 },
    ]);
    writeJson(spineDir, 'view/data/diagnostics/dead-code.json', []);
    writeJson(spineDir, 'view/data/diagnostics/hubs.json', [
      { moduleId: 'src/core', fanIn: 1, percentile: 100 },
    ]);

    // Write languages.json
    writeJson(spineDir, 'languages.json', {
      languages: {
        TypeScript: { extensions: ['.ts', '.tsx'], status: 'available' },
        JavaScript: { extensions: ['.js', '.jsx'], status: 'available' },
      },
      detectedExtensions: ['.ts', '.js', '.json'],
    });

    // Write public-surface.json
    writeJson(spineDir, 'view/data/public-surface.json', {
      items: [
        { id: 'cmd-sync', entrypoint: 'spine sync', kind: 'cli', summary: 'Sync repository' },
        { id: 'mcp-search', entrypoint: 'search_index', kind: 'mcp', summary: 'Search index' },
      ],
    });

    // Write rules
    const rulesDir = path.join(spineDir, 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    fs.writeFileSync(
      path.join(rulesDir, 'no-core-to-cli.yml'),
      [
        '- rule: No core to CLI dependency',
        '  scope: src/core/**',
        '  constraint: Core must not depend on CLI',
        '  severity: error',
        '  reason: CLI is an entrypoint layer',
      ].join('\n'),
      'utf-8',
    );

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

    const result = await agentBriefingProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.viewType).toBe('agent-briefing');
    expect(result.metrics.moduleCount).toBe(2);
    expect(result.metrics.edgeCount).toBe(2);
    expect(result.metrics.violationCount).toBe(1);
    expect(result.metrics.cycleCount).toBe(1);
    expect(result.metrics.deadCodeCount).toBe(0);
    expect(result.metrics.hubCount).toBe(1);
    expect(result.metrics.hasKnowledgeGraph).toBe(1);
    expect(result.metrics.hasDiagnostics).toBe(1);

    // Verify markdown was saved to .spine/view/pages/agent-briefing.md
    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    expect(fs.existsSync(mdPath)).toBe(true);
    const markdown = fs.readFileSync(mdPath, 'utf-8');

    // Verify JSON was saved to .spine/view/data/agent-briefing.json
    const jsonPath = path.join(spineDir, 'view', 'data', 'agent-briefing.json');
    expect(fs.existsSync(jsonPath)).toBe(true);
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    expect(jsonData.viewType).toBe('agent-briefing');
    expect(jsonData.schemaVersion).toBeTruthy();
    expect(jsonData.items).toHaveLength(1);
    expect(jsonData.items[0].project.name).toBe('TestProject');
    expect(jsonData.items[0].moduleTopology).toHaveLength(2);
    expect(jsonData.items[0].healthSummary.edgeViolations).toBeGreaterThanOrEqual(0);
    expect(jsonData.items[0].architectureConstraints).toHaveLength(1);
    expect(jsonData.items[0].architectureConstraints[0].ruleId).toBe('no-core-to-cli-dependency');
    expect(jsonData.items[0].entryPoints).toBeDefined();

    // Check all 6 sections
    expect(markdown).toContain('# TestProject');
    expect(markdown).toContain('## Project Definition');
    expect(markdown).toContain('## Tech Stack');
    expect(markdown).toContain('## Entry Point Map');
    expect(markdown).toContain('## Module Topology');
    expect(markdown).toContain('## Architecture Constraints');
    expect(markdown).toContain('## Health Summary');
    expect(markdown).toContain('*Generated at');
    expect(markdown).toContain('ArchSpine agent-briefing view producer');
  });

  // ------------------------------------------------------------------
  // Graceful degradation: missing optional data
  // ------------------------------------------------------------------

  it('degradation: handles missing knowledge-graph.json gracefully', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    // Only write config.json
    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'Minimal', locales: ['en-US'] },
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

    const result = await agentBriefingProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.metrics.moduleCount).toBe(0);
    expect(result.metrics.hasKnowledgeGraph).toBe(0);
    expect(result.metrics.hasDiagnostics).toBe(0);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('Minimal');
    // Topology should show unavailable message
    expect(markdown).toContain('Module topology data not available');
  });

  it('degradation: handles missing diagnostics gracefully', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'NoDiag' },
    });

    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src',
          path: 'src',
          layer: 'src',
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
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await agentBriefingProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.metrics.hasDiagnostics).toBe(0);
    expect(result.metrics.cycleCount).toBe(0);
    expect(result.metrics.deadCodeCount).toBe(0);
    expect(result.metrics.hubCount).toBe(0);
  });

  it('degradation: handles missing public-surface.json', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'NoPublic' },
    });
    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src',
          path: 'src',
          layer: 'src',
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
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await agentBriefingProducer.derive(ctx);

    expect(result.generated).toBe(true);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('Public surface data not available');
  });

  it('degradation: handles missing rules directory', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'NoRules' },
    });
    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src',
          path: 'src',
          layer: 'src',
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
        getIndexedUnits: vi.fn().mockReturnValue([]),
        loadProjectUnit: vi.fn().mockReturnValue(null),
        loadFolderUnits: vi.fn().mockReturnValue([]),
      },
      outputManager: outputManager as unknown as ViewOutputManager,
      runtimeIO: io,
      isFullSync: true,
    };

    const result = await agentBriefingProducer.derive(ctx);
    expect(result.generated).toBe(true);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('No rules directory found');
  });

  // ------------------------------------------------------------------
  // Edge cases: empty graph, no violations, no cycles
  // ------------------------------------------------------------------

  it('handles empty knowledge graph with zero violations and cycles', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'CleanProject' },
    });
    writeJson(spineDir, 'view/data/knowledge-graph.json', { nodes: [], edges: [] });
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

    const result = await agentBriefingProducer.derive(ctx);

    expect(result.generated).toBe(true);
    expect(result.metrics.violationCount).toBe(0);
    expect(result.metrics.cycleCount).toBe(0);
    expect(result.metrics.moduleCount).toBe(0);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');

    // Should show zeros for all health metrics
    expect(markdown).toContain('| Dependency edge violations | 0 |');
    expect(markdown).toContain('| Cyclic dependencies detected | 0 |');
    expect(markdown).toContain('| Dead code candidates | 0 |');
  });

  it('falls back to directory name when project name not in config', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: {},
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

    const result = await agentBriefingProducer.derive(ctx);
    expect(result.generated).toBe(true);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    // Should use the temp directory name (last segment)
    const dirName = path.basename(rootDir);
    expect(markdown).toContain(`# ${dirName}`);
  });

  // ------------------------------------------------------------------
  // Section: tech stack
  // ------------------------------------------------------------------

  it('renders tech stack from languages.json', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'TechTest' },
    });
    writeJson(spineDir, 'view/data/knowledge-graph.json', { nodes: [], edges: [] });
    writeJson(spineDir, 'languages.json', {
      languages: {
        TypeScript: { extensions: ['.ts', '.tsx'], status: 'available' },
        Go: { extensions: ['.go'], status: 'available' },
      },
      detectedExtensions: ['.ts', '.go', '.zig'],
    });
    writeJson(spineDir, 'view/data/public-surface.json', { items: [] });

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

    await agentBriefingProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('TypeScript');
    expect(markdown).toContain('.ts');
    expect(markdown).toContain('Go');
    expect(markdown).toContain('.go');
    expect(markdown).toContain('Unregistered extensions');
    expect(markdown).toContain('.zig');
  });

  it('renders languages not available message when languages.json missing', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'NoLang' },
    });
    writeJson(spineDir, 'view/data/knowledge-graph.json', { nodes: [], edges: [] });

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

    await agentBriefingProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('Language data not available');
  });

  // ------------------------------------------------------------------
  // Section: entry points
  // ------------------------------------------------------------------

  it('renders entry points grouped by kind', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'EntryTest' },
    });
    writeJson(spineDir, 'view/data/knowledge-graph.json', { nodes: [], edges: [] });
    writeJson(spineDir, 'view/data/public-surface.json', {
      items: [
        { id: 'cmd-a', entrypoint: 'spine sync', kind: 'cli', summary: 'Sync' },
        { id: 'cmd-b', entrypoint: 'spine check', kind: 'cli', summary: 'Check' },
        { id: 'mcp-x', entrypoint: 'get_graph', kind: 'mcp', summary: 'Get graph' },
      ],
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

    await agentBriefingProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('### CLI Commands');
    expect(markdown).toContain('spine sync');
    expect(markdown).toContain('spine check');
    expect(markdown).toContain('### MCP Tools');
    expect(markdown).toContain('get_graph');
  });

  // ------------------------------------------------------------------
  // Section: violation edges
  // ------------------------------------------------------------------

  it('annotates violation edges in the topology table', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'ViolationTest' },
    });
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
          violationCount: 1,
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
      edges: [
        {
          from: 'src/a',
          to: 'src/b',
          type: 'import',
          fileCount: 1,
          compliant: false,
          ruleRef: 'no-a-to-b',
          message: 'A must not depend on B',
        },
      ],
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

    await agentBriefingProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('### Violation Edges');
    expect(markdown).toContain('no-a-to-b');
    expect(markdown).toContain('A must not depend on B');
  });

  // ------------------------------------------------------------------
  // Section: multiple cycles in health summary
  // ------------------------------------------------------------------

  it('shows cycle details in health summary', async () => {
    const rootDir = setupTempDir();
    const spineDir = path.join(rootDir, '.spine');

    writeJson(spineDir, 'config.json', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project: { name: 'CycleTest' },
    });
    writeJson(spineDir, 'view/data/knowledge-graph.json', {
      nodes: [
        {
          id: 'src/a',
          path: 'src/a',
          layer: 'a',
          role: 'A',
          responsibilities: [],
          invariants: [],
          fanIn: 1,
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
          fanOut: 1,
          violationCount: 0,
          publicSurface: [],
        },
      ],
      edges: [
        { from: 'src/a', to: 'src/b', type: 'import', fileCount: 1, compliant: true },
        { from: 'src/b', to: 'src/a', type: 'import', fileCount: 1, compliant: true },
      ],
    });
    writeJson(spineDir, 'view/data/diagnostics/cycles.json', [
      { cycleId: 'src/a → src/b → src/a', nodes: ['src/a', 'src/b'], length: 2 },
    ]);
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

    await agentBriefingProducer.derive(ctx);

    const mdPath = path.join(spineDir, 'view', 'pages', 'agent-briefing.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    expect(markdown).toContain('### Cyclic Dependencies');
    expect(markdown).toContain('src/a → src/b → src/a');
  });
});
