import { afterEach, describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { SyncService } from '../src/services/sync-service.js';
import { MockClient } from '../src/infra/__mocks__/llm.js';
import { CURRENT_SCHEMA_VERSION } from '../src/types/protocol.js';

// Import schemas
import spineUnitSchema from '../schemas/spine-unit.schema.json';
import sharedSchema from '../schemas/shared.schema.json';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});
addFormats(ajv);

// Pre-add shared schema so refs work
ajv.addSchema(sharedSchema);
const validate = ajv.compile(spineUnitSchema);

const VALIDATE_WORKSPACE_INDEX_ENV = 'SPINE_VALIDATE_WORKSPACE_INDEX';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

describe('Schema Compliance', () => {
  const createdDirs: string[] = [];

  afterEach(() => {
    for (const dir of createdDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('validates freshly generated index files from a clean fixture repository', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-schema-fixture-'));
    createdDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify(
        { name: 'archspine-schema-fixture', version: '1.0.0', type: 'module' },
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
    execFileSync('git', ['commit', '-m', 'Init schema fixture'], { cwd: rootDir, stdio: 'pipe' });

    const synchronizer = new SyncService({
      rootDir,
      llmClient: new MockClient({ apiKey: '' }),
      targetLocales: ['English'],
    });
    const stats = await synchronizer.sync(true);
    expect(stats.processed).toBeGreaterThan(0);

    const generatedIndexDir = path.join(rootDir, '.spine', 'index');
    const generatedFiles = getAllFiles(generatedIndexDir).filter((file) => file.endsWith('.json'));
    expect(generatedFiles.length).toBeGreaterThan(0);

    for (const fullPath of generatedFiles) {
      if (fullPath.endsWith('folder.json') || fullPath.endsWith('project.json')) {
        continue;
      }

      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const valid = validate(data);
      if (!valid) {
        console.error(`Validation failed for generated fixture ${fullPath}:`, validate.errors);
      }
      expect(valid).toBe(true);
    }
  });

  it('optionally validates the current workspace index when explicitly enabled', () => {
    if (
      !['1', 'true', 'yes', 'on'].includes(
        (process.env[VALIDATE_WORKSPACE_INDEX_ENV] || '').toLowerCase(),
      )
    ) {
      return;
    }

    const indexDir = path.join(process.cwd(), '.spine', 'index');
    if (!fs.existsSync(indexDir)) {
      return;
    }

    const indexFiles = getAllFiles(indexDir).filter((f) => f.endsWith('.json'));
    for (const fullPath of indexFiles) {
      if (fullPath.endsWith('folder.json') || fullPath.endsWith('project.json')) {
        continue;
      }

      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const looksLikeCurrentSpineUnit =
        data?.schemaVersion === CURRENT_SCHEMA_VERSION &&
        data?.identity &&
        data?.semantic &&
        data?.skeleton &&
        data?.provenance &&
        typeof data?.skeleton?.structuralHints?.isBarrel === 'boolean' &&
        typeof data?.skeleton?.structuralHints?.isTypeOnly === 'boolean' &&
        Array.isArray(data?.graph?.dependedBy) &&
        typeof data?.graph?.reverseIndexComplete === 'boolean' &&
        Array.isArray(data?.graph?.symbolEdges);

      if (!looksLikeCurrentSpineUnit) {
        continue;
      }

      const valid = validate(data);
      if (!valid) {
        console.error(`Validation failed for ${fullPath}:`, validate.errors);
      }
      expect(valid).toBe(true);
    }
  });

  it('should reject a malformed SpineUnit missing required fields', () => {
    const malformed = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      identity: { filePath: 'test.ts' },
      // missing semantic, skeleton, etc.
    };
    const valid = validate(malformed);
    expect(valid).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === 'required')).toBe(true);
  });

  it('should accept language-keyed semantic.localized content', () => {
    const withLocalized = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      identity: {
        filePath: 'docs/example.md',
        contentHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        language: 'unsupported',
        fileKind: 'document',
        scope: 'docs',
      },
      semantic: {
        role: 'Example document',
        responsibilities: ['Explain behavior'],
        outOfScope: [],
        invariants: [],
        changeIntent: {
          architecturalIntent: null,
          recentChangeIntent: null,
        },
        publicSurface: [],
        localized: {
          English: {
            purpose: 'Explain behavior',
            key_takeaways: ['One', 'Two'],
          },
          'zh-CN': {
            purpose: '解释行为',
          },
        },
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
        indexedAt: '2026-04-12T00:00:00.000Z',
        generatorVersion: 'archspine/test',
        pipelineStages: ['ast', 'llm'],
      },
    };

    const valid = validate(withLocalized);
    expect(valid).toBe(true);
  });
});
