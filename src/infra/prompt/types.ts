import type { FileKind } from '../../types/protocol.js';

export type PromptResponseMode = 'json-only' | 'json-and-markdown';

export interface MarkdownPromptInput {
  identifier: string;
  fileKind: FileKind | 'project';
  semanticJson: unknown;
  languages: string[];
  supportingContext?: string;
}
