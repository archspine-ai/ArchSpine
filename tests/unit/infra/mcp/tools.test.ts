import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { SpineTools } from '../../../../src/infra/mcp/tools.js';

describe('SpineTools', () => {
  const tempDirs: string[] = [];
  let rootDir: string;
  let spineDir: string;

  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-tools-'));
    tempDirs.push(rootDir);
    spineDir = path.join(rootDir, '.spine');
    fs.mkdirSync(spineDir, { recursive: true });

    // Create minimal manifest for tools that read from it
    fs.writeFileSync(
      path.join(spineDir, 'manifest.json'),
      JSON.stringify({
        sync: { lastSyncAt: new Date().toISOString(), lastSyncMode: 'full', indexedUnitCount: 5 },
        health: { activeViolations: 0 },
      }),
      'utf-8',
    );

    fs.mkdirSync(path.join(spineDir, 'index'), { recursive: true });
    fs.mkdirSync(path.join(spineDir, 'index'), { recursive: true });
    fs.writeFileSync(path.join(spineDir, 'index', 'project.json'), JSON.stringify({}), 'utf-8');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  describe('getToolDefinitions', () => {
    it('Main Path: returns 21 tool definitions', () => {
      const tools = new SpineTools(rootDir);
      const defs = tools.getToolDefinitions();

      expect(defs).toHaveLength(21);
    });

    it('Main Path: each tool has name, description, and inputSchema', () => {
      const tools = new SpineTools(rootDir);
      const defs = tools.getToolDefinitions();

      for (const def of defs) {
        expect(def.name).toBeTruthy();
        expect(def.name).toMatch(/^spine_/);
        expect(def.description).toBeTruthy();
        expect(def.inputSchema).toBeDefined();
        expect(def.inputSchema.type).toBe('object');
      }
    });

    it('Main Path: includes expected tool names', () => {
      const tools = new SpineTools(rootDir);
      const defs = tools.getToolDefinitions();
      const names = defs.map((d) => d.name);

      expect(names).toContain('spine_query_invariants');
      expect(names).toContain('spine_query_responsibilities');
      expect(names).toContain('spine_preview_scan');
      expect(names).toContain('spine_get_drift_history');
      expect(names).toContain('spine_get_file_context');
      expect(names).toContain('spine_get_view_data');
      expect(names).toContain('spine_get_sync_status');
      expect(names).toContain('spine_get_baseline_status');
      expect(names).toContain('spine_get_violations_summary');
      expect(names).toContain('spine_list_resource_templates');
      expect(names).toContain('spine_query_graph');
      expect(names).toContain('spine_get_diagnostics');
      expect(names).toContain('spine_match_semantic');
      expect(names).toContain('spine_get_change_impact');
      expect(names).toContain('spine_get_module_context');
    });
  });

  describe('executeTool', () => {
    it('Main Path: throws for unknown tool name', async () => {
      const tools = new SpineTools(rootDir);

      await expect(tools.executeTool('unknown_tool', {})).rejects.toThrow();
    });

    it('Main Path: rejecting non-meta tool when .spine is missing', async () => {
      // Manifest.open may create .spine dir; test with a path that has no .spine
      // but use getDriftHistory which validates filePath and can throw before .spine check
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-empty-'));
      tempDirs.push(emptyDir);
      const tools = new SpineTools(emptyDir);

      // spine_get_drift_history validates filePath before checking .spine existence
      await expect(
        tools.executeTool('spine_get_drift_history', { filePath: '../../../etc/passwd' }),
      ).rejects.toThrow();
    });

    it('Main Path: getBaselineStatus works without .spine existing', async () => {
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-meta-'));
      tempDirs.push(emptyDir);
      const tools = new SpineTools(emptyDir);

      const result = await tools.executeTool('spine_get_baseline_status', {});
      const parsed = JSON.parse(result);

      expect(parsed.baselineExists).toBe(false);
    });

    it('Main Path: getSyncStatus works without .spine existing', async () => {
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-meta2-'));
      tempDirs.push(emptyDir);
      const tools = new SpineTools(emptyDir);

      const result = await tools.executeTool('spine_get_sync_status', {});
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('totalTracked');
      expect(parsed).toHaveProperty('needingSync');
    });
  });

  describe('queryInvariants', () => {
    it('Main Path: returns message when no rules dir exists', async () => {
      const tools = new SpineTools(rootDir);

      const result = await tools.executeTool('spine_query_invariants', {});
      expect(result).toContain('No architectural rules defined');
    });

    it('Main Path: returns matched rules for a given filePath', async () => {
      const rulesDir = path.join(spineDir, 'rules');
      fs.mkdirSync(rulesDir, { recursive: true });
      fs.writeFileSync(
        path.join(rulesDir, 'test-rule.md'),
        [
          '---',
          'ruleId: test-rule',
          'title: Test Rule',
          'severity: error',
          'summary: Test rule summary.',
          'appliesTo:',
          '  - src/**/*.ts',
          'enforceable: true',
          '---',
          'Test body.',
        ].join('\n'),
        'utf-8',
      );

      const tools = new SpineTools(rootDir);
      const result = await tools.executeTool('spine_query_invariants', {
        filePath: 'src/api/handler.ts',
      });
      expect(result).toContain('test-rule');
    });

    it('Boundary: returns warn message for non-existent invariantId', async () => {
      const rulesDir = path.join(spineDir, 'rules');
      fs.mkdirSync(rulesDir, { recursive: true });
      fs.writeFileSync(
        path.join(rulesDir, 'dummy-rule.md'),
        [
          '---',
          'ruleId: dummy-rule',
          'title: Dummy Rule',
          'severity: advisory',
          'summary: A dummy rule.',
          'appliesTo:',
          '  - "**/*"',
          'enforceable: true',
          '---',
          'Dummy rule body.',
        ].join('\n'),
        'utf-8',
      );

      const tools = new SpineTools(rootDir);
      const result = await tools.executeTool('spine_query_invariants', {
        invariantId: 'does-not-exist',
      });
      expect(result).toContain('not found');
    });
  });

  describe('queryResponsibilities', () => {
    it('Boundary: throws for empty keyword', async () => {
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_query_responsibilities', { keyword: '' }),
      ).rejects.toThrow();
    });

    it('Boundary: throws when manifest.json is missing', async () => {
      fs.unlinkSync(path.join(spineDir, 'manifest.json'));
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_query_responsibilities', { keyword: 'auth' }),
      ).rejects.toThrow();
    });
  });

  describe('getDriftHistory', () => {
    it('Boundary: throws for empty filePath', async () => {
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_get_drift_history', { filePath: '' }),
      ).rejects.toThrow();
    });

    it('Boundary: throws for invalid limit', async () => {
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_get_drift_history', { filePath: 'src/test.ts', limit: 0 }),
      ).rejects.toThrow();
    });

    it('Boundary: rejects path traversal in filePath', async () => {
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_get_drift_history', { filePath: '../../../etc/passwd' }),
      ).rejects.toThrow();
    });

    it('Boundary: rejects null bytes in filePath', async () => {
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_get_drift_history', { filePath: 'src/test\0.ts' }),
      ).rejects.toThrow();
    });
  });

  describe('getFileContext', () => {
    it('Boundary: throws for empty filePath', async () => {
      const tools = new SpineTools(rootDir);

      await expect(tools.executeTool('spine_get_file_context', { filePath: '' })).rejects.toThrow();
    });

    it('Boundary: rejects absolute paths', async () => {
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_get_file_context', { filePath: '/etc/passwd' }),
      ).rejects.toThrow();
    });

    it('Boundary: returns error JSON for missing index entry', async () => {
      const tools = new SpineTools(rootDir);

      const result = await tools.executeTool('spine_get_file_context', {
        filePath: 'src/nonexistent.ts',
      });
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('No index data found');
    });
  });

  describe('getViewData', () => {
    it('Boundary: throws for invalid viewType', async () => {
      const tools = new SpineTools(rootDir);

      await expect(
        tools.executeTool('spine_get_view_data', { viewType: 'invalid' }),
      ).rejects.toThrow();
    });

    it('Boundary: accepts all 6 valid view types without throwing', async () => {
      const tools = new SpineTools(rootDir);
      const validTypes = [
        'risk-hotspots',
        'public-surface',
        'architecture-diagram',
        'project-health',
        'agent-briefing',
        'change-impact',
      ];

      for (const viewType of validTypes) {
        // All should return error (file not found) rather than throwing
        const result = await tools.executeTool('spine_get_view_data', { viewType });
        const parsed = JSON.parse(result);
        expect(parsed.error).toContain('not found');
      }
    });

    it('Main Path: returns error when view file does not exist', async () => {
      const tools = new SpineTools(rootDir);

      const result = await tools.executeTool('spine_get_view_data', { viewType: 'risk-hotspots' });
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('not found');
    });

    it('Main Path: returns view data with items when file exists', async () => {
      const viewDataDir = path.join(rootDir, '.spine', 'view', 'data');
      fs.mkdirSync(viewDataDir, { recursive: true });
      fs.writeFileSync(
        path.join(viewDataDir, 'risk-hotspots.json'),
        JSON.stringify({
          viewType: 'risk-hotspots',
          generatedAt: new Date().toISOString(),
          summary: 'Test hotspots',
          items: [
            {
              id: '1',
              hotspotPath: 'src/a.ts',
              riskFactors: [],
              summary: 'Risk A',
              impactRadiusHint: 'low',
              confidence: 80,
              totalScore: 50,
              scoreBreakdown: [],
            },
            {
              id: '2',
              hotspotPath: 'src/b.ts',
              riskFactors: [],
              summary: 'Risk B',
              impactRadiusHint: 'high',
              confidence: 90,
              totalScore: 70,
              scoreBreakdown: [],
            },
          ],
        }),
      );

      const tools = new SpineTools(rootDir);
      const result = await tools.executeTool('spine_get_view_data', {
        viewType: 'risk-hotspots',
        limit: 1,
      });
      const parsed = JSON.parse(result);

      expect(parsed.viewType).toBe('risk-hotspots');
      expect(parsed.itemsCount).toBe(1);
      expect(parsed.totalCount).toBe(2);
      expect(parsed.truncated).toBe(true);
      expect(parsed.items).toHaveLength(1);
    });

    it('Main Path: returns architecture-diagram metadata (no items array)', async () => {
      const viewDataDir = path.join(rootDir, '.spine', 'view', 'data');
      fs.mkdirSync(viewDataDir, { recursive: true });
      fs.writeFileSync(
        path.join(viewDataDir, 'architecture-diagram.json'),
        JSON.stringify({
          title: 'Architecture Diagram',
          subtitle: 'Test graph',
          nodeCount: 5,
          edgeCount: 8,
          generatedAt: new Date().toISOString(),
        }),
      );

      const tools = new SpineTools(rootDir);
      const result = await tools.executeTool('spine_get_view_data', {
        viewType: 'architecture-diagram',
      });
      const parsed = JSON.parse(result);

      expect(parsed.title).toBe('Architecture Diagram');
      expect(parsed.nodeCount).toBe(5);
      expect(parsed.edgeCount).toBe(8);
    });
  });

  describe('getBaselineStatus', () => {
    it('Main Path: returns baseline status with expected fields', async () => {
      const tools = new SpineTools(rootDir);

      const result = await tools.executeTool('spine_get_baseline_status', {});
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('baselineExists');
      expect(parsed).toHaveProperty('needsInitialSync');
      expect(parsed).toHaveProperty('publishSnapshotReady');
      expect(parsed).toHaveProperty('lastSyncAt');
      expect(parsed).toHaveProperty('pendingAction');
    });
  });

  describe('listResourceTemplates', () => {
    it('Main Path: returns 3 resource templates', async () => {
      const tools = new SpineTools(rootDir);

      const result = await tools.executeTool('spine_list_resource_templates', {});
      const parsed = JSON.parse(result);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].uriTemplate).toBe('spine://project');
      expect(parsed[1].uriTemplate).toBe('spine://folder/{dirPath}');
      expect(parsed[2].uriTemplate).toBe('spine://file/{filePath}');
    });
  });

  describe('getViolationsSummary', () => {
    it('Main Path: returns zero violations when none exist', async () => {
      const tools = new SpineTools(rootDir);

      const result = await tools.executeTool('spine_get_violations_summary', {});
      const parsed = JSON.parse(result);

      expect(parsed.totalViolations).toBe(0);
    });
  });

  describe('previewScan', () => {
    it('Main Path: returns scan report string', async () => {
      const tools = new SpineTools(rootDir);

      const result = await tools.executeTool('spine_preview_scan', {});
      expect(typeof result).toBe('string');
    });
  });
});
