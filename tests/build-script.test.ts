import { describe, expect, it } from 'vitest';
import { shouldExcludeDistEntry } from '../scripts/build.mjs';

describe('build script packaging filters', () => {
  it('excludes __mocks__ content from dist packaging', () => {
    expect(shouldExcludeDistEntry('src/infra/__mocks__/llm.ts')).toBe(true);
    expect(shouldExcludeDistEntry('dist/infra/__mocks__/llm.js')).toBe(true);
    expect(shouldExcludeDistEntry('src/infra/llm/runtime.ts')).toBe(false);
  });
});
