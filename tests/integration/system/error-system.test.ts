import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CheckService } from '../../../src/services/check-service.js';
import { FixService } from '../../../src/services/fix-service.js';
import { SpineResources } from '../../../src/infra/mcp/resources.js';
import { SpineTools } from '../../../src/infra/mcp/tools.js';
import { MCPContextGate } from '../../../src/infra/mcp/context.js';
import { ArchSpineError, ErrorCodes } from '../../../src/core/errors.js';
import { Config } from '../../../src/infra/config.js';
import { Manifest } from '../../../src/infra/manifest.js';
import { SpineDB } from '../../../src/infra/db.js';
import { serializeLockPayload } from '../../../src/utils/lock.js';

describe('error system convergence (round 1)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-error-system-'));
    fs.mkdirSync(path.join(testDir, '.spine', 'index', 'src'), { recursive: true });
    fs.writeFileSync(path.join(testDir, '.spine', 'index', 'project.json'), '{}');
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('throws a structured error when check runs without LLM provider', async () => {
    const service = new CheckService({ rootDir: testDir });
    await expect(service.run()).rejects.toMatchObject({
      code: ErrorCodes.LlmProviderMissing,
    } satisfies Partial<ArchSpineError>);
  });

  it('throws a structured error when fix runs without LLM provider', async () => {
    const service = new FixService({ rootDir: testDir });
    await expect(service.run()).rejects.toMatchObject({
      code: ErrorCodes.LlmProviderMissing,
    } satisfies Partial<ArchSpineError>);
  });

  it('emits MCP structured errors for invalid URI and context access', async () => {
    const resources = new SpineResources(testDir, new MCPContextGate('project-first'));

    await expect(resources.getResource('spine://invalid')).rejects.toMatchObject({
      code: ErrorCodes.McpResourceInvalidUri,
    } satisfies Partial<ArchSpineError>);

    await expect(resources.getResource('spine://file/src/file.ts')).rejects.toMatchObject({
      code: ErrorCodes.McpContextAccessDenied,
    } satisfies Partial<ArchSpineError>);
  });

  it('keeps config and manifest parsing in safe fallback mode with actionable warnings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    fs.writeFileSync(path.join(testDir, '.spine', 'config.json'), '{broken-json');
    fs.writeFileSync(path.join(testDir, '.spine', 'manifest.json'), '{broken-json');
    fs.writeFileSync(path.join(testDir, '.spine', 'languages.json'), '{broken-json');

    const config = new Config(testDir);

    const manifest = Manifest.open(testDir);
    expect(manifest.loadLanguageSnapshot()).toBeNull();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(ErrorCodes.ConfigParseFailed));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(ErrorCodes.ManifestParseFailed));
    warnSpy.mockRestore();
  });

  it('treats a manifest without lastSyncAt as needing initial sync without crashing', () => {
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    fs.writeFileSync(path.join(testDir, '.spine', 'manifest.json'), JSON.stringify({ sync: {} }));

    const manifest = Manifest.open(testDir);
    expect(manifest.needsInitialSync()).toBe(true);
  });

  it('emits MCP structured errors for unknown tool calls', async () => {
    const tools = new SpineTools(testDir);
    await expect(tools.executeTool('spine_unknown_tool', {})).rejects.toMatchObject({
      code: ErrorCodes.McpToolUnknown,
    } satisfies Partial<ArchSpineError>);
  });

  it('emits MCP structured errors for invalid tool arguments', async () => {
    const tools = new SpineTools(testDir);

    await expect(tools.executeTool('spine_query_responsibilities', {})).rejects.toMatchObject({
      code: ErrorCodes.McpToolInvalidArguments,
    } satisfies Partial<ArchSpineError>);

    await expect(tools.executeTool('spine_get_drift_history', {})).rejects.toMatchObject({
      code: ErrorCodes.McpToolInvalidArguments,
    } satisfies Partial<ArchSpineError>);

    await expect(
      tools.executeTool('spine_get_drift_history', { filePath: 'src/file.ts', limit: 0 }),
    ).rejects.toMatchObject({
      code: ErrorCodes.McpToolInvalidArguments,
    } satisfies Partial<ArchSpineError>);
  });

  it('preserves structured runtime lock errors through service entrypoints', async () => {
    const killSpy = vi.spyOn(process, 'kill');
    fs.writeFileSync(
      path.join(testDir, '.spine', '.lock'),
      serializeLockPayload({ pid: 424242, timestamp: Date.now(), token: 'active-token' }),
    );

    killSpy.mockImplementation(() => true as any);
    await expect(
      new CheckService({ rootDir: testDir, llmClient: {} as any }).run(),
    ).rejects.toMatchObject({
      code: ErrorCodes.RuntimeLockActive,
      context: expect.objectContaining({ pid: 424242 }),
    } satisfies Partial<ArchSpineError>);

    killSpy.mockImplementation(() => {
      const error = new Error('operation not permitted') as Error & { code?: string };
      error.code = 'EPERM';
      throw error;
    });
    await expect(
      new FixService({ rootDir: testDir, llmClient: {} as any }).run(),
    ).rejects.toMatchObject({
      code: ErrorCodes.RuntimeLockOwnerUnverifiable,
      context: expect.objectContaining({ pid: 424242, ownerVerifiable: false }),
    } satisfies Partial<ArchSpineError>);
  });

  it('treats invalid runtime lock payloads as corrupt through service entrypoints', async () => {
    fs.writeFileSync(
      path.join(testDir, '.spine', '.lock'),
      JSON.stringify({ pid: 424242, timestamp: Date.now() }),
    );

    await expect(
      new CheckService({ rootDir: testDir, llmClient: {} as any }).run(),
    ).rejects.toMatchObject({
      code: ErrorCodes.RuntimeLockCorrupt,
    } satisfies Partial<ArchSpineError>);
  });

  it('emits structured runtime DB errors when the SQLite path cannot be opened', () => {
    fs.rmSync(path.join(testDir, '.spine', 'index'), { recursive: true, force: true });
    fs.mkdirSync(path.join(testDir, '.spine', 'cache.db'), { recursive: true });

    try {
      new SpineDB(testDir);
      throw new Error('Expected SpineDB construction to fail.');
    } catch (error) {
      expect(error).toMatchObject({
        code: ErrorCodes.RuntimeDbOpenFailed,
      } satisfies Partial<ArchSpineError>);
    }
  });

  it('emits MCP structured errors when runtime baseline is incomplete or missing', async () => {
    const tools = new SpineTools(testDir);
    await expect(
      tools.executeTool('spine_query_responsibilities', { keyword: 'auth' }),
    ).rejects.toMatchObject({
      code: ErrorCodes.McpRuntimeBaselineIncomplete,
    } satisfies Partial<ArchSpineError>);

    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-error-system-mcp-empty-'));
    try {
      await expect(
        new SpineTools(emptyDir, {} as any).executeTool('spine_list_resource_templates', {}),
      ).rejects.toMatchObject({
        code: ErrorCodes.McpRuntimeMissing,
      } satisfies Partial<ArchSpineError>);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  it('emits MCP structured errors when responsibility index entries contain invalid JSON', async () => {
    fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'src', 'broken.ts'), 'export const broken = true;\n');
    fs.writeFileSync(path.join(testDir, '.spine', 'manifest.json'), JSON.stringify({ sync: {} }));
    const manifest = Manifest.open(testDir);
    (manifest as any).db.ensureFileRecord('src/broken.ts', 'source');
    fs.writeFileSync(
      path.join(testDir, '.spine', 'index', 'src', 'broken.ts.json'),
      '{broken-json',
    );

    const tools = new SpineTools(testDir);
    await expect(
      tools.executeTool('spine_query_responsibilities', { keyword: 'auth' }),
    ).rejects.toMatchObject({
      code: ErrorCodes.McpToolIndexInvalidContent,
    } satisfies Partial<ArchSpineError>);
  });

  it('emits MCP structured errors when a file resource contains invalid JSON', async () => {
    fs.writeFileSync(
      path.join(testDir, '.spine', 'index', 'src', 'broken.ts.json'),
      '{broken-json',
    );

    const resources = new SpineResources(testDir);
    await expect(resources.getResource('spine://file/src/broken.ts')).rejects.toMatchObject({
      code: ErrorCodes.McpResourceInvalidContent,
    } satisfies Partial<ArchSpineError>);
  });
});
