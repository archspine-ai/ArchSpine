/**
 * Public facade for prompt-context policy and diagnostics.
 * Keep callers importing from this file; treat `src/infra/prompt-context/*`
 * as internal implementation detail so budgeting and diagnostic internals can
 * change without widespread import churn.
 */
export {
  STRICT_VALIDATE_BUDGET_PROFILES,
  VALIDATE_POLICIES,
  PROMPT_BUDGET_PROFILES,
} from './prompt-policy.js';
export { buildSourcePromptArtifacts } from './prompt-context/artifacts.js';
export { calculateSourcePromptBudgets } from './prompt-context/budgets.js';
export { parseRelevanceDiagnosticsMode, parseValidatePolicy } from './prompt-policy.js';
export { defaultValidatePolicyForTask, resolveValidatePolicy } from './prompt-policy.js';
export type {
  GenerationStrategy,
  PromptBudgetProfile,
  PromptBudgets,
  PromptContextDiagnostics,
  PromptDependencySelectionDiagnostics,
  PromptRelevanceDiagnostics,
  PromptRuleBlockDiagnostics,
  PromptTaskMode,
  RelevanceDiagnosticsMode,
  RelevanceDiagnosticsSnapshot,
  SourceFileDiagnosticsSnapshot,
  SourcePromptArtifacts,
  SourcePromptArtifactsInput,
  ValidatePolicy,
} from './prompt-policy.js';
