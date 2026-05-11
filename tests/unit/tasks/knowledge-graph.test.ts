import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { KnowledgeGraphTask } from '../../../src/tasks/knowledge-graph.js';
import { OutputManager } from '../../../src/infra/output.js';
import type { TaskContext } from '../../../src/core/task.js';
import type { CommitStageOutput } from '../../../src/core/task-types.js';
import { CURRENT_SCHEMA_VERSION } from '../../../src/types/protocol.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MockDep {
  targetPath: string;
  relation?: string;
  symbols?: string[];
}

interface MockFileSpec {
  filePath: string;
  role?: string;
  responsibilities?: string[];
  dependsOn?: MockDep[];
}

function writeSpineUnit(indexDir: string, filePath: string, spec: MockFileSpec): void {
  const jsonPath = path.join(indexDir, filePath + '.json');
  const dir = path.dirname(jsonPath);
  fs.mkdirSync(dir, { recursive: true });

  const doc = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    identity: {
      filePath,
      contentHash: `hash-${filePath}`,
      language: 'typescript',
      fileKind: 'source',
      scope: path.dirname(filePath),
    },
    semantic: {
      role: spec.role || `Role for ${filePath}`,
      responsibilities: spec.responsibilities || [],
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
      dependsOn: spec.dependsOn || [],
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

function makeCommitStageOutput(overrides?: Partial<CommitStageOutput>): CommitStageOutput {
  return {
    selection: { filteredFiles: [], affectedDirs: new Set() },
    committedFiles: [],
    committedCount: 0,
    ...overrides,
  };
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

describe('KnowledgeGraphTask', () => {
  const tempDirs: string[] = [];

  function setupTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-kg-'));
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
  // Main path
  // ------------------------------------------------------------------

  it('Main Path: builds graph from index files, runs diagnostics, and saves outputs', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    // Write two index units with a dependency edge
    // Add a third file that imports from engines so engines has fanIn > 0
    writeSpineUnit(indexDir, 'src/engines/scanner.ts', {
      role: 'Scanner',
      responsibilities: ['Scan files'],
      dependsOn: [
        { targetPath: '../infra/runtime-io.js', relation: 'import', symbols: ['defaultRuntimeIO'] },
      ],
    });

    writeSpineUnit(indexDir, 'src/infra/runtime-io.ts', {
      role: 'Runtime IO',
      responsibilities: ['Logging'],
    });

    writeSpineUnit(indexDir, 'src/services/sync-service.ts', {
      role: 'Sync service',
      responsibilities: ['Orchestrate'],
      dependsOn: [
        { targetPath: '../engines/scanner.js', relation: 'import', symbols: ['Scanner'] },
      ],
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi
          .fn()
          .mockReturnValue([
            'src/engines/scanner.ts',
            'src/infra/runtime-io.ts',
            'src/services/sync-service.ts',
          ]),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Verify knowledge-graph.json was saved
    const kgPath = path.join(rootDir, '.spine', 'view', 'data', 'knowledge-graph.json');
    expect(fs.existsSync(kgPath)).toBe(true);
    const kg = JSON.parse(fs.readFileSync(kgPath, 'utf-8'));
    expect(kg.nodes.length).toBe(3);
    expect(kg.edges.length).toBe(2);
    // Both edges should exist (order may vary)
    const edgeKeys = kg.edges.map((e: { from: string; to: string }) => `${e.from}→${e.to}`);
    expect(edgeKeys).toContain('src/engines→src/infra');
    expect(edgeKeys).toContain('src/services→src/engines');

    // Verify diagnostics files
    const cyclesPath = path.join(rootDir, '.spine', 'view', 'data', 'diagnostics', 'cycles.json');
    const deadCodePath = path.join(
      rootDir,
      '.spine',
      'view',
      'data',
      'diagnostics',
      'dead-code.json',
    );
    const hubsPath = path.join(rootDir, '.spine', 'view', 'data', 'diagnostics', 'hubs.json');
    expect(fs.existsSync(cyclesPath)).toBe(true);
    expect(fs.existsSync(deadCodePath)).toBe(true);
    expect(fs.existsSync(hubsPath)).toBe(true);

    // Verify cycles is empty for a simple two-node graph
    const cycles = JSON.parse(fs.readFileSync(cyclesPath, 'utf-8'));
    expect(cycles).toHaveLength(0);

    // Verify health flags were written to index files
    expect(ctx.manifest.updateFileStatusWithDocs).toHaveBeenCalledTimes(3);

    // Verify index files were updated with health flags
    const updatedScannerPath = path.join(indexDir, 'src/engines/scanner.ts.json');
    const updatedScanner = JSON.parse(fs.readFileSync(updatedScannerPath, 'utf-8'));
    expect(updatedScanner.healthFlags).toBeDefined();
    expect(updatedScanner.healthFlags.fanIn).toBe(1); // services → engines
    expect(updatedScanner.healthFlags.inCycle).toBe(false);
    expect(updatedScanner.healthFlags.isDeadCodeSuspect).toBe(false);
    // isHub may be true with a small graph — hub detection tested separately
  });

  it('Main Path: detects cycles and writes them to diagnostics', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    // Create a cycle between modules: src/a → src/b → src/a
    writeSpineUnit(indexDir, 'src/a/module-a.ts', {
      role: 'Module A',
      dependsOn: [{ targetPath: '../b/module-b.js', relation: 'import', symbols: ['B'] }],
    });
    writeSpineUnit(indexDir, 'src/b/module-b.ts', {
      role: 'Module B',
      dependsOn: [{ targetPath: '../a/module-a.js', relation: 'import', symbols: ['A'] }],
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi.fn().mockReturnValue(['src/a/module-a.ts', 'src/b/module-b.ts']),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Verify cycles detected
    const cyclesPath = path.join(rootDir, '.spine', 'view', 'data', 'diagnostics', 'cycles.json');
    const cycles = JSON.parse(fs.readFileSync(cyclesPath, 'utf-8'));
    expect(cycles.length).toBeGreaterThanOrEqual(1);

    // Verify health flags indicate cycle participation
    const aPath = path.join(indexDir, 'src/a/module-a.ts.json');
    const aUnit = JSON.parse(fs.readFileSync(aPath, 'utf-8'));
    expect(aUnit.healthFlags.inCycle).toBe(true);
    expect(aUnit.healthFlags.cycleId).toBeDefined();
  });

  it('Main Path: detects dead code candidates', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    // Create a dead module (fanIn=0, no publicSurface, fanOut>0) and a normal one
    // Using different subdirectories so they map to different modules
    writeSpineUnit(indexDir, 'src/dead/dead-code.ts', {
      role: 'Dead module',
      dependsOn: [{ targetPath: '../lib/helper.js', relation: 'import', symbols: ['helper'] }],
    });
    writeSpineUnit(indexDir, 'src/lib/helper.ts', {
      role: 'Library',
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi.fn().mockReturnValue(['src/dead/dead-code.ts', 'src/lib/helper.ts']),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Verify dead code detected
    const deadCodePath = path.join(
      rootDir,
      '.spine',
      'view',
      'data',
      'diagnostics',
      'dead-code.json',
    );
    const deadCode = JSON.parse(fs.readFileSync(deadCodePath, 'utf-8'));
    expect(deadCode.length).toBeGreaterThanOrEqual(1);
    const deadEntry = deadCode.find((d: { moduleId: string }) => d.moduleId === 'src/dead');
    expect(deadEntry).toBeDefined();
    expect(deadEntry.confidence).toBe('high');

    // Verify health flag on the dead module
    const deadIndexPath = path.join(indexDir, 'src/dead/dead-code.ts.json');
    const deadUnit = JSON.parse(fs.readFileSync(deadIndexPath, 'utf-8'));
    expect(deadUnit.healthFlags.isDeadCodeSuspect).toBe(true);
  });

  it('Main Path: detects hub modules', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    // Create multiple modules all depending on a central hub
    // Each consumer is in its own directory to create distinct modules
    writeSpineUnit(indexDir, 'src/hub/hub-module.ts', {
      role: 'Hub module',
    });
    writeSpineUnit(indexDir, 'src/consumer-a/a-module.ts', {
      role: 'Consumer A',
      dependsOn: [{ targetPath: '../hub/hub-module.js', relation: 'import', symbols: ['hub'] }],
    });
    writeSpineUnit(indexDir, 'src/consumer-b/b-module.ts', {
      role: 'Consumer B',
      dependsOn: [{ targetPath: '../hub/hub-module.js', relation: 'import', symbols: ['hub'] }],
    });
    writeSpineUnit(indexDir, 'src/consumer-c/c-module.ts', {
      role: 'Consumer C',
      dependsOn: [{ targetPath: '../hub/hub-module.js', relation: 'import', symbols: ['hub'] }],
    });

    const allFiles = [
      'src/hub/hub-module.ts',
      'src/consumer-a/a-module.ts',
      'src/consumer-b/b-module.ts',
      'src/consumer-c/c-module.ts',
    ];

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi.fn().mockReturnValue(allFiles),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Verify hubs detected
    const hubsPath = path.join(rootDir, '.spine', 'view', 'data', 'diagnostics', 'hubs.json');
    const hubs = JSON.parse(fs.readFileSync(hubsPath, 'utf-8'));
    expect(hubs.length).toBeGreaterThanOrEqual(1);

    // The hub module should be identified
    const hubEntry = hubs.find((h: { moduleId: string }) => h.moduleId === 'src/hub');
    expect(hubEntry).toBeDefined();
    if (hubEntry) {
      expect(hubEntry.fanIn).toBe(3);
    }

    // Verify health flag on the hub
    const hubIndexPath = path.join(indexDir, 'src/hub/hub-module.ts.json');
    const hubUnit = JSON.parse(fs.readFileSync(hubIndexPath, 'utf-8'));
    expect(hubUnit.healthFlags.isHub).toBe(true);
    expect(hubUnit.healthFlags.fanIn).toBe(3);
  });

  // ------------------------------------------------------------------
  // Boundary: skip when hookMode is true
  // ------------------------------------------------------------------

  it('Boundary: returns early when hookMode is true', async () => {
    const rootDir = setupTempDir();
    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: true,
      scanner: {
        getAllTrackedFiles: vi.fn(),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // No files should have been written
    const kgPath = path.join(rootDir, '.spine', 'view', 'data', 'knowledge-graph.json');
    expect(fs.existsSync(kgPath)).toBe(false);
    expect(ctx.scanner.getAllTrackedFiles).not.toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Boundary: empty repository (no index files)
  // ------------------------------------------------------------------

  it('Boundary: handles empty index directory gracefully', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');
    fs.mkdirSync(indexDir, { recursive: true });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi.fn().mockReturnValue([]),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Should still write empty graph
    const kgPath = path.join(rootDir, '.spine', 'view', 'data', 'knowledge-graph.json');
    expect(fs.existsSync(kgPath)).toBe(true);
    const kg = JSON.parse(fs.readFileSync(kgPath, 'utf-8'));
    expect(kg.nodes).toHaveLength(0);
    expect(kg.edges).toHaveLength(0);

    // Diagnostics should be empty
    const cyclesPath = path.join(rootDir, '.spine', 'view', 'data', 'diagnostics', 'cycles.json');
    const cycles = JSON.parse(fs.readFileSync(cyclesPath, 'utf-8'));
    expect(cycles).toHaveLength(0);
  });

  // ------------------------------------------------------------------
  // Boundary: single file
  // ------------------------------------------------------------------

  it('Boundary: handles single-file repository correctly', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    writeSpineUnit(indexDir, 'src/solo.ts', {
      role: 'Solo module',
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi.fn().mockReturnValue(['src/solo.ts']),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Single node, zero edges
    const kgPath = path.join(rootDir, '.spine', 'view', 'data', 'knowledge-graph.json');
    const kg = JSON.parse(fs.readFileSync(kgPath, 'utf-8'));
    expect(kg.nodes).toHaveLength(1);
    expect(kg.nodes[0].id).toBe('src');
    expect(kg.edges).toHaveLength(0);

    // Health flags set correctly for isolated node
    expect(ctx.manifest.updateFileStatusWithDocs).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------------------
  // Boundary: error handling (corrupt index file)
  // ------------------------------------------------------------------

  it('Boundary: warns and continues when encountering corrupt index files', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    // Write a valid unit
    writeSpineUnit(indexDir, 'src/good.ts', {
      role: 'Good module',
    });

    // Write a corrupt JSON file
    const corruptPath = path.join(indexDir, 'src/bad.ts.json');
    fs.mkdirSync(path.dirname(corruptPath), { recursive: true });
    fs.writeFileSync(corruptPath, 'not valid json{{{', 'utf-8');

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi.fn().mockReturnValue(['src/good.ts', 'src/bad.ts']),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Should still build a graph from the valid file
    const kgPath = path.join(rootDir, '.spine', 'view', 'data', 'knowledge-graph.json');
    expect(fs.existsSync(kgPath)).toBe(true);
    const kg = JSON.parse(fs.readFileSync(kgPath, 'utf-8'));
    expect(kg.nodes.length).toBeGreaterThanOrEqual(1);

    // Should warn about the bad file during health flags write
    expect(io.warn).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Boundary: files with missing index entries
  // ------------------------------------------------------------------

  it('Boundary: skips tracked files that have no corresponding index entry', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    writeSpineUnit(indexDir, 'src/existing.ts', {
      role: 'Existing module',
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        // Tracked file missing.ts has no index entry
        getAllTrackedFiles: vi.fn().mockReturnValue(['src/existing.ts', 'src/missing.ts']),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // Should only update the existing file
    expect(ctx.manifest.updateFileStatusWithDocs).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------------------
  // Main Path: all diagnostics outputs coexist
  // ------------------------------------------------------------------

  it('Main Path: writes all four output files (graph + 3 diagnostics)', async () => {
    const rootDir = setupTempDir();
    const indexDir = path.join(rootDir, '.spine', 'index');

    writeSpineUnit(indexDir, 'src/module-a.ts', {
      role: 'Module A',
      dependsOn: [{ targetPath: './module-b.js', relation: 'import', symbols: ['B'] }],
    });
    writeSpineUnit(indexDir, 'src/module-b.ts', {
      role: 'Module B',
    });

    const outputManager = new OutputManager({ rootDir });
    const io = mockRuntimeIO();

    const ctx = {
      rootDir,
      hookMode: false,
      scanner: {
        getAllTrackedFiles: vi.fn().mockReturnValue(['src/module-a.ts', 'src/module-b.ts']),
      },
      manifest: {
        updateFileStatusWithDocs: vi.fn(),
      },
      outputManager,
      runtimeIO: io,
      targetLocales: ['en-US'],
      state: {
        telemetry: {
          diagnostics: {},
          stats: { processed: 0, skipped: 0, failed: 0 },
          summarize: { tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } },
        },
      },
    } as unknown as TaskContext;

    const task = new KnowledgeGraphTask();
    await task.execute(ctx, makeCommitStageOutput());

    // All four output files must exist
    const expectedFiles = [
      'knowledge-graph.json',
      'diagnostics/cycles.json',
      'diagnostics/dead-code.json',
      'diagnostics/hubs.json',
    ];

    for (const file of expectedFiles) {
      const fullPath = path.join(rootDir, '.spine', 'view', 'data', file);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  // ------------------------------------------------------------------
  // Name / checkpoint
  // ------------------------------------------------------------------

  it('reports correct task name and checkpoint ID', () => {
    const task = new KnowledgeGraphTask();
    expect(task.name).toBe('Knowledge Graph Construction');
    expect(task.checkpointId).toBe('knowledge-graph');
  });
});
