import * as fs from 'node:fs';
import * as path from 'node:path';

const RULE_TEMPLATES: Record<string, { filename: string; content: string }> = {
  'no-core-to-cli': {
    filename: 'no-core-to-cli.yml',
    content: `# No-core-to-cli dependency rule
# Prevents CLI modules from importing core domain modules
ruleId: no-core-to-cli-dependency
severity: error
title: Core modules must not be depended on by CLI layer
summary: Modules in the cli/ layer should not directly import or depend on modules in the core/ layer. Communication should go through the services layer.
rationale: CLI is the outermost layer. Core is the innermost. Direct dependency from CLI to Core bypasses the services layer, creating tight coupling and making core changes risky.
appliesTo:
  - "src/cli/**"
checks:
  - kind: dependency
    allowList:
      - "src/services/**"
      - "src/infra/**"
      - "src/types/**"
      - "src/utils/**"
`,
  },
  'no-cross-layer': {
    filename: 'no-cross-layer.yml',
    content: `# Cross-layer dependency rule
# Enforces strict layer isolation: cli → services → infra → engines
ruleId: strict-layer-isolation
severity: error
title: Strict layer isolation — dependencies must flow one direction
summary: Code in outer layers (cli) may depend on inner layers (infra, engines) but NOT the reverse. Each layer can only depend on layers at the same level or deeper.
rationale: Prevents architectural erosion by enforcing unidirectional dependency flow. Breaking this rule creates circular reasoning and makes the system harder to reason about.
appliesTo:
  - "src/**"
checks:
  - kind: layer
    order:
      - "cli"
      - "services"
      - "infra"
      - "engines"
      - "core"
    exclude:
      - "src/types/**"
      - "src/utils/**"
`,
  },
  'no-circular-deps': {
    filename: 'no-circular-deps.yml',
    content: `# Circular dependency detection rule
# Flags A → B → C → A patterns
ruleId: no-circular-dependencies
severity: error
title: No circular dependencies between modules
summary: Modules should not form circular dependency chains (A → B → C → A). Circular dependencies make the codebase tightly coupled and prevent independent testing, building, and reasoning about individual modules.
rationale: Circular dependencies are a primary source of architectural debt. They force developers to understand the entire cycle before modifying any single module, and prevent independent testing.
appliesTo:
  - "src/**"
checks:
  - kind: dependency
    noCircular: true
`,
  },
  'public-surface-stable': {
    filename: 'public-surface-stable.yml',
    content: `# Public surface stability rule
# Detects when exported symbols change in public API modules
ruleId: public-surface-stability
severity: warning
title: Public API surface should maintain backward compatibility
summary: Modules classified as public surface should not remove or rename exported symbols without explicit review. Adding new exports is fine, but removing or changing existing ones may break consumers.
rationale: Public API changes ripple to all consumers. Stability of the public surface is critical for team productivity and system reliability.
appliesTo:
  - "src/**"
checks:
  - kind: publicSurface
    requireStability: true
    forbidRemovals: true
`,
  },
  'test-must-exist': {
    filename: 'test-must-exist.yml',
    content: `# Adjacent test requirement rule
# Ensures every module has at least one test file
ruleId: test-coverage-adjacent
severity: warning
title: Every module should have adjacent tests
summary: Each module in src/ should have a corresponding test file in tests/ with the same relative path. Modules without tests are harder to refactor safely.
rationale: Test coverage is the first line of defense against regression. Missing tests indicate higher risk for changes.
appliesTo:
  - "src/**"
checks:
  - kind: testAdjacent
    testDir: "tests"
    exclude:
      - "src/types/**"
      - "src/utils/**"
`,
  },
};

export interface RuleTemplateEntry {
  name: string;
  title: string;
}

export function listRuleTemplates(): RuleTemplateEntry[] {
  return Object.entries(RULE_TEMPLATES).map(([name, template]) => {
    const title = template.content.split('\n')[2].replace(/^# /, '');
    return { name, title };
  });
}

export function addRuleTemplate(
  rootDir: string,
  templateName: string,
): { success: true; outputPath: string } | { success: false; message: string } {
  const template = RULE_TEMPLATES[templateName];
  if (!template) {
    return { success: false, message: `Unknown template "${templateName}".` };
  }

  const rulesDir = path.join(rootDir, '.spine', 'rules');
  if (!fs.existsSync(rulesDir)) {
    return {
      success: false,
      message: '.spine/rules/ directory not found. Run "spine init" first.',
    };
  }

  const outputPath = path.join(rulesDir, template.filename);
  if (fs.existsSync(outputPath)) {
    return {
      success: false,
      message: `⚠️  Rule file "${template.filename}" already exists. Use "spine rules remove" first, or edit manually.`,
    };
  }

  fs.writeFileSync(outputPath, template.content, 'utf-8');
  return { success: true, outputPath: template.filename };
}

export function getRuleTemplateInfo(templateName: string): {
  severity?: string;
  title?: string;
} {
  const template = RULE_TEMPLATES[templateName];
  if (!template) {
    return {};
  }
  return {
    title: template.content.split('\n')[3].replace(/^# /, ''),
    severity: template.content.match(/severity: (\w+)/)?.[1],
  };
}
