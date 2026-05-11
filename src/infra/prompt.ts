/**
 * Public facade for prompt generation.
 * Keep external callers importing from this file; treat `src/infra/prompt/*`
 * as internal implementation detail so prompt logic can keep evolving without
 * broad import churn across the repo.
 */
export { PromptBuilder } from './prompt-rendering.js';
export {
  generateConfigPrompt,
  generateDocumentPrompt,
  generateFolderPrompt,
  generateProjectPrompt,
  generateMarkdownPrompt,
  generateSourcePrompt,
} from './prompt-rendering.js';
export type { MarkdownPromptInput, PromptResponseMode } from './prompt-rendering.js';
