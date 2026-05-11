/**
 * Public facade for LLM runtime contracts and configuration resolution.
 * Higher layers should import from this file instead of reaching into
 * `src/infra/llm/**` directly.
 */
export { GlobalLLMConfig, GlobalLLMSecrets, getGlobalArchSpineDir } from './llm/global.js';
export {
  assertResolvedLLMUsable,
  createResolvedLLMClient,
  providerRequiresApiKey,
  resolveLLMSettings,
} from './llm/runtime.js';
export type { LLMRuntimeOverrides, ResolvedLLMSettings, ResolvedLLMValue } from './llm/runtime.js';
export type {
  LLMClient,
  LLMResponse,
  PreviousSemanticContext,
  ProviderConfig,
  UsageInfo,
} from './llm/base.js';
