import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ContextEngine } from '../../../src/engines/context.js';

describe('ContextEngine lightweight relevance sorting', () => {
  let rootDir: string;

  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-context-engine-'));
    fs.mkdirSync(path.join(rootDir, 'src', 'feature'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, 'src', 'shared'), { recursive: true });
    fs.mkdirSync(path.join(rootDir, 'src', 'far', 'nested'), { recursive: true });

    fs.writeFileSync(
      path.join(rootDir, 'src', 'feature', 'current.ts'),
      'export const current = true;',
    );
    fs.writeFileSync(
      path.join(rootDir, 'src', 'feature', 'local-helper.ts'),
      'export const localHelper = true;',
    );
    fs.writeFileSync(
      path.join(rootDir, 'src', 'shared', 'api-client.ts'),
      'export const apiClient = true;',
    );
    fs.writeFileSync(
      path.join(rootDir, 'src', 'far', 'nested', 'weak.ts'),
      'export const weak = true;',
    );
  });

  afterEach(() => {
    if (rootDir && fs.existsSync(rootDir)) {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it('prioritizes stronger dependency summaries over weaker ones', () => {
    const engine = new ContextEngine(rootDir);
    const manifest = {
      getFileDocs(filePath: string) {
        const docs: Record<string, any> = {
          'src/feature/local-helper.ts': {
            semantic: {
              role: 'Local helper',
              responsibilities: ['Feature shaping', 'Shared feature utility'],
              publicSurface: [{ symbolName: 'localHelper' }, { symbolName: 'shapeFeature' }],
            },
            skeleton: {
              exports: [{ name: 'localHelper' }, { name: 'shapeFeature' }],
            },
          },
          'src/shared/api-client.ts': {
            semantic: {
              role: 'Shared API client',
              responsibilities: ['Fetch remote data'],
              publicSurface: [{ symbolName: 'apiClient' }],
            },
            skeleton: {
              exports: [{ name: 'apiClient' }],
            },
          },
          'src/far/nested/weak.ts': {
            semantic: {
              role: 'Weak distant helper',
              responsibilities: [],
              publicSurface: [],
            },
            skeleton: {
              exports: [],
            },
          },
        };
        return docs[filePath];
      },
      resolveSymbol() {
        return [];
      },
    } as any;

    const result = engine.resolveDependencies(
      'src/feature/current.ts',
      {
        imports: [
          { source: './local-helper', symbols: ['localHelper', 'shapeFeature'] },
          { source: '../shared/api-client', symbols: ['apiClient'] },
          { source: '../far/nested/weak', symbols: ['weak'] },
        ],
        exports: [],
        usages: [],
      },
      manifest,
    );

    const localIndex = result.contextData.indexOf('`src/feature/local-helper.ts`');
    const sharedIndex = result.contextData.indexOf('`src/shared/api-client.ts`');
    const weakIndex = result.contextData.indexOf('`src/far/nested/weak.ts`');

    expect(localIndex).toBeGreaterThanOrEqual(0);
    expect(sharedIndex).toBeGreaterThanOrEqual(0);
    expect(weakIndex).toBeGreaterThanOrEqual(0);
    expect(localIndex).toBeLessThan(sharedIndex);
    expect(sharedIndex).toBeLessThan(weakIndex);
    expect(result.diagnostics.retainedDependencyCandidates[0].path).toBe(
      'src/feature/local-helper.ts',
    );
    expect(
      result.diagnostics.retainedDependencyCandidates[0].contributions.some(
        (contribution) => contribution.factor === 'same-directory',
      ),
    ).toBe(true);
  });

  it('prioritizes direct imported symbol targets over weaker indirect candidates', () => {
    const engine = new ContextEngine(rootDir);
    const manifest = {
      getFileDocs(filePath: string) {
        const docs: Record<string, any> = {
          'src/shared/api-client.ts': {
            semantic: {
              role: 'Shared API client',
              responsibilities: ['Fetch remote data'],
              publicSurface: [{ symbolName: 'apiClient' }],
            },
            skeleton: {
              exports: [{ name: 'apiClient' }],
            },
          },
          'src/far/nested/weak.ts': {
            semantic: {
              role: 'Weak distant helper',
              responsibilities: ['Unrelated fallback'],
              publicSurface: [],
            },
            skeleton: {
              exports: [{ name: 'apiClient' }],
            },
          },
        };
        return docs[filePath];
      },
      resolveSymbol(symbol: string) {
        if (symbol === 'apiClient') {
          return ['src/far/nested/weak.ts', 'src/shared/api-client.ts'];
        }
        return [];
      },
    } as any;

    const result = engine.resolveDependencies(
      'src/feature/current.ts',
      {
        imports: [{ source: '../shared/api-client', symbols: ['apiClient'] }],
        exports: [],
        usages: ['apiClient'],
      },
      manifest,
    );

    const referenceLine = result.contextData
      .split('\n')
      .find((line) => line.includes('Symbol `apiClient` likely references'));

    expect(referenceLine).toBeDefined();
    expect(referenceLine).toContain('`src/shared/api-client.ts`, `src/far/nested/weak.ts`');
    expect(result.diagnostics.symbolTargets).toHaveLength(1);
    expect(result.diagnostics.symbolTargets[0].usage).toBe('apiClient');
    expect(
      result.diagnostics.symbolTargets[0].retainedTargets[0].contributions.some(
        (contribution) => contribution.factor === 'exact-imported-symbol',
      ),
    ).toBe(true);
  });

  it('adds rule-aware weighting during validate mode for matching dependencies and symbol targets', () => {
    const engine = new ContextEngine(rootDir);
    const manifest = {
      getFileDocs(filePath: string) {
        const docs: Record<string, any> = {
          'src/feature/local-helper.ts': {
            semantic: {
              role: 'Local helper',
              responsibilities: ['Feature shaping'],
              publicSurface: [{ symbolName: 'localHelper' }],
            },
            skeleton: {
              exports: [{ name: 'localHelper' }],
            },
          },
          'src/shared/api-client.ts': {
            semantic: {
              role: 'Shared API client',
              responsibilities: ['Fetch remote data'],
              publicSurface: [{ symbolName: 'apiClient' }, { symbolName: 'fetchInvoiceData' }],
            },
            skeleton: {
              exports: [{ name: 'apiClient' }, { name: 'fetchInvoiceData' }],
            },
          },
        };
        return docs[filePath];
      },
      resolveSymbol(symbol: string) {
        if (symbol === 'apiClient') {
          return ['src/feature/local-helper.ts', 'src/shared/api-client.ts'];
        }
        return [];
      },
    } as any;

    const result = engine.resolveDependencies(
      'src/feature/current.ts',
      {
        imports: [
          { source: './local-helper', symbols: ['localHelper'] },
          { source: '../shared/api-client', symbols: ['apiClient', 'fetchInvoiceData'] },
        ],
        exports: [],
        usages: ['apiClient'],
      },
      manifest,
      {
        taskMode: 'validate',
        ruleData: [
          '[Rule: no-direct-db] (Severity: error)',
          'Title: Use API client boundary',
          'Summary: Service must call api-client and fetchInvoiceData through the shared API client.',
        ].join('\n'),
      },
    );

    expect(result.diagnostics.retainedDependencyCandidates[0].path).toBe(
      'src/shared/api-client.ts',
    );
    expect(
      result.diagnostics.retainedDependencyCandidates[0].contributions.some(
        (contribution) => contribution.factor === 'rule-keyword-match',
      ),
    ).toBe(true);
    expect(result.diagnostics.symbolTargets[0].retainedTargets[0].path).toBe(
      'src/shared/api-client.ts',
    );
    expect(
      result.diagnostics.symbolTargets[0].retainedTargets[0].contributions.some(
        (contribution) => contribution.factor === 'rule-keyword-match',
      ),
    ).toBe(true);
  });

  it('keeps dependency diagnostics split between retained and truncated candidates through the shared formatter', () => {
    const engine = new ContextEngine(rootDir);
    fs.writeFileSync(
      path.join(rootDir, 'src', 'shared', 'extra-1.ts'),
      'export const extra1 = true;',
    );
    fs.writeFileSync(
      path.join(rootDir, 'src', 'shared', 'extra-2.ts'),
      'export const extra2 = true;',
    );
    fs.writeFileSync(
      path.join(rootDir, 'src', 'shared', 'extra-3.ts'),
      'export const extra3 = true;',
    );
    fs.writeFileSync(
      path.join(rootDir, 'src', 'shared', 'extra-4.ts'),
      'export const extra4 = true;',
    );
    const manifest = {
      getFileDocs(filePath: string) {
        return {
          semantic: {
            role: `Role for ${filePath}`,
            responsibilities: ['shared'],
            publicSurface: [{ symbolName: path.basename(filePath, '.ts') }],
          },
          skeleton: {
            exports: [{ name: path.basename(filePath, '.ts') }],
          },
        };
      },
      resolveSymbol() {
        return [];
      },
    } as any;

    const result = engine.resolveDependencies(
      'src/feature/current.ts',
      {
        imports: [
          { source: './local-helper', symbols: ['localHelper'] },
          { source: '../shared/api-client', symbols: ['apiClient'] },
          { source: '../far/nested/weak', symbols: ['weak'] },
          { source: '../shared/extra-1', symbols: ['extra1'] },
          { source: '../shared/extra-2', symbols: ['extra2'] },
          { source: '../shared/extra-3', symbols: ['extra3'] },
          { source: '../shared/extra-4', symbols: ['extra4'] },
        ],
        exports: [],
        usages: [],
      },
      manifest,
    );

    expect(result.diagnostics.retainedDependencyCandidates.length).toBe(6);
    expect(result.diagnostics.truncatedDependencyCandidates.length).toBe(1);
  });
});
