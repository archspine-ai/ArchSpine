import type { PromptPolicyTier, PromptTaskMode, ValidatePolicy } from './types.js';

export function defaultPromptTierForTask(taskMode: PromptTaskMode): PromptPolicyTier {
  return taskMode === 'validate' ? 'balanced' : 'balanced';
}

export function defaultValidatePolicyForTask(taskMode: PromptTaskMode): ValidatePolicy {
  return taskMode === 'validate' ? 'strict' : 'default';
}

export function resolvePromptPolicyTier(
  taskMode: PromptTaskMode,
  promptTier?: PromptPolicyTier,
): PromptPolicyTier {
  if (promptTier) {
    return promptTier;
  }
  return defaultPromptTierForTask(taskMode);
}

export function resolveValidatePolicy(
  taskMode: PromptTaskMode,
  validatePolicy?: ValidatePolicy,
): ValidatePolicy {
  if (validatePolicy) {
    return validatePolicy;
  }
  return defaultValidatePolicyForTask(taskMode);
}
