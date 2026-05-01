import type { ResolvedLLMSettings } from '../infra/llm.js';
import type {
  GenerationFlow,
  GenerationStrategy,
  LLMMode,
  PromptPolicyTier,
  PromptProfile,
  ValidatePolicy,
  ValidationProfile,
} from '../infra/prompt-policy.js';

export interface ResolvedExecutionProfile {
  mode: LLMMode;
  modeSource: string;
  promptTier: PromptPolicyTier;
  promptTierSource: string;
  promptProfile: PromptProfile;
  promptProfileSource: string;
  validatePolicy: ValidatePolicy;
  validatePolicySource: string;
  validationProfile: ValidationProfile;
  validationProfileSource: string;
  generationFlow: GenerationFlow;
  generationFlowSource: string;
  generationStrategy: GenerationStrategy;
  generationStrategySource: string;
}

export type RuntimeCommand = 'sync' | 'check' | 'fix';

function getCommandDefaultMode(command: RuntimeCommand): LLMMode {
  return command === 'sync' ? 'standard' : 'heavy';
}

export function resolveExecutionProfileFromSettings(
  resolved: ResolvedLLMSettings,
  command: RuntimeCommand,
): ResolvedExecutionProfile {
  const mode = resolved.mode.value || getCommandDefaultMode(command);
  const modeSource = resolved.mode.value ? resolved.mode.source : 'command-default';
  const promptTier = resolved.promptTier.value || 'balanced';
  const promptTierSource = resolved.promptTier.value
    ? resolved.promptTier.source
    : 'command-default';
  const validatePolicy = resolved.validatePolicy.value || (mode === 'heavy' ? 'strict' : 'default');
  const validatePolicySource = resolved.validatePolicy.value
    ? resolved.validatePolicy.source
    : modeSource;
  const generationFlow =
    resolved.generationFlow.value || (mode === 'heavy' ? 'semantic-first' : 'together');
  const generationFlowSource = resolved.generationFlow.value
    ? resolved.generationFlow.source
    : modeSource;
  const generationStrategy = resolved.generationStrategy.value || generationFlow;
  const generationStrategySource = resolved.generationStrategy.value
    ? resolved.generationStrategy.source
    : generationFlowSource;

  return {
    mode,
    modeSource,
    promptTier,
    promptTierSource,
    promptProfile: promptTier,
    promptProfileSource: promptTierSource,
    validatePolicy,
    validatePolicySource,
    validationProfile: validatePolicy,
    validationProfileSource: validatePolicySource,
    generationFlow,
    generationFlowSource,
    generationStrategy,
    generationStrategySource,
  };
}
