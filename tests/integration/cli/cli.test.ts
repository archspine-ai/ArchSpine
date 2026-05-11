import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import prompts from 'prompts';
import { runCheck } from '../../../src/engines/check.js';
import { runFix } from '../../../src/engines/fix.js';
import { runUsageReport } from '../../../src/engines/usage.js';
import { SyncService } from '../../../src/services/sync-service.js';

import { LLMClient } from '../../../src/infra/llm/base.js';
import { MockClient } from '../../../src/infra/llm/providers/mock.js';
import { Manifest } from '../../../src/infra/manifest.js';
import { Config } from '../../../src/infra/config.js';
import { RuntimeService } from '../../../src/services/runtime-service.js';
import { runSyncWorkflow } from '../../../src/cli/commands/sync.js';

// Custom mock client for full lifecycle E2E test
class E2EMockClient implements LLMClient {
  public shouldFailCheck = false;

  async generateSummary() {
    return {
      json: {
        semantic: {
          ruleViolations: this.shouldFailCheck
            ? [{ id: 'mock-rule', severity: 'error', reason: 'Mock rule violated in test' }]
            : [],
        },
        skeleton: {},
        graph: {},
      },
      markdown: { English: '# Mock Summary' },
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
    };
  }
  async generateFolderSummary() {
    return this.generateSummary();
  }
  async generateProjectSummary() {
    return this.generateSummary();
  }

  async generateText(prompt?: string) {
    if (prompt?.includes('### Task: Architecture Diagram View')) {
      return {
        content: JSON.stringify({
          title: 'E2E Architecture Diagram',
          subtitle: 'Generated from E2E mock data.',
          nodes: [
            { id: 'cli', label: 'CLI', type: 'frontend' },
            { id: 'services', label: 'Services', type: 'backend' },
            { id: 'rules', label: 'Rules', type: 'security' },
            { id: 'store', label: 'Store', type: 'database' },
            { id: 'git', label: 'Git', type: 'external' },
          ],
          edges: [
            { from: 'cli', to: 'services', label: 'Commands', style: 'solid' },
            { from: 'services', to: 'rules', label: 'Checks', style: 'dashed' },
            { from: 'services', to: 'store', label: 'State', style: 'solid' },
            { from: 'services', to: 'git', label: 'Metadata', style: 'solid' },
          ],
          summaryCards: [
            { heading: 'Core Modules', points: ['CLI', 'Services', 'Store'] },
            { heading: 'Key Dependencies', points: ['Rules', 'Git', 'Outputs'] },
            {
              heading: 'System Boundaries',
              points: ['Repo runtime', 'Protected outputs', 'External Git state'],
            },
          ],
        }),
        usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
      };
    }
    return {
      content: 'export const validFix = true;', // Syntactically valid TS to pass the guardrail
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
    };
  }
}

