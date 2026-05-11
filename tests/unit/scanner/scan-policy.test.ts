import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { Scanner } from '../../../src/engines/scanner.js';
import { Config } from '../../../src/infra/config.js';
import { DEFAULT_SCAN_POLICY } from '../../../src/core/scan-policy.js';
import { CURRENT_CONFIG_SCHEMA_VERSION } from '../../../src/types/protocol.js';

describe('ScanPolicy', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-scan-policy-'));
    fs.mkdirSync(path.join(testDir, '.spine', 'rules'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '.spine', 'index'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'benchmarks'), { recursive: true });

    fs.writeFileSync(path.join(testDir, '.gitignore'), 'dist/\nnode_modules/\n');
    fs.writeFileSync(path.join(testDir, '.spineignore'), 'benchmarks/\n');
    fs.writeFileSync(path.join(testDir, 'src', 'index.ts'), 'export const value = 1;');
    fs.writeFileSync(path.join(testDir, '.spine', 'config.json'), '{}');
    fs.writeFileSync(path.join(testDir, '.spine', 'rules', 'rule.md'), '# rule');
    fs.writeFileSync(path.join(testDir, '.spine', 'index', 'stale.json'), '{}');
    fs.writeFileSync(path.join(testDir, 'benchmarks', 'fixture.json'), '{}');

    execSync('git init -b main', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Init"', { cwd: testDir });
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('includes protocol inclusions and excludes protocol exclusions', () => {
    const scanner = new Scanner(testDir, DEFAULT_SCAN_POLICY);
    const files = scanner.getAllFiles();

    expect(files).toContain('.spine/config.json');
    expect(files).toContain('.spine/rules/rule.md');
    expect(files).not.toContain('.spine/index/stale.json');
    expect(files).not.toContain('benchmarks/fixture.json');
  });

  it('merges partial scanPolicy config with defaults', () => {
    fs.mkdirSync(path.join(testDir, '.spine'), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, '.spine', 'config.json'),
      JSON.stringify(
        {
          schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
          project: {
            name: 'scan-policy-test',
            locales: ['en-US'],
          },
          llm: {},
          scanPolicy: {
            fileSource: 'git-tracked-plus-untracked',
            ignoreChain: {
              inheritGitIgnore: false,
            },
          },
        },
        null,
        2,
      ),
    );

    const config = new Config(testDir);
    const policy = config.getScanPolicy();

    expect(policy.fileSource).toBe('git-tracked-plus-untracked');
    expect(policy.ignoreChain.inheritGitIgnore).toBe(false);
    expect(policy.ignoreChain.projectIgnore).toBe('.spineignore');
    expect(policy.protocolExclusions).toEqual(DEFAULT_SCAN_POLICY.protocolExclusions);
  });

  it('falls back to untracked files during bootstrap when no tracked files exist yet', () => {
    const bootstrapDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-bootstrap-scan-'));

    try {
      fs.mkdirSync(path.join(bootstrapDir, '.spine', 'rules'), { recursive: true });
      fs.mkdirSync(path.join(bootstrapDir, 'src'), { recursive: true });
      fs.writeFileSync(path.join(bootstrapDir, 'src', 'index.ts'), 'export const boot = 1;');
      fs.writeFileSync(path.join(bootstrapDir, '.spine', 'config.json'), '{}');
      fs.writeFileSync(path.join(bootstrapDir, '.spine', 'rules', 'rule.md'), '# rule');

      execSync('git init -b main', { cwd: bootstrapDir });

      const scanner = new Scanner(bootstrapDir, DEFAULT_SCAN_POLICY);
      const files = scanner.getAllFiles();

      expect(files).toContain('src/index.ts');
      expect(files).toContain('.spine/config.json');
      expect(files).toContain('.spine/rules/rule.md');
    } finally {
      fs.rmSync(bootstrapDir, { recursive: true, force: true });
    }
  });

  it('formats dry-run output through the shared report builder without exposing protocol exclusions as scanned files', () => {
    const scanner = new Scanner(testDir, DEFAULT_SCAN_POLICY);

    const report = scanner.getDryRunReport();
    const formatted = scanner.formatDryRunReport();

    expect(report.groupedCounts.some((group) => group.label === '.spine/index/**')).toBe(false);
    expect(formatted).toContain('Scan Policy');
    expect(formatted).toContain('Would scan:');
    expect(formatted).toContain('Notable exclusions');
  });
});
