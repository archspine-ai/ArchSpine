import { PROMPT_BUDGET_PROFILES, STRICT_VALIDATE_BUDGET_PROFILES } from './constants.js';
import { resolveValidatePolicy } from './policy.js';
import type { PromptBudgets, SourcePromptArtifactsInput } from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateSourcePromptBudgets(input: SourcePromptArtifactsInput): PromptBudgets {
  const validatePolicy = resolveValidatePolicy(input.taskMode, input.validatePolicy);
  const profile =
    input.taskMode === 'validate' && validatePolicy === 'strict'
      ? STRICT_VALIDATE_BUDGET_PROFILES
      : PROMPT_BUDGET_PROFILES[input.taskMode];
  const lineCount = input.content.split('\n').length;
  const importCount = input.skeleton.imports.length;
  const exportCount = input.skeleton.exports.length;
  const usageCount = (input.skeleton.usages || []).length;
  const dependencyChars = (input.dependencyContext || '').length;
  const ruleChars = (input.ruleData || '').length;

  const headerLines = clamp(
    profile.header.baseLines +
      Math.floor(Math.min(lineCount, profile.header.lineWindow) / profile.header.divisor),
    profile.header.minLines,
    profile.header.maxLines,
  );

  const maxImports = clamp(
    profile.skeleton.baseImports + Math.floor(importCount / profile.skeleton.importDivisor),
    profile.skeleton.minImports,
    profile.skeleton.maxImports,
  );

  const maxExports = clamp(
    profile.skeleton.baseExports + Math.floor(exportCount / profile.skeleton.exportDivisor),
    profile.skeleton.minExports,
    profile.skeleton.maxExports,
  );

  const maxUsages = clamp(
    profile.skeleton.baseUsages + Math.floor(usageCount / profile.skeleton.usageDivisor),
    profile.skeleton.minUsages,
    profile.skeleton.maxUsages,
  );

  const growthSignal =
    input.taskMode === 'validate'
      ? Math.floor(ruleChars / profile.rule.growthDivisor)
      : Math.floor(dependencyChars / profile.dependency.growthDivisor);

  const totalContextChars = clamp(
    profile.context.baseTotalChars + growthSignal,
    profile.context.minTotalChars,
    profile.context.maxTotalChars,
  );

  const hasRules = ruleChars > 0;
  const hasDependencyContext = dependencyChars > 0;
  const preferredRuleRatio = profile.rule.preferredRatio;

  let allocatedRuleChars = hasRules ? Math.floor(totalContextChars * preferredRuleRatio) : 0;
  let allocatedDependencyChars = hasDependencyContext ? totalContextChars - allocatedRuleChars : 0;

  if (!hasRules) {
    allocatedDependencyChars = hasDependencyContext ? totalContextChars : 0;
  } else if (!hasDependencyContext) {
    allocatedRuleChars = totalContextChars;
  } else {
    allocatedRuleChars = Math.min(allocatedRuleChars, ruleChars);
    allocatedDependencyChars = Math.min(allocatedDependencyChars, dependencyChars);
    const remaining = totalContextChars - allocatedRuleChars - allocatedDependencyChars;
    if (remaining > 0) {
      const dependencySlack = Math.max(0, dependencyChars - allocatedDependencyChars);
      const dependencyTopUp = Math.min(remaining, dependencySlack);
      allocatedDependencyChars += dependencyTopUp;
      allocatedRuleChars += Math.min(
        remaining - dependencyTopUp,
        Math.max(0, ruleChars - allocatedRuleChars),
      );
    }
  }

  return {
    headerLines,
    maxImports,
    maxExports,
    maxUsages,
    maxImplementationClueLines: profile.skeleton.maxImplementationClueLines,
    totalContextChars,
    dependencyContextChars: allocatedDependencyChars,
    ruleChars: allocatedRuleChars,
    maxResponsibilities: profile.history.maxResponsibilities,
  };
}
