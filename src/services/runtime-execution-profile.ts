import type { ResolvedLLMSettings } from '../infra/llm.js';
import type { GenerationStrategy } from '../infra/prompt-policy.js';

export interface ResolvedExecutionProfile {
  generationStrategy: GenerationStrategy;
  generationStrategySource: string;
}

export type RuntimeCommand = 'sync' | 'check' | 'fix';

export function resolveExecutionProfileFromSettings(
  resolved: ResolvedLLMSettings,
): ResolvedExecutionProfile {
  const generationStrategy = resolved.generationStrategy.value || 'together';
  const generationStrategySource = resolved.generationStrategy.value
    ? resolved.generationStrategy.source
    : 'default';

  return {
    generationStrategy,
    generationStrategySource,
  };
}
