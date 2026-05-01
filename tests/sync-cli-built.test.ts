import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const builtCliPath = path.join(repoRoot, 'dist', 'cli', 'index.js');

function makeTempRepo(): string {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-sync-cli-built-'));

  fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, 'package.json'),
    JSON.stringify(
      { name: 'archspine-built-sync-fixture', version: '1.0.0', type: 'module' },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(rootDir, 'src', 'index.ts'), 'export const answer = 42;\n');

  execFileSync('git', ['init', '-b', 'main'], { cwd: rootDir, stdio: 'pipe' });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], {
    cwd: rootDir,
    stdio: 'pipe',
  });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: rootDir, stdio: 'pipe' });
  execFileSync('git', ['add', '.'], { cwd: rootDir, stdio: 'pipe' });
  execFileSync('git', ['commit', '-m', 'Init built CLI sync fixture'], {
    cwd: rootDir,
    stdio: 'pipe',
  });

  return rootDir;
}

function configureMockProvider(rootDir: string): void {
  execFileSync('node', [builtCliPath, 'llm', '--project', 'set', 'provider', 'mock'], {
    cwd: rootDir,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
}

function runBuiltSync(rootDir: string, env?: NodeJS.ProcessEnv, args: string[] = []) {
  return spawnSync('node', [builtCliPath, 'sync', ...args], {
    cwd: rootDir,
    env: { ...process.env, ...env },
    encoding: 'utf-8',
    stdio: 'pipe',
  });
}

function runBuiltBuild(rootDir: string, env?: NodeJS.ProcessEnv, args: string[] = []) {
  return spawnSync('node', [builtCliPath, 'build', ...args], {
    cwd: rootDir,
    env: { ...process.env, ...env },
    encoding: 'utf-8',
    stdio: 'pipe',
  });
}

describe('built sync CLI integration', () => {
  const createdDirs: string[] = [];

  beforeAll(() => {
    if (!fs.existsSync(builtCliPath)) {
      throw new Error(
        `Built CLI missing at ${builtCliPath}. Run 'npm run build' before this suite.`,
      );
    }
  });

  afterEach(() => {
    for (const dir of createdDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('does not emit view artifacts when the experimental view layer is disabled', () => {
    const rootDir = makeTempRepo();
    createdDirs.push(rootDir);
    configureMockProvider(rootDir);

    const buildResult = runBuiltBuild(rootDir, { SPINE_EXPERIMENTAL_VIEW_LAYER: 'false' });
    expect(buildResult.status).toBe(0);

    const result = runBuiltSync(rootDir, { SPINE_EXPERIMENTAL_VIEW_LAYER: 'false' });
    const output = `${result.stdout || ''}${result.stderr || ''}`;

    expect(result.status).toBe(0);
    expect(output).toContain('[Spine Sync Summary]');
    expect(fs.existsSync(path.join(rootDir, '.spine', 'view'))).toBe(false);
  }, 120_000);

  it('emits experimental view artifacts through the built CLI when enabled by env', () => {
    const rootDir = makeTempRepo();
    createdDirs.push(rootDir);
    configureMockProvider(rootDir);

    const buildResult = runBuiltBuild(rootDir, { SPINE_EXPERIMENTAL_VIEW_LAYER: 'false' });
    expect(buildResult.status).toBe(0);
    fs.writeFileSync(path.join(rootDir, 'src', 'index.ts'), 'export const answer = 43;\n');

    const result = runBuiltSync(rootDir, { SPINE_EXPERIMENTAL_VIEW_LAYER: 'true' });
    const output = `${result.stdout || ''}${result.stderr || ''}`;
    const publicSurfacePath = path.join(rootDir, '.spine', 'view', 'public-surface.json');
    const riskHotspotsPath = path.join(rootDir, '.spine', 'view', 'risk-hotspots.json');
    const publicSurfaceMarkdownPath = path.join(
      rootDir,
      '.spine',
      'view',
      'pages',
      'public-surface.md',
    );
    const riskHotspotsMarkdownPath = path.join(
      rootDir,
      '.spine',
      'view',
      'pages',
      'risk-hotspots.md',
    );
    const architectureJsonPath = path.join(rootDir, '.spine', 'view', 'architecture-diagram.json');
    const architectureHtmlPath = path.join(rootDir, '.spine', 'view', 'architecture-diagram.html');

    expect(result.status).toBe(0);
    expect(output).toContain('[Spine Sync Summary]');
    expect(fs.existsSync(publicSurfacePath)).toBe(true);
    expect(fs.existsSync(riskHotspotsPath)).toBe(true);
    expect(fs.existsSync(publicSurfaceMarkdownPath)).toBe(true);
    expect(fs.existsSync(riskHotspotsMarkdownPath)).toBe(true);
    expect(fs.existsSync(architectureJsonPath)).toBe(false);
    expect(fs.existsSync(architectureHtmlPath)).toBe(false);

    const publicSurface = JSON.parse(fs.readFileSync(publicSurfacePath, 'utf-8')) as {
      experimental: boolean;
      viewType: string;
      items: unknown[];
      summary: string;
    };
    const riskHotspots = JSON.parse(fs.readFileSync(riskHotspotsPath, 'utf-8')) as {
      experimental: boolean;
      viewType: string;
      items: unknown[];
      summary: string;
    };

    expect(publicSurface.experimental).toBe(true);
    expect(publicSurface.viewType).toBe('public-surface');
    expect(Array.isArray(publicSurface.items)).toBe(true);
    expect(publicSurface.items.length).toBeGreaterThan(0);
    expect(publicSurface.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entrypoint: 'package.json',
          kind: 'config',
        }),
      ]),
    );
    expect(typeof publicSurface.summary).toBe('string');
    expect(publicSurface.summary.length).toBeGreaterThan(0);

    expect(riskHotspots.experimental).toBe(true);
    expect(riskHotspots.viewType).toBe('risk-hotspots');
    expect(riskHotspots.items).toEqual([]);
    expect(riskHotspots.summary).toContain('No high-confidence risk hotspots');
    expect(fs.readFileSync(publicSurfaceMarkdownPath, 'utf-8')).toContain('# Public Surface Map');
    expect(fs.readFileSync(riskHotspotsMarkdownPath, 'utf-8')).toContain('# Risk Hotspots Report');
  });

  it('emits architecture diagram artifacts through build', () => {
    const rootDir = makeTempRepo();
    createdDirs.push(rootDir);
    configureMockProvider(rootDir);

    const result = runBuiltBuild(rootDir, { SPINE_EXPERIMENTAL_VIEW_LAYER: 'true' });
    const output = `${result.stdout || ''}${result.stderr || ''}`;
    const architectureJsonPath = path.join(rootDir, '.spine', 'view', 'architecture-diagram.json');
    const architectureHtmlPath = path.join(rootDir, '.spine', 'view', 'architecture-diagram.html');

    expect(result.status).toBe(0);
    expect(output).toContain('[Spine Build Summary]');
    expect(fs.existsSync(architectureJsonPath)).toBe(true);
    expect(fs.existsSync(architectureHtmlPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(architectureJsonPath, 'utf-8'))).toEqual(
      expect.objectContaining({
        title: 'Mock Architecture Diagram',
      }),
    );
    expect(fs.readFileSync(architectureHtmlPath, 'utf-8')).toContain('<svg');
  });
});
