import type { ContextResolutionDiagnostics } from '../../engines/context.js';
import type { PromptRelevanceDiagnostics } from './types.js';
import { splitRuleBlocks } from './trim.js';

function extractRuleId(ruleBlock: string): string | undefined {
  const firstLine = ruleBlock.split('\n')[0]?.trim() || '';
  const match = firstLine.match(/^\[Rule:\s*([^\]]+)\]/);
  return match?.[1];
}

export function buildRuleBlockDiagnostics(
  rawRuleData: string,
  finalRuleData: string,
): Pick<PromptRelevanceDiagnostics, 'retainedRuleBlocks' | 'droppedRuleBlocks'> {
  const retainedRuleBlocks = splitRuleBlocks(finalRuleData).map((block) => ({
    ruleId: extractRuleId(block),
    header: block.split('\n')[0]?.trim() || 'Unknown rule block',
    chars: block.length,
  }));
  const retainedHeaders = new Set(retainedRuleBlocks.map((block) => block.header));
  const droppedRuleBlocks = splitRuleBlocks(rawRuleData)
    .filter((block) => !retainedHeaders.has(block.split('\n')[0]?.trim() || ''))
    .map((block) => ({
      ruleId: extractRuleId(block),
      header: block.split('\n')[0]?.trim() || 'Unknown rule block',
      chars: block.length,
    }));

  return { retainedRuleBlocks, droppedRuleBlocks };
}

export function buildDependencySelectionDiagnostics(
  dependencyDiagnostics: ContextResolutionDiagnostics | undefined,
  finalContextData: string,
): Pick<
  PromptRelevanceDiagnostics,
  'retainedDependencyCandidates' | 'truncatedDependencyCandidates'
> {
  if (!dependencyDiagnostics) {
    return {
      retainedDependencyCandidates: [],
      truncatedDependencyCandidates: [],
    };
  }

  const includedPaths = new Set(
    dependencyDiagnostics.retainedDependencyCandidates
      .filter((candidate) => finalContextData.includes(`\`${candidate.path}\``))
      .map((candidate) => candidate.path),
  );

  const retainedDependencyCandidates = dependencyDiagnostics.retainedDependencyCandidates
    .filter((candidate) => includedPaths.has(candidate.path))
    .map((candidate) => ({ ...candidate }));

  const truncatedDependencyCandidates = [
    ...dependencyDiagnostics.retainedDependencyCandidates
      .filter((candidate) => !includedPaths.has(candidate.path))
      .map((candidate) => ({
        ...candidate,
        truncationReason: 'dependency-context-trimmed' as const,
      })),
    ...dependencyDiagnostics.truncatedDependencyCandidates.map((candidate) => ({
      ...candidate,
      truncationReason: 'not-ranked-in-top-dependencies' as const,
    })),
  ];

  return {
    retainedDependencyCandidates,
    truncatedDependencyCandidates,
  };
}
