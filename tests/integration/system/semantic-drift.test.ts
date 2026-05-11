import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { SyncService } from '../../../src/services/sync-service.js';
import type { LLMClient, PreviousSemanticContext } from '../../../src/infra/llm.js';
import { Manifest } from '../../../src/infra/manifest.js';

class DriftMockClient implements LLMClient {
  public sawPreviousSemanticOnSecondPass = false;

  async generateSummary(
    filePath: string,
    content: string,
    contextData?: string,
    ruleData?: string,
    gitIntent?: string,
    branch?: string,
    status?: string,
    previousSemantic?: PreviousSemanticContext,
  ) {
    const hasPrevious = Boolean(previousSemantic);
    if (hasPrevious) {
      this.sawPreviousSemanticOnSecondPass = true;
    }

    return {
      json: {
        semantic: {
          role: hasPrevious ? 'API client with business orchestration' : 'Pure helper utilities',
          responsibilities: hasPrevious
            ? ['Call remote APIs', 'Coordinate business workflow']
            : ['Provide pure helper functions'],
          outOfScope: hasPrevious ? [] : ['Remote API calls'],
          invariants: [],
          changeIntent: {
            architecturalIntent: hasPrevious
              ? 'Orchestrate external integration flow'
              : 'Offer stateless utility helpers',
            recentChangeIntent: gitIntent ?? null,
          },
          publicSurface: [
            {
              symbolName: 'helper',
              description: hasPrevious ? 'Runs integration workflow' : 'Formats data',
            },
          ],
          driftDetected: hasPrevious,
          driftReason: hasPrevious
            ? 'Module responsibility expanded from pure helpers into external API orchestration.'
            : null,
          ruleViolations: [],
        },
        skeleton: {
          imports: [],
          exports: [{ name: 'helper', kind: 'function', signature: 'helper()' }],
          declaredSymbols: [
            { name: 'helper', kind: 'function', exported: true, symbolUri: `${filePath}#helper` },
          ],
          structuralHints: { importCount: 0, exportCount: 1, isBarrel: false, isTypeOnly: false },
        },
        graph: {
          dependsOn: [],
          dependedBy: [],
          reverseIndexComplete: false,
          symbolEdges: [],
        },
      },
      markdown: { English: `# File: ${filePath}\n\n## Role\nMock summary in English` },
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
    };
  }

  async generateFolderSummary() {
    return {
      json: { role: 'Folder role', responsibility: 'Folder responsibility' },
      markdown: { English: '# Folder' },
    };
  }

  async generateProjectSummary() {
    return {
      json: { role: 'Project role', responsibility: 'Project responsibility' },
      markdown: { English: '# Project' },
    };
  }
}

describe('Semantic Drift Detection', () => {
  let testDir: string;
  let client: DriftMockClient;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-drift-'));
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, 'src', 'helper.ts'),
      'export function helper() { return 1; }\n',
    );

    execSync('git init -b main', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Initial helper"', { cwd: testDir });

    client = new DriftMockClient();
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('persists previous semantic docs and reports drift on later syncs', async () => {
    const synchronizer = new SyncService({
      rootDir: testDir,
      llmClient: client,
    });
    await synchronizer.sync(true);

    const manifest = Manifest.open(testDir);
    const firstDocs = manifest.getFileDocs('src/helper.ts');
    expect(firstDocs?.semantic.role).toBe('Pure helper utilities');
    expect(firstDocs?.semantic.driftDetected).toBe(false);

    fs.writeFileSync(
      path.join(testDir, 'src', 'helper.ts'),
      'export async function helper() { const response = await fetch("https://example.com"); return response.status; }\nexport const triggerStructuralChange = true;\n',
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await synchronizer.sync(false);

    expect(client.sawPreviousSemanticOnSecondPass).toBe(true);

    const secondDocs = manifest.getFileDocs('src/helper.ts');
    expect(secondDocs?.semantic.driftDetected).toBe(true);
    expect(secondDocs?.semantic.driftReason).toContain('expanded from pure helpers');
    expect(
      warnSpy.mock.calls.some((call) => call.join(' ').includes('[Semantic Change] src/helper.ts')),
    ).toBe(true);
  });
});
