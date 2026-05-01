/**
 * Public facade for prompt-context policy and diagnostics.
 * Keep callers importing from this file; treat `src/infra/prompt-context/*`
 * as internal implementation detail so budgeting and diagnostic internals can
 * change without widespread import churn.
 */
export {
  LLM_MODES,
  PROMPT_POLICY_TIERS,
  STRICT_VALIDATE_BUDGET_PROFILES,
  VALIDATE_POLICIES,
  PROMPT_BUDGET_PROFILES,
} from './prompt-policy.js';
export { buildSourcePromptArtifacts } from './prompt-context/artifacts.js';
export { calculateSourcePromptBudgets } from './prompt-context/budgets.js';
export {
  parseLLMMode,
  parsePromptPolicyTier,
  parseRelevanceDiagnosticsMode,
  parseValidatePolicy,
} from './prompt-policy.js';
export {
  defaultPromptTierForTask,
  defaultValidatePolicyForTask,
  resolvePromptPolicyTier,
  resolveValidatePolicy,
} from './prompt-policy.js';
export type {
  GenerationFlow,
  GenerationStrategy,
  LLMMode,
  PromptBudgetProfile,
  PromptBudgets,
  PromptContextDiagnostics,
  PromptDependencySelectionDiagnostics,
  PromptPolicyTier,
  PromptProfile,
  PromptRelevanceDiagnostics,
  PromptRuleBlockDiagnostics,
  PromptTaskMode,
  RelevanceDiagnosticsMode,
  RelevanceDiagnosticsSnapshot,
  SourceFileDiagnosticsSnapshot,
  SourcePromptArtifacts,
  SourcePromptArtifactsInput,
  ValidatePolicy,
  ValidationProfile,
} from './prompt-policy.js';
