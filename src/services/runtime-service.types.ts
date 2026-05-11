/**
 * Future runtime capabilities should terminate here rather than expanding
 * provider-resolution code in infra/llm/runtime.ts.
 */
export interface RuntimeServiceDraft {
  getResolvedLLMSettings(): unknown;
  getSyncService(): unknown;
  getCheckService(): unknown;
  getFixService(): unknown;
}
