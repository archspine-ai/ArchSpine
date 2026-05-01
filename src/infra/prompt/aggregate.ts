import {
  configSchema,
  documentSchema,
  folderSchema,
  projectSchema,
} from '../../assets/templates/prompts/index.js';
import { PromptBuilder } from './builder.js';
import { buildLocalizedLanguageInstructions, renderOutputContract } from './shared.js';
import type { PromptResponseMode } from './types.js';

export function generateDocumentPrompt(
  filePath: string,
  content: string,
  languages: string[] = ['English'],
  branch: string = '',
  status: string = '',
  responseMode: PromptResponseMode = 'json-only',
): string {
  void filePath;

  return new PromptBuilder()
    .setIdentity('a documentation architect', 'project document (Markdown/narrative)')
    .addInstructions([
      'The JSON output MUST ALWAYS be in English for base fields.',
      ...buildLocalizedLanguageInstructions(languages),
      "Focus on the 'Why' and the 'Whom' - why this document exists and who is the intended audience.",
      'Summarize the core narrative concepts and maintenance boundaries.',
      renderOutputContract(responseMode, languages),
    ])
    .addEnvironmentalContext(branch, status)
    .addJSONSchema(documentSchema)
    .addSourceContent('Document Content', content)
    .build();
}

export function generateConfigPrompt(
  filePath: string,
  content: string,
  languages: string[] = ['English'],
  branch: string = '',
  status: string = '',
  responseMode: PromptResponseMode = 'json-only',
): string {
  void filePath;

  return new PromptBuilder()
    .setIdentity('a systems configuration expert', 'configuration file (JSON/YAML)')
    .addInstructions([
      'The JSON output MUST ALWAYS be in English for base fields.',
      ...buildLocalizedLanguageInstructions(languages),
      'Analyze the configuration parameters for their operational impact and safety implications.',
      'Summarize how this file affects the broader system stability.',
      renderOutputContract(responseMode, languages),
    ])
    .addEnvironmentalContext(branch, status)
    .addJSONSchema(configSchema)
    .addSourceContent('Configuration Snippet', content)
    .build();
}

export function generateFolderPrompt(
  dirPath: string,
  childrenInfo: string,
  languages: string[] = ['English'],
  branch: string = '',
  status: string = '',
  responseMode: PromptResponseMode = 'json-only',
): string {
  void dirPath;

  return new PromptBuilder()
    .setIdentity("a senior developer's assistant", 'directory (L2 aggregation)')
    .addInstructions([
      'The JSON output MUST ALWAYS be in English for base fields.',
      ...buildLocalizedLanguageInstructions(languages),
      renderOutputContract(responseMode, languages),
    ])
    .addEnvironmentalContext(branch, status)
    .addJSONSchema(folderSchema)
    .addSourceContent('Child Files Info', childrenInfo)
    .build();
}

export function generateProjectPrompt(
  projectName: string,
  modulesInfo: string,
  languages: string[] = ['English'],
  branch: string = '',
  status: string = '',
  responseMode: PromptResponseMode = 'json-only',
): string {
  void projectName;

  return new PromptBuilder()
    .setIdentity("a senior developer's assistant", 'entire project (L3 aggregation)')
    .addInstructions([
      'The JSON output MUST ALWAYS be in English for base fields.',
      ...buildLocalizedLanguageInstructions(languages),
      renderOutputContract(responseMode, languages),
    ])
    .addEnvironmentalContext(branch, status)
    .addJSONSchema(projectSchema)
    .addSourceContent('Modules Info', modulesInfo)
    .build();
}
