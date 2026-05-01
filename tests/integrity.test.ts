import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Manifest } from '../src/infra/manifest.js';
import { SpineDB } from '../src/infra/db.js';
import { CURRENT_SCHEMA_VERSION, SpineUnit } from '../src/types/protocol.js';

function createTestUnit(filePath: string, hash: string): SpineUnit {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    identity: {
      filePath,
      contentHash: hash,
      language: 'typescript',
      fileKind: 'source',
      scope: path.posix.dirname(filePath) === '.' ? '' : path.posix.dirname(filePath),
    },
    semantic: {
      role: 'Test role',
      responsibilities: ['Test responsibility'],
      outOfScope: [],
      invariants: [],
      changeIntent: {
        architecturalIntent: 'Test architecture intent',
        recentChangeIntent: null,
      },
      publicSurface: [],
      ruleViolations: [],
      driftDetected: false,
      driftReason: null,
    },
    skeleton: {
      imports: [],
      exports: [],
      declaredSymbols: [],
      structuralHints: {
        importCount: 0,
        exportCount: 0,
        isBarrel: false,
        isTypeOnly: false,
      },
    },
    graph: {
      dependsOn: [],
      dependedBy: [],
      reverseIndexComplete: false,
      symbolEdges: [],
    },
    provenance: {
      indexedAt: new Date().toISOString(),
      generatorVersion: 'archspine/test',
      pipelineStages: ['ast', 'llm'],
    },
  };
}

function createTempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-integrity-'));
}

describe('Integrity hardening', () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    for (const root of tempRoots.splice(0)) {
      if (fs.existsSync(root)) {
        fs.rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it('rolls back the entire batch when one transactional write fails', () => {
    const rootDir = createTempRoot();
    tempRoots.push(rootDir);

    const db = new SpineDB(rootDir);
    const sqlite = (db as any).db;
    const originalPrepare = sqlite.prepare.bind(sqlite);
    let writeCount = 0;

    vi.spyOn(sqlite, 'prepare').mockImplementation((sql: string) => {
      const stmt = originalPrepare(sql);
      if (!sql.includes('INSERT INTO files')) {
        return stmt;
      }

      return new Proxy(stmt, {
        get(target, prop, receiver) {
          if (prop === 'run') {
            return (...args: unknown[]) => {
              writeCount += 1;
              if (writeCount === 2) {
                throw new Error('simulated batch failure');
              }
              return target.run(...args);
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      });
    });

    expect(() =>
      db.commitBatch([
        {
          filePath: 'src/a.ts',
          hash: 'hash-a',
          kind: 'source',
          spineUnit: createTestUnit('src/a.ts', 'hash-a'),
          locales: ['English'],
        },
        {
          filePath: 'src/b.ts',
          hash: 'hash-b',
          kind: 'source',
          spineUnit: createTestUnit('src/b.ts', 'hash-b'),
          locales: ['English'],
        },
      ]),
    ).toThrow('simulated batch failure');

    expect(db.getTrackedFiles()).toEqual([]);
    expect(db.getFileDocs('src/a.ts')).toBeUndefined();
    expect(db.getFileDocs('src/b.ts')).toBeUndefined();
    db.close();
  });

  it('normalizes repo paths consistently across manifest read and write APIs', () => {
    const rootDir = createTempRoot();
    tempRoots.push(rootDir);

    const manifest = Manifest.open(rootDir);
    const normalizedPath = 'src/auth.ts';
    const hash = 'hash-auth';
    const unit = createTestUnit(normalizedPath, hash);

    manifest.updateFileStatusWithDocs('./src/auth.ts', hash, 'source', unit, ['English']);

    expect(manifest.needsUpdate('src/auth.ts', hash)).toBe(false);
    expect(manifest.needsUpdate('./src/auth.ts', hash)).toBe(false);
    expect(manifest.needsUpdate('src\\auth.ts', hash)).toBe(false);

    expect(manifest.getFileDocs('src/auth.ts')?.identity.filePath).toBe(normalizedPath);
    expect(manifest.getFileDocs('./src/auth.ts')?.identity.filePath).toBe(normalizedPath);
    expect(manifest.getFileDocs('src\\auth.ts')?.identity.filePath).toBe(normalizedPath);
  });
});
