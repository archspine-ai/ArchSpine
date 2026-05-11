import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('view module boundary', () => {
  it('keeps view runtime and rendering modules under src/services/view', () => {
    const repoRoot = process.cwd();
    const serviceViewDir = path.join(repoRoot, 'src', 'services', 'view');
    const infraDir = path.join(repoRoot, 'src', 'infra');

    expect(fs.existsSync(path.join(serviceViewDir, 'view-renderer.ts'))).toBe(true);
    expect(fs.existsSync(path.join(serviceViewDir, 'arch-diagram-renderer.ts'))).toBe(true);
    expect(fs.existsSync(path.join(serviceViewDir, 'view-registry.ts'))).toBe(true);
    expect(fs.existsSync(path.join(serviceViewDir, 'view-runtime.ts'))).toBe(true);

    expect(fs.existsSync(path.join(infraDir, 'view-renderer.ts'))).toBe(false);
    expect(fs.existsSync(path.join(infraDir, 'arch-diagram-renderer.ts'))).toBe(false);
    expect(fs.existsSync(path.join(infraDir, 'view-registry.ts'))).toBe(false);
    expect(fs.existsSync(path.join(infraDir, 'view-runtime.ts'))).toBe(false);
  });

  it('keeps MCP resource adapters free of view-service orchestration imports', () => {
    const repoRoot = process.cwd();
    const mcpResourcesPath = path.join(repoRoot, 'src', 'infra', 'mcp', 'resources.ts');
    const source = fs.readFileSync(mcpResourcesPath, 'utf8');

    expect(source).not.toMatch(/services\/view/);
  });
});
