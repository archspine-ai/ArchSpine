import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Config } from '../../../src/infra/config.js';

describe('view command', () => {
  let testDir: string;

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-view-command-'));
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('shows default enabled views when no explicit enabledViews config exists', async () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((message?: unknown) => {
      logs.push(String(message ?? ''));
    });

    const { executeViewCommand } = await import('../../../src/cli/commands/view.js');
    const config = new Config(testDir);
    config.setViewLayer(true);

    await executeViewCommand({ args: ['show'], config });

    spy.mockRestore();

    expect(logs.some((line) => line.includes('View layer: enabled'))).toBe(true);
    expect(logs.some((line) => line.includes('Configured views: (default registry set)'))).toBe(
      true,
    );
    expect(
      logs.some((line) =>
        line.includes('Effective views: public-surface, risk-hotspots, architecture-diagram'),
      ),
    ).toBe(true);
  });

  it('shows no effective views when the layer is disabled', async () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((message?: unknown) => {
      logs.push(String(message ?? ''));
    });

    const { executeViewCommand } = await import('../../../src/cli/commands/view.js');
    const config = new Config(testDir);

    await executeViewCommand({ args: ['show'], config });

    spy.mockRestore();

    expect(logs.some((line) => line.includes('View layer: disabled'))).toBe(true);
    expect(logs.some((line) => line.includes('Effective views: (none)'))).toBe(true);
  });

  it('enables a single view and persists the explicit selection list', async () => {
    const { executeViewCommand } = await import('../../../src/cli/commands/view.js');
    const config = new Config(testDir);

    await executeViewCommand({ args: ['enable', 'public-surface'], config });

    const reloaded = new Config(testDir);
    expect(reloaded.getViewLayer()).toBe(true);
    expect(reloaded.getConfiguredEnabledViews()).toEqual(['public-surface']);
  });

  it('disables a single view from an explicit configured set', async () => {
    const { executeViewCommand } = await import('../../../src/cli/commands/view.js');
    const config = new Config(testDir);
    config.setViewLayer(true);
    config.setEnabledViews(['public-surface', 'risk-hotspots']);

    await executeViewCommand({ args: ['disable', 'risk-hotspots'], config });

    const reloaded = new Config(testDir);
    expect(reloaded.getConfiguredEnabledViews()).toEqual(['public-surface']);
  });

  it('persists interactive selections from view set', async () => {
    vi.doMock('prompts', () => ({
      default: vi.fn(async () => ({
        views: ['public-surface', 'architecture-diagram'],
      })),
    }));

    const { executeViewCommand } = await import('../../../src/cli/commands/view.js');
    const config = new Config(testDir);

    await executeViewCommand({ args: ['set'], config });

    const reloaded = new Config(testDir);
    expect(reloaded.getViewLayer()).toBe(true);
    expect(reloaded.getConfiguredEnabledViews()).toEqual([
      'public-surface',
      'architecture-diagram',
    ]);
  });
});
