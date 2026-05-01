import prompts from 'prompts';
import { Config } from '../../infra/config.js';
import { Manifest } from '../../infra/manifest.js';
import {
  getDocumentLanguageChoices,
  HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE,
} from '../document-languages.js';
import { printLanguageDiscovery } from '../cli-utils.js';

export interface ExecuteLanguagesCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
}

export async function promptForDocumentationLanguages(
  currentLanguages: string[] = [],
): Promise<string[] | undefined> {
  const response = await prompts({
    type: 'multiselect',
    name: 'languages',
    message: 'Which languages would you like to generate documentation in?',
    choices: getDocumentLanguageChoices(currentLanguages),
    min: 1,
    hint: '- Space to select. Return to submit',
    onRender(this: any, color: any) {
      if (this.__archspineSeparatorPatched) {
        return;
      }
      this.__archspineSeparatorPatched = true;
      const originalRenderOption = this.renderOption.bind(this);
      this.renderOption = (cursor: number, choice: any, index: number, arrowIndicator: string) => {
        if (choice.value === HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE) {
          return `   ${color.gray(choice.title)}`;
        }
        return originalRenderOption(cursor, choice, index, arrowIndicator);
      };
    },
  });

  return response.languages as string[] | undefined;
}

export async function executeLanguagesCommand(
  options: ExecuteLanguagesCommandOptions,
): Promise<void> {
  const { args, rootDir, config } = options;
  if (!args[0] || args[0] === 'show') {
    console.log(`Configured documentation languages: ${config.getLanguages().join(', ')}`);
    const langManifest = Manifest.open(rootDir);
    const snapshot = langManifest.loadLanguageSnapshot();
    if (!snapshot) {
      console.log('No language snapshot found. Run "spine init" or "spine sync" to generate one.');
    } else {
      printLanguageDiscovery(snapshot);
    }
  } else if (args[0] === 'set') {
    const selectedLanguages = await promptForDocumentationLanguages(config.getLanguages());
    if (!selectedLanguages) {
      console.log('Language update cancelled.');
      return;
    }
    config.saveLanguages(selectedLanguages);
    console.log(`Updated documentation languages: ${selectedLanguages.join(', ')}`);
  } else {
    console.log('Usage: spine languages [show|set]');
  }
}
