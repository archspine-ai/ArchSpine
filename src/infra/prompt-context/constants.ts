import type { PromptBudgetProfile, PromptTaskMode, ValidatePolicy } from './types.js';

export const VALIDATE_POLICIES: ValidatePolicy[] = ['default', 'strict'];

export const PROMPT_BUDGET_PROFILES: Record<PromptTaskMode, PromptBudgetProfile> = {
  summarize: {
    header: { baseLines: 12, minLines: 12, maxLines: 24, divisor: 20, lineWindow: 160 },
    skeleton: {
      baseImports: 10,
      minImports: 8,
      maxImports: 18,
      importDivisor: 3,
      baseExports: 16,
      minExports: 12,
      maxExports: 28,
      exportDivisor: 2,
      baseUsages: 16,
      minUsages: 12,
      maxUsages: 24,
      usageDivisor: 2,
      maxImplementationClueLines: 3,
    },
    dependency: { growthDivisor: 10 },
    rule: { growthDivisor: 10, preferredRatio: 0.42 },
    history: { maxResponsibilities: 4 },
    context: { baseTotalChars: 5600, minTotalChars: 4200, maxTotalChars: 6800 },
  },
  validate: {
    header: { baseLines: 8, minLines: 8, maxLines: 16, divisor: 30, lineWindow: 120 },
    skeleton: {
      baseImports: 12,
      minImports: 12,
      maxImports: 22,
      importDivisor: 2,
      baseExports: 18,
      minExports: 18,
      maxExports: 30,
      exportDivisor: 2,
      baseUsages: 18,
      minUsages: 18,
      maxUsages: 28,
      usageDivisor: 2,
      maxImplementationClueLines: 2,
    },
    dependency: { growthDivisor: 14 },
    rule: { growthDivisor: 10, preferredRatio: 0.58 },
    history: { maxResponsibilities: 4 },
    context: { baseTotalChars: 6400, minTotalChars: 5200, maxTotalChars: 8000 },
  },
};

export const STRICT_VALIDATE_BUDGET_PROFILES: PromptBudgetProfile = {
  header: { baseLines: 9, minLines: 8, maxLines: 18, divisor: 28, lineWindow: 140 },
  skeleton: {
    baseImports: 14,
    minImports: 12,
    maxImports: 24,
    importDivisor: 2,
    baseExports: 20,
    minExports: 18,
    maxExports: 32,
    exportDivisor: 2,
    baseUsages: 20,
    minUsages: 18,
    maxUsages: 32,
    usageDivisor: 2,
    maxImplementationClueLines: 2,
  },
  dependency: { growthDivisor: 18 },
  rule: { growthDivisor: 8, preferredRatio: 0.72 },
  history: { maxResponsibilities: 6 },
  context: { baseTotalChars: 7800, minTotalChars: 6200, maxTotalChars: 9200 },
};
