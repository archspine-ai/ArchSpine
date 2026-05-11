import { describe, expect, it, vi } from 'vitest';
import { ContextEngine } from '../../../src/engines/context.js';
import type { FileSkeleton } from '../../../src/ast/extractor.js';

function makeMockManifest(overrides?: Record<string, unknown>) {
  return {
    getFileDocs: vi.fn().mockReturnValue(null),
    resolveSymbol: vi.fn().mockReturnValue([]),
    ...overrides,
  };
}

function makeSkeleton(overrides?: Partial<FileSkeleton>): FileSkeleton {
  return {
    imports: [
      { source: './utils.js', symbols: ['helper'] },
      { source: '../infra/db.js', symbols: ['connect'] },
      { source: 'external-lib', symbols: [] },
    ],
    exports: [
      { name: 'Handler', kind: 'class', signature: 'class Handler' },
      { name: 'handleRequest', kind: 'function', signature: '(req: Request) => Response' },
    ],
    usages: ['helper', 'connect', 'unknownSymbol'],
    ...overrides,
  };
}

describe('ContextEngine', () => {
  it('Main Path: resolves import targets and builds context data', () => {
    const engine = new ContextEngine('/fake/root');
    const manifest = makeMockManifest();
    const skeleton = makeSkeleton();

    const result = engine.resolveDependencies('src/api/handler.ts', skeleton, manifest as any);

    expect(result.contextData).toBeTruthy();
    expect(result.contextData).toContain('Import Inventory');
    expect(result.contextData).toContain('./utils.js');
    expect(result.contextData).toContain('external-lib');

    expect(result.symbolEdges).toBeDefined();
    expect(result.diagnostics).toBeDefined();
    expect(result.diagnostics.retainedDependencyCandidates).toBeDefined();
  });

  it('Main Path: includes resolved symbol references when manifest resolves symbols', () => {
    const engine = new ContextEngine('/fake/root');
    const manifest = makeMockManifest({
      resolveSymbol: vi.fn().mockReturnValue(['src/services/auth.ts']),
    });
    const skeleton = makeSkeleton();

    const result = engine.resolveDependencies('src/api/handler.ts', skeleton, manifest as any);

    expect(result.contextData).toContain('Resolved Symbol References');
  });

  it('Boundary: omits sections when no content is available', () => {
    const engine = new ContextEngine('/fake/root');
    const manifest = makeMockManifest();
    const skeleton: FileSkeleton = { imports: [], exports: [] };

    const result = engine.resolveDependencies('empty.ts', skeleton, manifest as any);

    expect(result.contextData).toBe('');
    expect(result.symbolEdges).toHaveLength(0);
  });

  it('Boundary: side-effect imports are noted', () => {
    const engine = new ContextEngine('/fake/root');
    const manifest = makeMockManifest();
    const skeleton: FileSkeleton = {
      imports: [{ source: 'side-effect-lib', symbols: [] }],
      exports: [],
    };

    const result = engine.resolveDependencies('src/init.ts', skeleton, manifest as any);

    expect(result.contextData).toContain('side effects');
  });

  it('Boundary: filters self-references from symbol edges', () => {
    const engine = new ContextEngine('/fake/root');
    const manifest = makeMockManifest({
      resolveSymbol: vi.fn().mockReturnValue(['src/api/handler.ts']),
    });
    const skeleton = makeSkeleton({ usages: ['selfRef'] });

    const result = engine.resolveDependencies('src/api/handler.ts', skeleton, manifest as any);

    const selfEdges = result.symbolEdges.filter((e) => e.targetPath === 'src/api/handler.ts');
    expect(selfEdges).toHaveLength(0);
  });

  it('Boundary: diagnostics include retained and truncated dependency candidates', () => {
    const engine = new ContextEngine('/fake/root');
    const manifest = makeMockManifest();
    const skeleton = makeSkeleton();

    const result = engine.resolveDependencies('src/api/handler.ts', skeleton, manifest as any);

    expect(result.diagnostics).toBeDefined();
    expect(Array.isArray(result.diagnostics.retainedDependencyCandidates)).toBe(true);
    expect(Array.isArray(result.diagnostics.truncatedDependencyCandidates)).toBe(true);
    expect(Array.isArray(result.diagnostics.symbolTargets)).toBe(true);
  });

  it('Boundary: returns empty diagnostics when no usages', () => {
    const engine = new ContextEngine('/fake/root');
    const manifest = makeMockManifest();
    const skeleton: FileSkeleton = {
      imports: [],
      exports: [{ name: 'X', kind: 'class' }],
    };

    const result = engine.resolveDependencies('simple.ts', skeleton, manifest as any);

    expect(result.symbolEdges).toHaveLength(0);
    expect(result.diagnostics.symbolTargets).toHaveLength(0);
  });
});
