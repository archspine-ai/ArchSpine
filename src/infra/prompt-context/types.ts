import type { FileSkeleton } from '../../ast/extractor.js';
import type {
  ContextResolutionDiagnostics,
  DependencyCandidateDiagnostics,
} from '../../engines/context.js';
import type { PreviousSemanticContext } from '../llm/base.js';

export type PromptTaskMode = 'summarize' | 'validate';
export type PromptPolicyTier = 'lite' | 'balanced';
export type ValidatePolicy = 'default' | 'strict';
export type LLMMode = 'standard' | 'heavy';
export type GenerationFlow = 'together' | 'semantic-first';
export type PromptProfile = PromptPolicyTier;
export type ValidationProfile = ValidatePolicy;
export type GenerationStrategy = GenerationFlow | 'json-only';
export type RelevanceDiagnosticsMode = 'off' | 'debug' | 'diagnostic';

export interface PromptBudgetProfile {
  header: {
    baseLines: number;
    minLines: number;
    maxLines: number;
    divisor: number;
    lineWindow: number;
  };
  skeleton: {
    baseImports: number;
    minImports: number;
    maxImports: number;
    importDivisor: number;
    baseExports: number;
    minExports: number;
    maxExports: number;
    exportDivisor: number;
    baseUsages: number;
    minUsages: number;
    maxUsages: number;
    usageDivisor: number;
    maxImplementationClueLines: number;
  };
  dependency: {
    growthDivisor: number;
  };
  rule: {
    growthDivisor: number;
    preferredRatio: number;
  };
  history: {
    maxResponsibilities: number;
  };
  context: {
    baseTotalChars: number;
    minTotalChars: number;
    maxTotalChars: number;
  };
}

export interface PromptBudgets {
  headerLines: number;
  maxImports: number;
  maxExports: number;
  maxUsages: number;
  maxImplementationClueLines: number;
  totalContextChars: number;
  dependencyContextChars: number;
  ruleChars: number;
  maxResponsibilities: number;
}

export interface SourcePromptArtifactsInput {
  content: string;
  skeleton: FileSkeleton;
  dependencyContext?: string;
  dependencyDiagnostics?: ContextResolutionDiagnostics;
  ruleData?: string;
  previousSemantic?: PreviousSemanticContext;
  taskMode: PromptTaskMode;
  promptTier?: PromptPolicyTier;
  validatePolicy?: ValidatePolicy;
}

export interface SourcePromptArtifacts {
  fileInput: string;
  contextData: string;
  ruleData: string;
  previousSemantic?: PreviousSemanticContext;
  diagnostics: PromptContextDiagnostics;
}

export interface PromptContextDiagnostics {
  taskMode: PromptTaskMode;
  promptTier: PromptPolicyTier;
  validatePolicy: ValidatePolicy;
  budgets: PromptBudgets;
  relevance: PromptRelevanceDiagnostics;
  raw: {
    contentLines: number;
    importCount: number;
    exportCount: number;
    usageCount: number;
    dependencyContextChars: number;
    ruleChars: number;
    previousResponsibilities: number;
  };
  final: {
    fileInputChars: number;
    dependencyContextChars: number;
    ruleChars: number;
    previousResponsibilities: number;
  };
}

export interface PromptDependencySelectionDiagnostics extends DependencyCandidateDiagnostics {
  truncationReason?: 'not-ranked-in-top-dependencies' | 'dependency-context-trimmed';
}

export interface PromptRuleBlockDiagnostics {
  ruleId?: string;
  header: string;
  chars: number;
}

export interface PromptRelevanceDiagnostics {
  retainedDependencyCandidates: PromptDependencySelectionDiagnostics[];
  truncatedDependencyCandidates: PromptDependencySelectionDiagnostics[];
  retainedRuleBlocks: PromptRuleBlockDiagnostics[];
  droppedRuleBlocks: PromptRuleBlockDiagnostics[];
}

export interface SourceFileDiagnosticsSnapshot {
  filePath: string;
  prompt: PromptContextDiagnostics;
  context: ContextResolutionDiagnostics;
}

export interface RelevanceDiagnosticsSnapshot {
  taskMode: PromptTaskMode;
  promptTier: PromptPolicyTier;
  validatePolicy: ValidatePolicy;
  generatedAt: string;
  files: SourceFileDiagnosticsSnapshot[];
}
