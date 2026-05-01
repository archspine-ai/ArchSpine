import * as fs from 'fs';
import * as path from 'path';
import picomatch from 'picomatch';
import { SpineRuleDocument } from '../types/protocol.js';
import { loadRulesFromDir } from '../infra/rules-loader.js';
import { defaultRuntimeIO } from '../infra/runtime-io.js';

export class RuleEngine {
  private rootDir: string;
  private rules: SpineRuleDocument[] = [];

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.loadRules();
  }

  private loadRules() {
    const rulesDir = path.join(this.rootDir, '.spine', 'rules');
    if (!fs.existsSync(rulesDir)) {
      return;
    }

    for (const loadedRule of loadRulesFromDir(rulesDir)) {
      this.rules.push(loadedRule.rule);
    }
  }

  public getRulesForFile(relativeFilePath: string): string[] {
    const matchedRules: string[] = [];
    for (const rule of this.rules) {
      const positiveGlobs = rule.appliesTo.filter((p: string) => !p.startsWith('!'));
      const ignoreGlobs = rule.appliesTo
        .filter((p: string) => p.startsWith('!'))
        .map((p: string) => p.slice(1));

      const isMatch = picomatch(positiveGlobs, { ignore: ignoreGlobs, dot: true });
      if (isMatch(relativeFilePath)) {
        if (process.env.VERBOSE) {
          defaultRuntimeIO.info(`[RuleEngine] Match: ${rule.ruleId} for ${relativeFilePath}`);
        }
        // Include ruleId and severity in the prompt string (T3.3)
        const ruleBlock = `[Rule: ${rule.ruleId}] (Severity: ${rule.severity})
Title: ${rule.title}
Summary: ${rule.summary}
Content:
${rule.bodyMarkdown}`;
        matchedRules.push(ruleBlock);
      }
    }
    return matchedRules;
  }
}
