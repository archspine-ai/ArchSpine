import { FileKind } from '../../../types/protocol.js';
import type { UsageInfo } from '../base.js';

export function buildSupportingContext(
  fileKind: FileKind,
  content: string,
  contextData?: string,
): string {
  if (fileKind === 'source') {
    return [content, contextData].filter(Boolean).join('\n\n');
  }
  return content;
}

export function parseMarkdownBlocks(
  fullResponse: string,
  languages: string[],
): Record<string, string> {
  const markdown: Record<string, string> = {};
  const taggedBlockPattern = /---MARKDOWN:([^\n]+)---\s*([\s\S]*?)(?=\n---MARKDOWN:[^\n]+---|$)/g;

  for (const match of fullResponse.matchAll(taggedBlockPattern)) {
    const locale = match[1]?.trim();
    const content = match[2]?.trim();
    if (locale && content) {
      markdown[locale] = content;
    }
  }

  if (Object.keys(markdown).length > 0) {
    return markdown;
  }

  const fallbackBlock = fullResponse.match(/---MARKDOWN---\s*([\s\S]*?)$/);
  if (fallbackBlock?.[1]) {
    const content = fallbackBlock[1].trim();
    for (const locale of languages) {
      markdown[locale] = content;
    }
  }

  return markdown;
}

export function parseStructuredResponse(
  fullResponse: string,
  languages: string[],
  logContext: string,
): { json: unknown; markdown: Record<string, string> } {
  const jsonPart =
    fullResponse.match(/---JSON---([\s\S]*?)(---MARKDOWN(?::|---)|$)/)?.[1]?.trim() ||
    fullResponse.match(/---JSON---([\s\S]*)/)?.[1]?.trim() ||
    fullResponse;

  let json: unknown = {};
  try {
    json = JSON.parse(jsonPart.replace(/```json/g, '').replace(/```/g, ''));
  } catch (error) {
    // eslint-disable-next-line no-console -- Warn on LLM response parse failure
    console.warn(`Failed to parse JSON from LLM for ${logContext}:`, error);
  }

  return {
    json,
    markdown: parseMarkdownBlocks(fullResponse, languages),
  };
}

export function mergeUsage(...usages: Array<UsageInfo | undefined>): UsageInfo | undefined {
  const defined = usages.filter((usage): usage is UsageInfo => Boolean(usage));
  if (defined.length === 0) {
    return undefined;
  }

  return defined.reduce(
    (acc, usage) => ({
      inputTokens: acc.inputTokens + usage.inputTokens,
      outputTokens: acc.outputTokens + usage.outputTokens,
      totalTokens: acc.totalTokens + usage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );
}
