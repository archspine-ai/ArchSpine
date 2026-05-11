import { PromptBuilder } from './builder.js';
import { LOCALIZED_INSTRUCTIONS, buildMarkdownSectionGuidance } from './shared.js';
import type { MarkdownPromptInput } from './types.js';

function buildMarkdownOnlyPrompt(input: MarkdownPromptInput): string {
  const guidance = buildMarkdownSectionGuidance(input.fileKind);

  return new PromptBuilder()
    .setIdentity('a documentation architect', `${input.fileKind} summary`)
    .addInstructions([
      'Use the semantic JSON as the source of truth.',
      'Return markdown blocks only. Do not return JSON.',
      'Emit a single markdown block using the exact marker: ---MARKDOWN:English---.',
      LOCALIZED_INSTRUCTIONS,
      ...guidance,
    ])
    .addContext('Semantic JSON', JSON.stringify(input.semanticJson, null, 2))
    .addContext('Supporting Context', input.supportingContext || '')
    .build();
}

export function generateMarkdownPrompt(input: MarkdownPromptInput): string {
  return buildMarkdownOnlyPrompt(input);
}
