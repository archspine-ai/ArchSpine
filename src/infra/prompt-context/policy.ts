import type { PromptTaskMode, ValidatePolicy } from './types.js';

export function defaultValidatePolicyForTask(taskMode: PromptTaskMode): ValidatePolicy {
  return taskMode === 'validate' ? 'strict' : 'default';
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
