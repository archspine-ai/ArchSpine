import { throwCliUsage } from '../cli-utils.js';
import {
  listRuleTemplates,
  addRuleTemplate,
  getRuleTemplateInfo,
} from '../../services/rule-service.js';

export interface ExecuteRulesCommandOptions {
  args: string[];
  rootDir?: string;
}

export async function executeRulesCommand(options: ExecuteRulesCommandOptions): Promise<void> {
  const { args, rootDir } = options;
  const subcommand = args[0];

  if (!subcommand || subcommand === 'help') {
    console.log('Usage: spine rules add <template-name>');
    console.log('');
    console.log('Available templates:');
    for (const { name, title } of listRuleTemplates()) {
      console.log(`  ${name} — ${title}`);
    }
    console.log('');
    console.log('Examples:');
    console.log('  spine rules add no-core-to-cli');
    console.log('  spine rules add no-cross-layer');
    console.log('  spine rules add no-circular-deps');
    return;
  }

  if (subcommand === 'add') {
    const templateName = args[1];
    if (!templateName) {
      console.log('❌ No template name provided. Available templates:');
      for (const { name, title } of listRuleTemplates()) {
        console.log(`  ${name} — ${title}`);
      }
      return;
    }

    const result = addRuleTemplate(rootDir!, templateName);
    if (!result.success) {
      console.log(`❌ ${result.message}`);
      return;
    }

    const info = getRuleTemplateInfo(templateName);
    console.log(`✅ Added rule template "${templateName}" → .spine/rules/${result.outputPath}`);
    console.log('');
    if (info.title) {
      console.log(`Rule: ${info.title}`);
    }
    if (info.severity) {
      console.log(`Severity: ${info.severity}`);
    }
    console.log('');
    console.log('Run "spine check" to verify the rule.');
    return;
  }

  throwCliUsage('Usage: spine rules add <template-name>');
}
