import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Config } from '../src/infra/config.js';
import { resolveEnabledViews, resolveViewLayer } from '../src/services/view/index.js';

describe('view layer resolution', () => {
  let testDir: string;
  const originalEnv = process.env.SPINE_VIEW_LAYER;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-view-runtime-'));
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    delete process.env.SPINE_VIEW_LAYER;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.SPINE_VIEW_LAYER;
    } else {
      process.env.SPINE_VIEW_LAYER = originalEnv;
    }

    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('defaults to disabled when no project config or environment override exists', () => {
    const resolved = resolveViewLayer(new Config(testDir));
    expect(resolved).toEqual({
      value: false,
      source: 'default',
    });
  });

  it('reads the persisted project config flag when present', () => {
    const config = new Config(testDir);
    config.setViewLayer(true);

    const resolved = resolveViewLayer(new Config(testDir));
    expect(resolved).toEqual({
      value: true,
      source: 'project-config',
    });
  });

  it('falls back to the environment flag when project config is absent', () => {
    process.env.SPINE_VIEW_LAYER = 'true';

    const resolved = resolveViewLayer(new Config(testDir));
    expect(resolved).toEqual({
      value: true,
      source: 'env',
    });
  });

  it('uses default enabled views when enabledViews is unset', () => {
    const resolved = resolveEnabledViews(new Config(testDir));
    expect(resolved.value).toEqual([
      'public-surface',
      'risk-hotspots',
      'architecture-diagram',
      'project-health',
      'agent-briefing',
      'change-impact',
    ]);
    expect(resolved.source).toBe('default');
  });

  it('keeps an explicit empty enabledViews list as no enabled views', () => {
    const config = new Config(testDir);
    config.setEnabledViews([]);

    const resolved = resolveEnabledViews(new Config(testDir));
    expect(resolved.value).toEqual([]);
    expect(resolved.source).toBe('project-config');
  });

  it('filters unknown enabled view ids while preserving known ones', () => {
    const config = new Config(testDir);
    config.setEnabledViews(['public-surface', 'unknown-view', 'risk-hotspots']);

    const resolved = resolveEnabledViews(new Config(testDir));
    expect(resolved.value).toEqual(['public-surface', 'risk-hotspots']);
    expect(resolved.unknown).toEqual(['unknown-view']);
  });
});
