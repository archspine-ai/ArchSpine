import { PromptBuilder } from './builder.js';
import { buildLocalizedLanguageInstructions, buildMarkdownSectionGuidance } from './shared.js';
import type { MarkdownPromptInput } from './types.js';

function buildMarkdownOnlyPrompt(input: MarkdownPromptInput): string {
  const guidance = buildMarkdownSectionGuidance(input.fileKind);

  return new PromptBuilder()
    .setIdentity('a documentation architect', `${input.fileKind} summary`)
    .addInstructions([
      'Use the semantic JSON as the source of truth.',
      'Return markdown blocks only. Do not return JSON.',
      `Emit one block per language using the exact markers: ${input.languages.map((language) => `---MARKDOWN:${language}---`).join(', ')}.`,
      ...buildLocalizedLanguageInstructions(input.languages),
      ...guidance,
    ])
    .addContext('Semantic JSON', JSON.stringify(input.semanticJson, null, 2))
    .addContext('Supporting Context', input.supportingContext || '')
    .build();
}

export function generateMarkdownPrompt(input: MarkdownPromptInput): string {
  return buildMarkdownOnlyPrompt(input);
}
