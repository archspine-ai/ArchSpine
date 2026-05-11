import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { readIndexDocument } from '../../../src/infra/index-reader.js';
import { CURRENT_SCHEMA_VERSION } from '../../../src/types/protocol.js';

describe('index reader schema enforcement', () => {
  const createdDirs: string[] = [];

  afterEach(() => {
    for (const dir of createdDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('rejects unsupported file units and requires a rebuild', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-index-schema-'));
    createdDirs.push(rootDir);
    const indexPath = path.join(rootDir, '.spine', 'index', 'src', 'unsupported.ts.json');
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
    fs.writeFileSync(
      indexPath,
      JSON.stringify(
        {
          schemaVersion: '9.9.9',
          identity: {
            filePath: 'src/unsupported.ts',
            contentHash: 'hash-unsupported',
            language: 'typescript',
            fileKind: 'source',
            scope: 'src',
          },
          semantic: {
            role: 'Unsupported file',
            responsibilities: ['Exercise strict schema rejection'],
            outOfScope: [],
            invariants: ['Must stay deterministic'],
            changeIntent: {
              architecturalIntent: null,
              recentChangeIntent: null,
            },
            publicSurface: [{ symbolName: 'unsupported', description: 'Unsupported export' }],
          },
          skeleton: {
            imports: [],
            exports: [{ name: 'unsupported', kind: 'function', signature: '() => void' }],
            declaredSymbols: [],
            structuralHints: {
              importCount: 0,
              exportCount: 1,
            },
          },
          graph: {
            dependsOn: [],
          },
          provenance: {
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: 'archspine/9.9.9',
            pipelineStages: ['ast'],
          },
        },
        null,
        2,
      ),
    );

    const result = readIndexDocument(rootDir, indexPath);

    expect(result.status).toBe('incompatible-schema');
    if (result.status !== 'incompatible-schema') {
      return;
    }
    expect(result.schemaVersion).toBe('9.9.9');
    expect(result.expectedSchemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.message).toContain('spine build');
  });

  it('rejects unsupported schema versions outside the current contract', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-index-unsupported-'));
    createdDirs.push(rootDir);
    const indexPath = path.join(rootDir, '.spine', 'index', 'project.json');
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
    fs.writeFileSync(
      indexPath,
      JSON.stringify(
        {
          schemaVersion: '2.0.0',
          projectName: 'demo',
          role: 'Demo project',
          responsibility: 'Exercise unsupported schema handling',
          modules: [],
          provenance: {
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: 'archspine/2.0.0',
            pipelineStages: ['aggregate'],
          },
        },
        null,
        2,
      ),
    );

    const result = readIndexDocument(rootDir, indexPath);

    expect(result.status).toBe('incompatible-schema');
    if (result.status !== 'incompatible-schema') {
      return;
    }
    expect(result.schemaVersion).toBe('2.0.0');
  });

  it('fails closed when an unsupported file envelope is missing required semantic fields', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-index-semantic-gap-'));
    createdDirs.push(rootDir);
    const indexPath = path.join(rootDir, '.spine', 'index', 'src', 'partial.ts.json');
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
    fs.writeFileSync(
      indexPath,
      JSON.stringify(
        {
          schemaVersion: '9.9.9',
          identity: {
            filePath: 'src/partial.ts',
            contentHash: 'hash-partial',
            language: 'typescript',
            fileKind: 'source',
            scope: 'src',
          },
          semantic: {
            responsibilities: ['Missing role should still force rebuild'],
            outOfScope: [],
            changeIntent: {
              architecturalIntent: null,
              recentChangeIntent: null,
            },
            publicSurface: [],
          },
          skeleton: {
            imports: [],
            exports: [],
            declaredSymbols: [],
            structuralHints: {
              importCount: 0,
              exportCount: 0,
            },
          },
          graph: {
            dependsOn: [],
          },
          provenance: {
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: 'archspine/9.9.9',
            pipelineStages: ['ast'],
          },
        },
        null,
        2,
      ),
    );

    const result = readIndexDocument(rootDir, indexPath);

    expect(result.status).toBe('incompatible-schema');
    if (result.status !== 'incompatible-schema') {
      return;
    }
    expect(result.message).toContain('spine build');
  });
});
