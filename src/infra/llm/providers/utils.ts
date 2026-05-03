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
    if (languages.length === 1) {
      // If only one language is requested, it's safe to assume this block is for it.
      markdown[languages[0]] = content;
    } else {
      // If multiple languages are requested, an untagged block is ambiguous.
      // We only assign it to the FIRST language. The parity check in the task
      // will then fail because the second language will be missing.
      markdown[languages[0]] = content;
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
    fullResponse.match(/---JSON---([\s\S]*?)(?=---MARKDOWN(?::|---)|$)/)?.[1]?.trim() ||
    fullResponse;

  let json: unknown = {};
  try {
    let cleanJson = jsonPart
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    if (cleanJson.startsWith('[')) {
      const lastBracket = cleanJson.lastIndexOf(']');
      if (lastBracket > 0) {
        cleanJson = cleanJson.substring(0, lastBracket + 1);
      }
    } else {
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }
    }
    if (cleanJson) {
      json = JSON.parse(cleanJson);
    }
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
