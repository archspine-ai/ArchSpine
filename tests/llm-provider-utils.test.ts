import { describe, expect, it, vi } from 'vitest';
import {
  buildSupportingContext,
  mergeUsage,
  parseMarkdownBlocks,
  parseStructuredResponse,
} from '../src/infra/llm/providers/utils.js';

describe('LLM provider utils', () => {
  it('parses locale-tagged markdown blocks', () => {
    const markdown = parseMarkdownBlocks(
      ['---MARKDOWN:English---', '# English', '---MARKDOWN:zh-CN---', '# 中文'].join('\n'),
      ['English', 'zh-CN'],
    );

    expect(markdown).toEqual({
      English: '# English',
      'zh-CN': '# 中文',
    });
  });

  it('falls back to a shared markdown block for all requested languages', () => {
    const markdown = parseMarkdownBlocks(
      ['---JSON---', '{"role":"demo"}', '---MARKDOWN---', '# Shared'].join('\n'),
      ['English', 'ja-JP'],
    );

    expect(markdown).toEqual({
      English: '# Shared',
      'ja-JP': '# Shared',
    });
  });

  it('extracts fenced JSON and markdown from structured responses', () => {
    const parsed = parseStructuredResponse(
      [
        '---JSON---',
        '```json',
        '{"role":"demo","responsibilities":["one"]}',
        '```',
        '---MARKDOWN:English---',
        '# Demo',
      ].join('\n'),
      ['English'],
      'demo.ts',
    );

    expect(parsed.json).toEqual({
      role: 'demo',
      responsibilities: ['one'],
    });
    expect(parsed.markdown).toEqual({ English: '# Demo' });
  });

  it('returns empty JSON object and logs when JSON parsing fails', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const parsed = parseStructuredResponse(
      '---JSON---\nnot-json\n---MARKDOWN---\n# Broken',
      ['English'],
      'broken.ts',
    );

    expect(parsed.json).toEqual({});
    expect(parsed.markdown).toEqual({ English: '# Broken' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to parse JSON from LLM for broken.ts:'),
      expect.anything(),
    );
  });

  it('merges token usage and builds source supporting context', () => {
    expect(buildSupportingContext('source', 'code', 'context')).toBe('code\n\ncontext');
    expect(buildSupportingContext('document', 'docs', 'ignored')).toBe('docs');
    expect(
      mergeUsage({ inputTokens: 1, outputTokens: 2, totalTokens: 3 }, undefined, {
        inputTokens: 4,
        outputTokens: 5,
        totalTokens: 9,
      }),
    ).toEqual({ inputTokens: 5, outputTokens: 7, totalTokens: 12 });
  });
});
