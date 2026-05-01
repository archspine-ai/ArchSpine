import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { resolveSpineConfig } from '../src/core/config-schema.js';
import { readIndexDocument } from '../src/infra/index-reader.js';
import { CURRENT_CONFIG_SCHEMA_VERSION, CURRENT_SCHEMA_VERSION } from '../src/types/protocol.js';

const createdDirs: string[] = [];

afterEach(() => {
  for (const dir of createdDirs.splice(0)) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('runtime schema enforcement matrix', () => {
  it('classifies config inputs across current, unsupported, malformed, and unsupported-newer cases', () => {
    const cases = [
      {
        name: 'current',
        input: {
          schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
          project: { name: 'demo', locales: ['English'] },
          llm: {},
        },
        expectedConfig: true,
      },
      {
        name: 'unsupported-older-shape',
        input: {
          schemaVersion: '0.9.0',
          project: { name: 'demo', locales: 'English' },
          llm: { baseUrl: 'https://unsupported.example/v1' },
        },
        expectedConfig: false,
        expectedIssues: [
          `schemaVersion must equal "${CURRENT_CONFIG_SCHEMA_VERSION}"`,
          'project.locales must be an array of strings',
        ],
      },
      {
        name: 'malformed',
        input: {
          schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
          project: { name: 'demo', locales: 42 },
          llm: {},
        },
        expectedConfig: false,
        expectedIssue: 'project.locales must be an array of strings',
      },
      {
        name: 'unsupported',
        input: {
          schemaVersion: '2.0.0',
          project: { name: 'demo', locales: ['English'] },
          llm: {},
        },
        expectedConfig: false,
        expectedIssue: `schemaVersion must equal "${CURRENT_CONFIG_SCHEMA_VERSION}"`,
      },
    ] as const;

    for (const testCase of cases) {
      const result = resolveSpineConfig(testCase.input);
      expect(result.config !== null, testCase.name).toBe(testCase.expectedConfig);
      if ('expectedIssue' in testCase) {
        expect(result.issues, testCase.name).toContain(testCase.expectedIssue);
      }
      if ('expectedIssues' in testCase) {
        expect(result.issues, testCase.name).toEqual(
          expect.arrayContaining(testCase.expectedIssues),
        );
      }
    }
  });

  it('classifies index inputs across current, unsupported, malformed, and unsupported-newer cases', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-runtime-schema-matrix-'));
    createdDirs.push(rootDir);

    const cases = [
      {
        name: 'current',
        relativePath: '.spine/index/src/current.ts.json',
        payload: {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          identity: {
            filePath: 'src/current.ts',
            contentHash: 'hash-current',
            language: 'typescript',
            fileKind: 'source',
            scope: 'src',
          },
          semantic: {
            role: 'Current file',
            responsibilities: ['Serve as current fixture'],
            outOfScope: [],
            invariants: [],
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
              isBarrel: false,
              isTypeOnly: false,
            },
          },
          graph: {
            dependsOn: [],
            dependedBy: [],
            reverseIndexComplete: true,
            symbolEdges: [],
          },
          provenance: {
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: 'archspine/1.0.0',
            pipelineStages: ['ast'],
          },
        },
        expectedStatus: 'ok',
      },
      {
        name: 'unsupported-older-shape',
        relativePath: '.spine/index/src/unsupported.ts.json',
        payload: {
          schemaVersion: '0.9.0',
          identity: {
            filePath: 'src/unsupported.ts',
            contentHash: 'hash-unsupported',
            language: 'typescript',
            fileKind: 'source',
            scope: 'src',
          },
          semantic: {
            role: 'Unsupported file',
            responsibilities: ['Serve as unsupported fixture'],
            outOfScope: [],
            invariants: ['Remain deterministic'],
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
            generatorVersion: 'archspine/0.9.0',
            pipelineStages: ['ast'],
          },
        },
        expectedStatus: 'incompatible-schema',
      },
      {
        name: 'unsupported-older-shape-semantic-gap',
        relativePath: '.spine/index/src/unsupported-gap.ts.json',
        payload: {
          schemaVersion: '0.9.0',
          identity: {
            filePath: 'src/unsupported-gap.ts',
            contentHash: 'hash-unsupported-gap',
            language: 'typescript',
            fileKind: 'source',
            scope: 'src',
          },
          semantic: {
            responsibilities: ['Missing role should still fail strict validation'],
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
            generatorVersion: 'archspine/0.9.0',
            pipelineStages: ['ast'],
          },
        },
        expectedStatus: 'incompatible-schema',
      },
      {
        name: 'malformed',
        relativePath: '.spine/index/src/malformed.ts.json',
        raw: '{not-valid-json',
        expectedStatus: 'invalid-json',
      },
      {
        name: 'unsupported',
        relativePath: '.spine/index/project.json',
        payload: {
          schemaVersion: '2.0.0',
          projectName: 'demo',
          role: 'Unsupported project fixture',
          responsibility: 'Exercise unsupported schema classification',
          modules: [],
          provenance: {
            indexedAt: '2026-04-18T00:00:00.000Z',
            generatorVersion: 'archspine/2.0.0',
            pipelineStages: ['aggregate'],
          },
        },
        expectedStatus: 'incompatible-schema',
      },
    ] as const;

    for (const testCase of cases) {
      const fullPath = path.join(rootDir, testCase.relativePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      if ('raw' in testCase) {
        fs.writeFileSync(fullPath, testCase.raw);
      } else {
        fs.writeFileSync(fullPath, JSON.stringify(testCase.payload, null, 2));
      }

      const result = readIndexDocument(rootDir, fullPath);
      expect(result.status, testCase.name).toBe(testCase.expectedStatus);
    }
  });
});
