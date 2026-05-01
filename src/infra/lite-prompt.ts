/**
 * Lite Mode Prompt Builder - Optimized for low-TPM APIs (e.g., Groq Free Tier).
 * Focuses on structural indexing with minimal context overhead.
 */
export type LitePromptResponseMode = 'json-only' | 'json-and-markdown';

export class LitePromptBuilder {
  private parts: string[] = [];

  public setIdentity(): this {
    this.parts.push(
      `You are a senior developer's assistant. Your goal is to provide a HIGH-LEVEL LITE summary of a source file for the ArchSpine project.\nThis is a low-precision mode intended for structural indexing only.`,
    );
    return this;
  }

  public addInstructions(languages: string[], responseMode: LitePromptResponseMode): this {
    const markdownInstruction =
      responseMode === 'json-and-markdown'
        ? `2. Generate a separate Markdown block for each language: ${languages.join(', ')}. Use ---MARKDOWN:LanguageName---.\n3. This is LITE MODE. Focus ONLY on the primary role and exported symbols. Do NOT guess deep implementation details.`
        : '2. Do not output markdown.\n3. This is LITE MODE. Focus ONLY on the primary role and exported symbols. Do NOT guess deep implementation details.';
    this.parts.push(`CRITICAL INSTRUCTIONS:
1. JSON output MUST be in English.
${markdownInstruction}`);
    return this;
  }

  public addJSONSchema(): this {
    const schema = `{
  "semantic": {
    "role": "One sentence summary.",
    "responsibilities": ["Primary responsibility"],
    "publicSurface": [{ "symbolName": "name", "description": "brief summary" }]
  }
}`;
    this.parts.push(`Output structure for JSON:\n\n---JSON---\n${schema}`);
    return this;
  }

  public addMarkdownInstructions(filePath: string, languages: string[]): this {
    const blocks = languages
      .map((lang) => {
        return `---MARKDOWN:${lang}---\n> [LITE MODE] This documentation was generated in low-precision mode to fit token constraints.\n\n# File: ${filePath}\n\n## Role\n(Summary in ${lang})\n\n## Key Surface\n- **Symbol**: (Description in ${lang})`;
      })
      .join('\n\n');
    this.parts.push(blocks);
    return this;
  }

  public addSourceContext(content: string): this {
    this.parts.push(`FILE HEAD & SYMBOLS:\n\n${content}`);
    return this;
  }

  public build(): string {
    return this.parts.join('\n\n');
  }
}

export function generateLitePrompt(
  filePath: string,
  content: string,
  languages: string[] = ['English'],
  responseMode: LitePromptResponseMode = 'json-and-markdown',
): string {
  const builder = new LitePromptBuilder()
    .setIdentity()
    .addInstructions(languages, responseMode)
    .addJSONSchema()
    .addSourceContext(content);

  if (responseMode === 'json-and-markdown') {
    builder.addMarkdownInstructions(filePath, languages);
  }

  return builder.build();
}
