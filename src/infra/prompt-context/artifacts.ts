import { buildDependencySelectionDiagnostics, buildRuleBlockDiagnostics } from './diagnostics.js';
import { calculateSourcePromptBudgets } from './budgets.js';
import { resolveValidatePolicy } from './policy.js';
import {
  compactSkeletonForPrompt,
  trimPreviousSemantic,
  trimRuleBlocks,
  trimSectionedContext,
} from './trim.js';
import type { SourcePromptArtifacts, SourcePromptArtifactsInput } from './types.js';

export function buildSourcePromptArtifacts(
  input: SourcePromptArtifactsInput,
): SourcePromptArtifacts {
  const validatePolicy = resolveValidatePolicy(input.taskMode, input.validatePolicy);
  const budgets = calculateSourcePromptBudgets(input);
  const compactSkeleton = compactSkeletonForPrompt(input.skeleton, budgets);
  const fileHeader = input.content.split('\n').slice(0, budgets.headerLines).join('\n');
  const contextData = trimSectionedContext(
    input.dependencyContext || '',
    budgets.dependencyContextChars,
  );
  const ruleData = trimRuleBlocks(input.ruleData || '', budgets.ruleChars);
  const previousSemantic = trimPreviousSemantic(
    input.previousSemantic,
    budgets.maxResponsibilities,
  );
  const fileInput = JSON.stringify({ fileHeader, structuralSkeleton: compactSkeleton }, null, 2);
  const dependencySelectionDiagnostics = buildDependencySelectionDiagnostics(
    input.dependencyDiagnostics,
    contextData,
  );
  const ruleBlockDiagnostics = buildRuleBlockDiagnostics(input.ruleData || '', ruleData);

  return {
    fileInput,
    contextData,
    ruleData,
    previousSemantic,
    diagnostics: {
      taskMode: input.taskMode,

      validatePolicy,
      budgets,
      relevance: {
        retainedDependencyCandidates: dependencySelectionDiagnostics.retainedDependencyCandidates,
        truncatedDependencyCandidates: dependencySelectionDiagnostics.truncatedDependencyCandidates,
        retainedRuleBlocks: ruleBlockDiagnostics.retainedRuleBlocks,
        droppedRuleBlocks: ruleBlockDiagnostics.droppedRuleBlocks,
      },
      raw: {
        contentLines: input.content.split('\n').length,
        importCount: input.skeleton.imports.length,
        exportCount: input.skeleton.exports.length,
        usageCount: (input.skeleton.usages || []).length,
        dependencyContextChars: (input.dependencyContext || '').length,
        ruleChars: (input.ruleData || '').length,
        previousResponsibilities: input.previousSemantic?.responsibilities.length || 0,
      },
      final: {
        fileInputChars: fileInput.length,
        dependencyContextChars: contextData.length,
        ruleChars: ruleData.length,
        previousResponsibilities: previousSemantic?.responsibilities.length || 0,
      },
    },
  };
}