describe('ArchSpine CLI E2E Pipeline', () => {
  let testDir: string;
  let mockClient: E2EMockClient;
  const runBuildBaseline = async (config: Config, runtimeService: RuntimeService) => {
    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: true,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();
  };

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-e2e-'));
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    // Setup dummy workspace
    fs.writeFileSync(path.join(testDir, 'index.ts'), 'export const a = 1;');

    // Initialize dummy git repository for the scanner
    execSync('git init -b main', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Init"', { cwd: testDir });

    mockClient = new E2EMockClient();

    // Prevent tests from actually killing the vitest process on failure scenarios
    vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`Process exited with code ${code}`);
    });
  });

  afterEach(() => {
    process.exitCode = 0;
    delete process.env.SPINE_GENERATION_FLOW;
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('should seamlessly execute: init -> sync -> check -> fix -> usage -> status', async () => {
    // 1. INIT (Full Sync)
    const synchronizer = new SyncService({
      rootDir: testDir,
      llmClient: mockClient,
      targetLocales: ['English'],
    });
    const initStats = await synchronizer.sync(true);
    expect(initStats.processed).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(testDir, '.spine'))).toBe(true);

    // 2. STATUS
    const status = await synchronizer.status();
    expect(status.needingSync).toBe(0); // already synced

    // 3. CHECK (Success Scenario)
    // Run Check, no exceptions should be thrown, and no violations recorded
    await expect(runCheck(testDir, mockClient)).resolves.not.toThrow();

    // Modify a file (change its size) to bypass Git's stat cache ('racy git' issue) and trigger incremental sync
    fs.writeFileSync(
      path.join(testDir, 'index.ts'),
      'export const a = 2;\n// changed size to trigger git diff',
    );

    // Inject a dummy architecture rule so ValidationTask won't skip the file due to no rules
    const rulesDir = path.join(testDir, '.spine', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    fs.writeFileSync(
      path.join(rulesDir, 'mock-rule.md'),
      '---\nruleId: mock-rule\nappliesTo: ["**/*.ts"]\n---\nDummy rule content.',
    );

    const syncStats = await synchronizer.sync(false);
    expect(syncStats.processed).toBeGreaterThan(0);

    // 4. CHECK (Failure Scenario)
    // Force mock client to "detect" an architecture violation
    mockClient.shouldFailCheck = true;

    // runCheck catches its internal task error and logs it, but we verify it processes it.
    await expect(runCheck(testDir, mockClient)).resolves.not.toThrow();

    // Confirm violation is actually persisted in manifest
    const manifest = Manifest.open(testDir);
    const violations = manifest.getActiveViolations();
    expect(violations.length).toBe(1);
    expect(violations[0].rule_id).toBe('mock-rule');

    // 5. FIX
    // Reset mock client so that the post-fix re-validation phase succeeds
    mockClient.shouldFailCheck = false;

    // Automatically say 'yes' to the prompts prompt ("Apply fix to...? ")
    prompts.inject([true]);

    // runFix will use our mock LLM to generate code, validate its syntax,
    // write it, and clear the violation.
    await expect(runFix(testDir, mockClient)).resolves.not.toThrow();

    // Verify violation was successfully removed by fix engine
    const newViolations = manifest.getActiveViolations();
    expect(newViolations.length).toBe(0);

    // Verify file content was indeed updated
    const finalContent = fs.readFileSync(path.join(testDir, 'index.ts'), 'utf-8');
    expect(finalContent).toBe('export const validFix = true;');

    // 6. USAGE
    await expect(runUsageReport(testDir)).resolves.not.toThrow();
  }, 120_000);

  it('checks a clean synced workspace when no files are changed', async () => {
    fs.mkdirSync(path.join(testDir, 'src', 'api'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'src', 'infra'), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, 'src', 'api', 'handler.ts'),
      "import { db } from '../infra/db.js';\nexport const handler = () => db;\n",
    );
    fs.writeFileSync(path.join(testDir, 'src', 'infra', 'db.ts'), 'export const db = 1;\n');

    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Add layered demo files"', { cwd: testDir });

    const rulesDir = path.join(testDir, '.spine', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    fs.writeFileSync(
      path.join(rulesDir, 'arch.yml'),
      `- [Rule: Layer Isolation]
  - Scope: src/api/**
  - Constraint: API handlers must not import src/infra/** directly.
  - Severity: error
  - Reason: Keep layers isolated.
`,
    );

    const realMockClient = new MockClient({ apiKey: '' });

    const synchronizer = new SyncService({
      rootDir: testDir,
      llmClient: realMockClient,
      targetLocales: ['English'],
    });
    await synchronizer.sync(true);

    await expect(runCheck(testDir, realMockClient)).resolves.not.toThrow();

    const manifest = Manifest.open(testDir);
    const violations = manifest.getActiveViolations();
    expect(violations).toHaveLength(1);
    expect(violations[0].file_path).toBe('src/api/handler.ts');
    expect(violations[0].rule_id).toBe('layer-isolation');
  });

  it('writes view artifacts through the sync workflow when enabled', async () => {
    const config = new Config(testDir);
    config.setLLMProvider('mock');
    config.setViewLayer(true);

    const runtimeService = new RuntimeService(testDir, config);
    await runBuildBaseline(config, runtimeService);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    const publicSurfacePath = path.join(testDir, '.spine', 'view', 'data', 'public-surface.json');
    const riskHotspotsPath = path.join(testDir, '.spine', 'view', 'data', 'risk-hotspots.json');
    const publicSurfaceMarkdownPath = path.join(
      testDir,
      '.spine',
      'view',
      'pages',
      'public-surface.md',
    );
    const riskHotspotsMarkdownPath = path.join(
      testDir,
      '.spine',
      'view',
      'pages',
      'risk-hotspots.md',
    );

    expect(fs.existsSync(publicSurfacePath)).toBe(true);
    expect(fs.existsSync(riskHotspotsPath)).toBe(true);
    expect(fs.existsSync(publicSurfaceMarkdownPath)).toBe(true);
    expect(fs.existsSync(riskHotspotsMarkdownPath)).toBe(true);

    const publicSurface = JSON.parse(fs.readFileSync(publicSurfacePath, 'utf8'));
    const riskHotspots = JSON.parse(fs.readFileSync(riskHotspotsPath, 'utf8'));

    expect(publicSurface.viewType).toBe('public-surface');
    expect(Array.isArray(publicSurface.items)).toBe(true);

    expect(riskHotspots.viewType).toBe('risk-hotspots');
    expect(Array.isArray(riskHotspots.items)).toBe(true);
    expect(fs.readFileSync(publicSurfaceMarkdownPath, 'utf8')).toContain('# Public Surface Map');
    expect(fs.readFileSync(riskHotspotsMarkdownPath, 'utf8')).toContain('# Risk Hotspots Report');
    expect(
      fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'architecture-diagram.json')),
    ).toBe(true);
  });

  it('writes architecture diagram artifacts only during build-level workflow', async () => {
    fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'src', 'index.ts'), 'export const runtime = true;\n');
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Add src tree for architecture diagram view"', { cwd: testDir });

    // Seed a minimal knowledge-graph.json so the deterministic renderer can run.
    // In production, KnowledgeGraphTask produces this file; the task is not yet
    // wired into the sync pipeline, so we pre-create it for this integration test.
    const viewDir = path.join(testDir, '.spine', 'view');
    fs.mkdirSync(path.join(viewDir, 'data'), { recursive: true });
    fs.writeFileSync(
      path.join(viewDir, 'data', 'knowledge-graph.json'),
      JSON.stringify({
        nodes: [
          {
            id: 'src',
            path: 'src',
            layer: 'src',
            role: 'Application source',
            responsibilities: ['Entry point'],
            invariants: [],
            fanIn: 0,
            fanOut: 0,
            violationCount: 0,
            publicSurface: ['index.ts'],
          },
        ],
        edges: [],
      }),
    );

    const config = new Config(testDir);
    config.setLLMProvider('mock');
    config.setViewLayer(true);

    const runtimeService = new RuntimeService(testDir, config);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: true,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    const architectureJsonPath = path.join(
      testDir,
      '.spine',
      'view',
      'data',
      'architecture-diagram.json',
    );
    const architectureSvgPath = path.join(
      testDir,
      '.spine',
      'view',
      'pages',
      'architecture-diagram.svg',
    );

    // JSON metadata envelope should exist
    expect(fs.existsSync(architectureJsonPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(architectureJsonPath, 'utf8'))).toEqual(
      expect.objectContaining({
        title: 'Architecture Diagram',
      }),
    );

    // SVG should exist in pages/ directory
    expect(fs.existsSync(architectureSvgPath)).toBe(true);
    const svgContent = fs.readFileSync(architectureSvgPath, 'utf8');
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svgContent).toContain('src'); // node label
  });

  it('does not fail when view derivation produces empty result sets', async () => {
    const config = new Config(testDir);
    config.setLLMProvider('mock');
    config.setViewLayer(true);

    const runtimeService = new RuntimeService(testDir, config);
    await runBuildBaseline(config, runtimeService);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    const publicSurface = JSON.parse(
      fs.readFileSync(path.join(testDir, '.spine', 'view', 'data', 'public-surface.json'), 'utf8'),
    );
    const riskHotspots = JSON.parse(
      fs.readFileSync(path.join(testDir, '.spine', 'view', 'data', 'risk-hotspots.json'), 'utf8'),
    );

    expect(publicSurface.items).toEqual([]);
    expect(publicSurface.summary).toContain('No high-confidence public entry surfaces');

    expect(riskHotspots.items).toEqual([]);
    expect(riskHotspots.summary).toContain('No high-confidence risk hotspots');
  });

  it('only generates explicitly enabled views', async () => {
    const config = new Config(testDir);
    config.setLLMProvider('mock');
    config.setViewLayer(true);
    config.setEnabledViews(['public-surface']);

    const runtimeService = new RuntimeService(testDir, config);
    await runBuildBaseline(config, runtimeService);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'public-surface.json'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'pages', 'public-surface.md'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'risk-hotspots.json'))).toBe(
      false,
    );
    expect(
      fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'architecture-diagram.json')),
    ).toBe(false);
  });

  it('clears stale artifacts for views that are no longer enabled', async () => {
    const config = new Config(testDir);
    config.setLLMProvider('mock');
    config.setViewLayer(true);
    config.setEnabledViews(['public-surface', 'risk-hotspots']);

    const runtimeService = new RuntimeService(testDir, config);
    await runBuildBaseline(config, runtimeService);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'risk-hotspots.json'))).toBe(
      true,
    );

    config.setEnabledViews(['public-surface']);
    const updatedRuntimeService = new RuntimeService(testDir, config);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService: updatedRuntimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'public-surface.json'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'risk-hotspots.json'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'pages', 'risk-hotspots.md'))).toBe(
      false,
    );
  });

  it('clears all stale view artifacts when the view layer is disabled', async () => {
    const config = new Config(testDir);
    config.setLLMProvider('mock');
    config.setViewLayer(true);
    config.setEnabledViews(['public-surface']);

    let runtimeService = new RuntimeService(testDir, config);
    await runBuildBaseline(config, runtimeService);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'public-surface.json'))).toBe(
      true,
    );

    config.setViewLayer(false);
    runtimeService = new RuntimeService(testDir, config);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'data', 'public-surface.json'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(testDir, '.spine', 'view', 'pages', 'public-surface.md'))).toBe(
      false,
    );
  });

  it('persists the resolved llm provider and model in the sync manifest view', async () => {
    const config = new Config(testDir);
    config.setLLMProvider('mock');
    config.setLLMModel('mock-sync-model');

    const runtimeService = new RuntimeService(testDir, config);
    await runBuildBaseline(config, runtimeService);

    await expect(
      runSyncWorkflow({
        rootDir: testDir,
        config,
        runtimeService,
        full: false,
        hookMode: false,
        repairViolations: false,
        origin: 'user',
      }),
    ).resolves.not.toThrow();

    const manifestView = JSON.parse(
      fs.readFileSync(path.join(testDir, '.spine', 'manifest.json'), 'utf8'),
    );

    expect(manifestView.sync.llm).toEqual({
      provider: 'mock',
      providerSource: 'project-config',
      model: 'mock-sync-model',
      modelSource: 'project-config',
    });
  });
});
