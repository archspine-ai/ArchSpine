import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { RuleEngine } from '../../../src/engines/rules.js';

describe('RuleEngine', () => {
  const tempDirs: string[] = [];

  function setupRoot(ruleFiles?: Array<{ name: string; content: string }>): string {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-rules-'));
    tempDirs.push(rootDir);
    const rulesDir = path.join(rootDir, '.spine', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });

    if (ruleFiles) {
      for (const { name, content } of ruleFiles) {
        fs.writeFileSync(path.join(rulesDir, name), content, 'utf-8');
      }
    }

    return rootDir;
  }

  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('Main Path: loads rules from .spine/rules/ using gray-matter frontmatter', () => {
    const rootDir = setupRoot([
      {
        name: 'layered-architecture.md',
        content: [
          '---',
          'ruleId: layered-architecture',
          'title: Layered Architecture',
          'severity: error',
          'summary: Enforce layer isolation.',
          'appliesTo:',
          '  - src/api/**/*.ts',
          'enforceable: true',
          '---',
          '# Layered Architecture Rule',
          '',
          'API must not import infra.',
        ].join('\n'),
      },
    ]);

    const engine = new RuleEngine(rootDir);
    const matched = engine.getRulesForFile('src/api/handler.ts');
    expect(matched).toHaveLength(1);
    expect(matched[0]).toContain('[Rule: layered-architecture]');
    expect(matched[0]).toContain('(Severity: error)');
  });

  it('Main Path: matches file against positive glob patterns', () => {
    const rootDir = setupRoot([
      {
        name: 'api-rules.md',
        content: [
          '---',
          'ruleId: api-naming',
          'title: API Naming',
          'severity: warning',
          'summary: API files must follow naming conventions.',
          'appliesTo:',
          '  - src/api/**/*.ts',
          'enforceable: true',
          '---',
          'Use kebab-case for API filenames.',
        ].join('\n'),
      },
    ]);

    const engine = new RuleEngine(rootDir);
    expect(engine.getRulesForFile('src/api/users.ts')).toHaveLength(1);
    expect(engine.getRulesForFile('src/services/auth.ts')).toHaveLength(0);
  });

  it('Boundary: respects negation/ignore glob patterns', () => {
    const rootDir = setupRoot([
      {
        name: 'all-but-tests.md',
        content: [
          '---',
          'ruleId: no-infra-import',
          'title: No Infra Import',
          'severity: error',
          'summary: Do not import infra directly.',
          'appliesTo:',
          '  - src/**/*.ts',
          '  - "!src/**/*.test.ts"',
          'enforceable: true',
          '---',
          'Infra imports forbidden.',
        ].join('\n'),
      },
    ]);

    const engine = new RuleEngine(rootDir);
    expect(engine.getRulesForFile('src/api/handler.ts')).toHaveLength(1);
    expect(engine.getRulesForFile('src/api/handler.test.ts')).toHaveLength(0);
  });

  it('Boundary: skips non-enforceable rules', () => {
    const rootDir = setupRoot([
      {
        name: 'informational.md',
        content: [
          '---',
          'ruleId: info-only',
          'title: Info Only',
          'severity: advisory',
          'summary: Informational rule.',
          'appliesTo:',
          '  - "**/*"',
          'enforceable: false',
          '---',
          'Just for reference.',
        ].join('\n'),
      },
    ]);

    const engine = new RuleEngine(rootDir);
    expect(engine.getRulesForFile('src/anything.ts')).toHaveLength(0);
  });

  it('Boundary: handles missing .spine/rules/ directory gracefully', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-norules-'));
    tempDirs.push(rootDir);
    fs.mkdirSync(path.join(rootDir, '.spine'), { recursive: true });

    const engine = new RuleEngine(rootDir);
    expect(engine.getRulesForFile('src/test.ts')).toHaveLength(0);
  });

  it('Boundary: returns empty array for non-matching file', () => {
    const rootDir = setupRoot([
      {
        name: 'only-config.md',
        content: [
          '---',
          'ruleId: config-check',
          'title: Config Check',
          'severity: warning',
          'summary: Check config files only.',
          'appliesTo:',
          '  - "*.json"',
          'enforceable: true',
          '---',
          'Config files must be valid.',
        ].join('\n'),
      },
    ]);

    const engine = new RuleEngine(rootDir);
    expect(engine.getRulesForFile('src/index.ts')).toHaveLength(0);
  });

  it('Boundary: multiple matching rules all returned', () => {
    const rootDir = setupRoot([
      {
        name: 'rule-a.md',
        content: [
          '---',
          'ruleId: rule-a',
          'title: Rule A',
          'severity: error',
          'summary: First rule.',
          'appliesTo:',
          '  - src/**/*.ts',
          'enforceable: true',
          '---',
          'Rule A body.',
        ].join('\n'),
      },
      {
        name: 'rule-b.md',
        content: [
          '---',
          'ruleId: rule-b',
          'title: Rule B',
          'severity: warning',
          'summary: Second rule.',
          'appliesTo:',
          '  - src/**/*.ts',
          'enforceable: true',
          '---',
          'Rule B body.',
        ].join('\n'),
      },
    ]);

    const engine = new RuleEngine(rootDir);
    const matched = engine.getRulesForFile('src/api/handler.ts');
    expect(matched).toHaveLength(2);
  });

  it('Boundary: includes rule structure with Title and Summary in output', () => {
    const rootDir = setupRoot([
      {
        name: 'test-rule.md',
        content: [
          '---',
          'ruleId: test-rule',
          'title: Test Rule Title',
          'severity: advisory',
          'summary: Test rule summary.',
          'appliesTo:',
          '  - "**/*"',
          'enforceable: true',
          '---',
          'Test body content.',
        ].join('\n'),
      },
    ]);

    const engine = new RuleEngine(rootDir);
    const [block] = engine.getRulesForFile('src/foo.ts');
    expect(block).toContain('Title: Test Rule Title');
    expect(block).toContain('Summary: Test rule summary.');
    expect(block).toContain('Content:\nTest body content.');
  });
});
