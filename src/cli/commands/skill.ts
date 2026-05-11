import { throwCliUsage } from '../cli-utils.js';
import { installSkill, uninstallSkill } from '../../services/skill-service.js';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

export interface ExecuteSkillCommandOptions {
  args: string[];
}

export async function executeSkillCommand({ args }: ExecuteSkillCommandOptions): Promise<void> {
  const subcommand = args[0];

  if (subcommand === 'install') {
    const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const result = installSkill(rootDir);
    if (!result.success) {
      console.error(`❌ ${result.message}`);
      process.exit(1);
    }

    console.log('ArchSpine agent skill installed successfully.');
    console.log('');
    console.log(`  Skill file: ${result.skillFile}`);
    console.log(`  State file: ${result.stateFile}`);
    console.log('');
    console.log('Claude Code will now load the ArchSpine skill when entering repositories.');
    console.log(
      'The skill provides architectural awareness by consulting the .spine/ control plane.',
    );
    console.log('');
    console.log('To uninstall, run: spine skill uninstall');
    return;
  }

  if (subcommand === 'uninstall') {
    const result = uninstallSkill();
    if (result.removed) {
      console.log(`Removed: skill files`);
      console.log('');
      console.log('ArchSpine agent skill uninstalled successfully.');
      console.log('');
      console.log(`  ${result.message}`);
    } else {
      console.log('ArchSpine agent skill was not installed. Nothing to uninstall.');
    }
    return;
  }

  throwCliUsage('Usage: spine skill <install|uninstall>');
}
