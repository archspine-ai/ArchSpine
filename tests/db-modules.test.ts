import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { commitBatch } from '../src/infra/db/batch.js';
import { getDriftHistory } from '../src/infra/db/repositories/drift.js';
import { getFileDocs, getTrackedFiles } from '../src/infra/db/repositories/files.js';
import { initializeRuntimeSchema } from '../src/infra/db/schema.js';
import type { FileCommitRecord } from '../src/infra/db/types.js';
import { CURRENT_SCHEMA_VERSION, type SpineUnit } from '../src/types/protocol.js';

function createTestUnit(filePath: string, hash: string): SpineUnit {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    identity: {
      filePath,
      contentHash: hash,
      language: 'typescript',
      fileKind: 'source',
      scope: 'src',
    },
    semantic: {
      role: 'Module test',
      responsibilities: ['Verify DB modules'],
      outOfScope: [],
      invariants: [],
      changeIntent: {
        architecturalIntent: 'Exercise module-level DB helpers',
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

describe('DB modules', () => {
  it('initializes schema tables and migrated file columns', () => {
    const db = new Database(':memory:');

    initializeRuntimeSchema(db);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as Array<{ name: string }>;
    const tableNames = new Set(tables.map((row) => row.name));
    expect(tableNames.has('files')).toBe(true);
    expect(tableNames.has('symbols')).toBe(true);
    expect(tableNames.has('usage_logs')).toBe(true);
    expect(tableNames.has('violations')).toBe(true);
    expect(tableNames.has('drift_events')).toBe(true);

    const columns = db.prepare('PRAGMA table_info(files)').all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((row) => row.name));
    expect(columnNames.has('mtime')).toBe(true);
    expect(columnNames.has('size')).toBe(true);

    db.close();
  });

  it('commits file records and drift history through extracted batch helper', () => {
    const db = new Database(':memory:');
    initializeRuntimeSchema(db);

    const commits: FileCommitRecord[] = [
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
        driftInfo: {
          previousRole: 'Old role',
          previousResponsibilities: ['Old responsibility'],
          driftReason: 'Changed responsibility split',
        },
      },
    ];

    commitBatch(db, commits);

    expect(getTrackedFiles(db)).toEqual(['src/a.ts', 'src/b.ts']);
    expect(getFileDocs(db, 'src/a.ts')?.identity.filePath).toBe('src/a.ts');
    expect(getDriftHistory(db, 'src/b.ts', 10)).toMatchObject([
      {
        filePath: 'src/b.ts',
        previousRole: 'Old role',
        previousResponsibilities: ['Old responsibility'],
      },
    ]);

    db.close();
  });

  it('ignores duplicate-column migration errors but rethrows unexpected ALTER TABLE failures', () => {
    const exec = (sql: string) => {
      if (sql.includes('ADD COLUMN mtime')) {
        const error = new Error('duplicate column name: mtime');
        throw error;
      }
      if (sql.includes('ADD COLUMN size')) {
        const error = new Error('disk I/O error');
        throw error;
      }
    };

    const fakeDb = {
      pragma: () => undefined,
      exec,
    } as unknown as Database.Database;

    expect(() => initializeRuntimeSchema(fakeDb)).toThrow('disk I/O error');
  });
});
