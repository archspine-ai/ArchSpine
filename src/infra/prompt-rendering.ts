/**
 * Public facade for prompt rendering and prompt-builder composition.
 * Keep prompt assembly concerns separate from prompt policy and budgeting.
 */
export { PromptBuilder } from './prompt/builder.js';
export {
  generateConfigPrompt,
  generateDocumentPrompt,
  generateFolderPrompt,
  generateProjectPrompt,
} from './prompt/aggregate.js';
export { generateMarkdownPrompt } from './prompt/markdown.js';
export { generateSourcePrompt, generateSourceValidationJsonPrompt } from './prompt/source.js';
export type { MarkdownPromptInput, PromptResponseMode } from './prompt/types.js';
