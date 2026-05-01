import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadRulesFromDir } from '../src/infra/rules-loader.js';

describe('rules loader', () => {
  it('loads YAML template rules into normalized rule documents', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-rules-'));
    const filePath = path.join(dir, 'rules.yml');
    fs.writeFileSync(
      filePath,
      `- [Rule: Domain Isolation]
  - Scope: src/domain/**
  - Constraint: Domain modules must not import from 'src/infra/**'.
  - Severity: Error
  - Reason: Keep the domain layer pure.
`,
    );

    const rules = loadRulesFromDir(dir);
    expect(rules).toHaveLength(1);
    expect(rules[0].rule.ruleId).toBe('domain-isolation');
    expect(rules[0].rule.appliesTo).toEqual(['src/domain/**']);
    expect(rules[0].rule.severity).toBe('error');
    expect(rules[0].rule.summary).toContain('Domain modules must not import');
  });

  it('loads the repository layered-architecture rules for the current cli/services/core/tasks/engines layout', () => {
    const rulesDir = path.join(process.cwd(), '.spine', 'rules');
    const rules = loadRulesFromDir(rulesDir).map((entry) => entry.rule);
    const ruleIds = rules.map((rule) => rule.ruleId);
    const appliesTo = rules.flatMap((rule) => rule.appliesTo);

    expect(ruleIds).toContain('cli-entrypoint-separation');
    expect(ruleIds).toContain('service-runtime-boundary');
    expect(ruleIds).toContain('core-pipeline-isolation');
    expect(ruleIds).toContain('task-stage-boundary');
    expect(ruleIds).toContain('engine-independence');
    expect(ruleIds).toContain('infra-facade-imports');
    expect(appliesTo).toContain('src/cli/**');
    expect(appliesTo).toContain('src/services/**');
    expect(appliesTo).toContain('src/core/**');
    expect(appliesTo).toContain('src/tasks/**');
    expect(appliesTo).toContain('src/engines/**');
    expect(appliesTo).not.toContain('src/domain/**');
    expect(appliesTo).not.toContain('src/api/**');
  });
});
