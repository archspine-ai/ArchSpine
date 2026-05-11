import type { FileKind } from '../../types/protocol.js';
import type { PromptResponseMode } from './types.js';

export function renderOutputContract(responseMode: PromptResponseMode): string {
  const jsonContract = [
    'OUTPUT CONTRACT:',
    '1. Start with a line that is exactly ---JSON---',
    '2. Follow it with one valid JSON object that matches the schema exactly.',
  ];

  if (responseMode === 'json-only') {
    jsonContract.push('3. Do not output markdown or explanatory prose after the JSON block.');
    return jsonContract.join('\n');
  }

  return [
    ...jsonContract,
    '3. After the JSON block, emit a markdown block that starts with ---MARKDOWN:English---',
    '4. The markdown block must be written in English and be natural, readable documentation.',
  ].join('\n');
}

export const LOCALIZED_INSTRUCTIONS =
  'Provide localized descriptions inside the JSON \'localized\' block in English. Write natural prose in English for the key "English".';

export function buildMarkdownSectionGuidance(fileKind: FileKind | 'project'): string[] {
  switch (fileKind) {
    case 'document':
      return [
        'Explain why the document exists, who should read it, and which decisions or workflows it anchors.',
        'Use concrete headings and preserve narrative readability.',
      ];
    case 'config':
      return [
        'Explain what the configuration controls, which parameters matter, and what operational risks or stability concerns readers should notice.',
        'Make the markdown useful to operators, not just schema readers.',
      ];
    case 'folder':
      return [
        'Describe what this directory represents, how its notable children are grouped, and which implementation areas matter most.',
        'Call out concrete submodules instead of staying at a generic summary level.',
      ];
    case 'other':
    case 'project':
      return [
        'Explain the major modules and how they work together in practice.',
        'Prefer concrete subsystem descriptions over abstract vision statements.',
      ];
    case 'source':
    default:
      return [
        'Explain the file role, key responsibilities, notable invariants or negative scope, and the most important exported or externally visible behavior.',
        'Keep the markdown readable for humans who are trying to understand implementation intent quickly.',
      ];
  }
}
