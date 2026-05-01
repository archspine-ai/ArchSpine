import { describe, it, expect } from 'vitest';
import * as LLMFacade from '../src/infra/llm.js';

describe('LLM Facade', () => {
  it('Main Path: structurally exports required members', () => {
    // Check main dependencies exposed by the facade
    expect(LLMFacade.GlobalLLMConfig).toBeDefined();
    expect(LLMFacade.GlobalLLMSecrets).toBeDefined();
    expect(LLMFacade.getGlobalArchSpineDir).toBeDefined();
    expect(LLMFacade.createResolvedLLMClient).toBeDefined();
    expect(LLMFacade.resolveLLMSettings).toBeDefined();
  });

  it('Boundary/Exception: does not leak undefined members', () => {
    const keys = Object.keys(LLMFacade);
    keys.forEach((key) => {
      // It's possible for types to not exist at runtime, but we're scanning the esmodule runtime exports.
      const val = (LLMFacade as Record<string, unknown>)[key];
      expect(val).not.toBeUndefined();
    });
  });
});
