import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Config } from '../src/infra/config.js';
import { resolveSpineConfig } from '../src/core/config-schema.js';
import { CURRENT_CONFIG_SCHEMA_VERSION } from '../src/types/protocol.js';

describe('config validation', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-config-validation-'));
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('falls back to defaults when persisted config shape is invalid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fs.writeFileSync(
      path.join(testDir, '.spine', 'config.json'),
      JSON.stringify(
        {
          schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
          project: {
            name: 'demo',
            locales: 'en-US',
          },
          llm: {},
        },
        null,
        2,
      ),
    );

    const config = new Config(testDir);

    expect(config.getLanguages()).toEqual(['en-US']);
    expect(config.getHookSyncMode()).toBe('hook');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('project.locales must be an array of strings'),
    );
  });

  it('loads persisted config when it satisfies the runtime contract', () => {
    fs.writeFileSync(
      path.join(testDir, '.spine', 'config.json'),
      JSON.stringify(
        {
          schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
          project: {
            name: 'demo',
            locales: ['English', 'Japanese'],
          },
          llm: {
            provider: 'mock',
            mode: 'heavy',
            promptTier: 'balanced',
            validatePolicy: 'strict',
          },
          mcp: {
            contextMode: 'project-first',
          },
          hooks: {
            preCommit: true,
            syncMode: 'heavy',
          },
          artifacts: {
            strategy: 'distributable',
            experimentalViewLayer: true,
            enabledViews: ['public-surface'],
          },
        },
        null,
        2,
      ),
    );

    const config = new Config(testDir);

    expect(config.getLanguages()).toEqual(['English', 'Japanese']);
    expect(config.getHookSyncMode()).toBe('heavy');
    expect(config.getMCPContextMode()).toBe('project-first');
    expect(config.getConfiguredEnabledViews()).toEqual(['public-surface']);
  });

  it('rejects unsupported config schemaVersion values and falls back to defaults', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fs.writeFileSync(
      path.join(testDir, '.spine', 'config.json'),
      JSON.stringify(
        {
          schemaVersion: '9.9.9',
          project: {
            name: 'demo',
            locales: ['English'],
          },
          llm: {
            provider: 'mock',
          },
        },
        null,
        2,
      ),
    );

    const config = new Config(testDir);

    expect(config.getLanguages()).toEqual(['en-US']);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(`schemaVersion must equal "${CURRENT_CONFIG_SCHEMA_VERSION}"`),
    );
  });

  it('rejects unsupported config payloads instead of trying to reinterpret them', () => {
    const result = resolveSpineConfig({
      schemaVersion: '9.9.9',
      project: {
        name: 'demo',
        locales: 'English',
      },
      llm: {
        provider: 'mock',
        baseUrl: 'https://unsupported.example/v1',
      },
    });

    expect(result.config).toBeNull();
    expect(result.issues).toContain(`schemaVersion must equal "${CURRENT_CONFIG_SCHEMA_VERSION}"`);
    expect(result.issues).toContain('project.locales must be an array of strings');
  });
});
