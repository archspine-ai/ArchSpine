import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { SpineResources } from '../src/infra/mcp/resources.js';
import { SpineTools } from '../src/infra/mcp/tools.js';
import { MCPContextGate } from '../src/infra/mcp/context.js';
import { CURRENT_SCHEMA_VERSION, GENERATOR_VERSION } from '../src/types/protocol.js';

describe('MCP context modes', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-mcp-context-'));
    fs.mkdirSync(path.join(testDir, '.spine', 'index', 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, '.spine', 'index', 'project.json'),
      JSON.stringify(
        {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          projectName: 'archspine-mcp-context',
          role: 'Test project',
          responsibility: 'Exercise MCP context gating',
          modules: [{ directory: 'src', role: 'Source files', childCount: 1 }],
          provenance: {
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: GENERATOR_VERSION,
            pipelineStages: ['aggregate'],
          },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(
      path.join(testDir, '.spine', 'index', 'src', 'folder.json'),
      JSON.stringify(
        {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          directory: 'src',
          role: 'Source folder',
          responsibility: 'Contains indexed source files',
          children: [{ filePath: 'src/file.ts', role: 'Demo file', fileKind: 'source' }],
          provenance: {
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: GENERATOR_VERSION,
            pipelineStages: ['aggregate'],
          },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(
      path.join(testDir, '.spine', 'index', 'src', 'file.ts.json'),
      JSON.stringify(
        {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          identity: {
            filePath: 'src/file.ts',
            contentHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            language: 'typescript',
            fileKind: 'source',
            scope: 'src',
          },
          semantic: {
            role: 'Demo file',
            responsibilities: ['Expose a test symbol'],
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
            exports: [{ name: 'demo', kind: 'function', signature: '() => void' }],
            declaredSymbols: [],
            structuralHints: {
              importCount: 0,
              exportCount: 1,
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
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: GENERATOR_VERSION,
            pipelineStages: ['ast', 'llm'],
          },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(
      path.join(testDir, '.spine', 'manifest.json'),
      JSON.stringify(
        {
          sync: {
            reverseIndexComplete: false,
          },
        },
        null,
        2,
      ),
    );
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('requires project context before folder/file reads in project-first mode', async () => {
    const gate = new MCPContextGate('project-first');
    const resources = new SpineResources(testDir, gate);

    await expect(resources.getResource('spine://folder/src')).rejects.toThrow(
      'Read spine://project first',
    );

    await resources.getResource('spine://project');
    await expect(resources.getResource('spine://folder/src')).resolves.toMatchObject({
      uri: 'spine://folder/src',
    });
    await expect(resources.getResource('spine://file/src/file.ts')).resolves.toMatchObject({
      uri: 'spine://file/src/file.ts',
    });
  });

  it('allows search-first access after a scan tool primes context', async () => {
    const gate = new MCPContextGate('search-first');
    const resources = new SpineResources(testDir, gate);
    const tools = new SpineTools(testDir, undefined, gate);

    await expect(resources.getResource('spine://file/src/file.ts')).rejects.toThrow(
      'Run spine_query_responsibilities',
    );

    const result = await tools.executeTool('spine_preview_scan', {});
    expect(result).toContain('Scan Policy');

    await expect(resources.getResource('spine://file/src/file.ts')).resolves.toMatchObject({
      uri: 'spine://file/src/file.ts',
    });
  });

  it('lists discoverable resource templates', async () => {
    const tools = new SpineTools(testDir);
    const result = await tools.executeTool('spine_list_resource_templates', {});
    const templates = JSON.parse(result);

    expect(templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ uriTemplate: 'spine://project' }),
        expect.objectContaining({ uriTemplate: 'spine://folder/{dirPath}' }),
        expect.objectContaining({ uriTemplate: 'spine://file/{filePath}' }),
      ]),
    );
  });

  it('rejects folder traversal attempts in resource URIs', async () => {
    const resources = new SpineResources(testDir);

    await expect(resources.getResource('spine://folder/../../etc')).rejects.toThrow(
      'Resource path traversal is not allowed',
    );
  });

  it('rejects file traversal attempts in resource URIs', async () => {
    const resources = new SpineResources(testDir);

    await expect(resources.getResource('spine://file/../../secrets')).rejects.toThrow(
      'Resource path traversal is not allowed',
    );
  });

  it('rejects encoded traversal attempts in resource URIs', async () => {
    const resources = new SpineResources(testDir);

    await expect(resources.getResource('spine://file/%2E%2E/%2E%2E/secrets')).rejects.toThrow(
      'Resource path traversal is not allowed',
    );
  });

  it('rejects backslash traversal attempts in resource URIs', async () => {
    const resources = new SpineResources(testDir);

    await expect(resources.getResource('spine://file/..\\..\\secrets')).rejects.toThrow(
      'Resource path traversal is not allowed',
    );
  });

  it('rejects absolute resource paths in resource URIs', async () => {
    const resources = new SpineResources(testDir);

    await expect(resources.getResource('spine://folder//etc')).rejects.toThrow(
      'must be a non-empty relative path',
    );
    await expect(resources.getResource('spine://file/C:\\Windows\\System32')).rejects.toThrow(
      'must be a non-empty relative path',
    );
  });

  it('rejects malformed percent-encoding in resource URIs', async () => {
    const resources = new SpineResources(testDir);

    await expect(resources.getResource('spine://file/%E0%A4%A')).rejects.toThrow(
      'contains invalid percent-encoding',
    );
  });
});
