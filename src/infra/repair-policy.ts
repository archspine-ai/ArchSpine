import type { ProtectedOutputMutationReport } from './spine-gate.js';

const INDEX_PREFIX = '.spine/index/';
const ATLAS_PREFIX = '.spine/atlas/';

export type RepairPolicyAction = 'targeted-repair' | 'prompt-full-rebuild' | 'require-full-rebuild';

export interface RepairPolicyDecision {
  action: RepairPolicyAction;
  reason: string;
  violationCount: number;
  targetedSourceFiles: string[];
  unmappedPaths: string[];
  aggregateLevelPaths: string[];
  safeNonInteractiveDowngrade: {
    action: 'targeted-repair';
    targetedSourceFiles: string[];
    reason: string;
  } | null;
}

export function evaluateRepairPolicy(report: ProtectedOutputMutationReport): RepairPolicyDecision {
  const allPaths = [
    ...report.changedPaths.map((path) => ({ path, changeKind: 'changed' as const })),
    ...report.addedPaths.map((path) => ({ path, changeKind: 'added' as const })),
    ...report.removedPaths.map((path) => ({ path, changeKind: 'removed' as const })),
  ];
  const targetedSourceFiles = new Set<string>();
  const unmappedPaths: string[] = [];
  const aggregateLevelPaths: string[] = [];
  const aggregateDescriptors: Array<{
    path: string;
    scope: string;
    level: 'project' | 'folder';
    changeKind: 'changed' | 'added' | 'removed';
  }> = [];

  for (const violation of allPaths) {
    const classification = classifyViolationPath(violation.path);
    if (classification.kind === 'file') {
      targetedSourceFiles.add(classification.sourcePath);
      continue;
    }
    if (classification.kind === 'aggregate') {
      aggregateLevelPaths.push(violation.path);
      aggregateDescriptors.push({
        path: violation.path,
        scope: classification.scope,
        level: classification.level,
        changeKind: violation.changeKind,
      });
      continue;
    }
    unmappedPaths.push(violation.path);
  }

  const violationCount = allPaths.length;
  if (violationCount === 0) {
    return {
      action: 'targeted-repair',
      reason: 'No protected output violations detected.',
      violationCount,
      targetedSourceFiles: [],
      unmappedPaths: [],
      aggregateLevelPaths: [],
      safeNonInteractiveDowngrade: null,
    };
  }

  if (unmappedPaths.length > 0) {
    return {
      action: 'require-full-rebuild',
      reason: 'Violation set contains unmapped or structurally suspicious generated paths.',
      violationCount,
      targetedSourceFiles: sortPaths(targetedSourceFiles),
      unmappedPaths: unmappedPaths.sort(),
      aggregateLevelPaths: aggregateLevelPaths.sort(),
      safeNonInteractiveDowngrade: null,
    };
  }

  if (aggregateLevelPaths.length > 0) {
    const targetedFiles = sortPaths(targetedSourceFiles);
    const coveredAggregatePaths = aggregateDescriptors.filter((descriptor) =>
      isAggregatePathCoveredByTargetedFiles(descriptor.scope, targetedFiles),
    );
    const unsafeAggregatePaths = aggregateDescriptors.filter(
      (descriptor) => !isAggregatePathCoveredByTargetedFiles(descriptor.scope, targetedFiles),
    );
    const aggregateScopes = new Set(
      aggregateDescriptors.map((descriptor) => `${descriptor.level}:${descriptor.scope}`),
    );
    const hasAggregateRemoval = aggregateDescriptors.some(
      (descriptor) => descriptor.changeKind === 'removed',
    );

    if (unsafeAggregatePaths.length > 0 && (aggregateScopes.size > 1 || hasAggregateRemoval)) {
      return {
        action: 'require-full-rebuild',
        reason:
          'Aggregate-level violations indicate structural damage beyond safe targeted repair coverage.',
        violationCount,
        targetedSourceFiles: targetedFiles,
        unmappedPaths: [],
        aggregateLevelPaths: aggregateLevelPaths.sort(),
        safeNonInteractiveDowngrade: null,
      };
    }

    if (
      coveredAggregatePaths.length === aggregateDescriptors.length &&
      targetedFiles.length > 0 &&
      targetedFiles.length <= 5
    ) {
      return {
        action: 'prompt-full-rebuild',
        reason: 'Aggregate-level violations are fully covered by mapped file-level source repairs.',
        violationCount,
        targetedSourceFiles: targetedFiles,
        unmappedPaths: [],
        aggregateLevelPaths: aggregateLevelPaths.sort(),
        safeNonInteractiveDowngrade: {
          action: 'targeted-repair',
          targetedSourceFiles: targetedFiles,
          reason:
            'Aggregate-level violations are covered by the same source files and can be repaired safely without prompting in non-interactive mode.',
        },
      };
    }

    return {
      action: 'prompt-full-rebuild',
      reason: 'Aggregate-level generated artifacts were modified out of bounds.',
      violationCount,
      targetedSourceFiles: targetedFiles,
      unmappedPaths: [],
      aggregateLevelPaths: aggregateLevelPaths.sort(),
      safeNonInteractiveDowngrade: null,
    };
  }

  if (violationCount <= 5) {
    return {
      action: 'targeted-repair',
      reason: 'Violation set is small and maps cleanly to concrete source files.',
      violationCount,
      targetedSourceFiles: sortPaths(targetedSourceFiles),
      unmappedPaths: [],
      aggregateLevelPaths: [],
      safeNonInteractiveDowngrade: null,
    };
  }

  return {
    action: 'prompt-full-rebuild',
    reason: 'Violation count exceeds the targeted-repair threshold.',
    violationCount,
    targetedSourceFiles: sortPaths(targetedSourceFiles),
    unmappedPaths: [],
    aggregateLevelPaths: [],
    safeNonInteractiveDowngrade: null,
  };
}

function classifyViolationPath(
  violationPath: string,
):
  | { kind: 'file'; sourcePath: string }
  | { kind: 'aggregate'; scope: string; level: 'project' | 'folder' }
  | { kind: 'unmapped' } {
  if (violationPath.startsWith(INDEX_PREFIX)) {
    return classifyIndexPath(violationPath.slice(INDEX_PREFIX.length));
  }

  if (violationPath.startsWith(ATLAS_PREFIX)) {
    const atlasRest = violationPath.slice(ATLAS_PREFIX.length);
    const firstSlash = atlasRest.indexOf('/');
    if (firstSlash <= 0 || firstSlash === atlasRest.length - 1) {
      return { kind: 'unmapped' };
    }
    return classifyAtlasRelativePath(atlasRest.slice(firstSlash + 1));
  }

  return { kind: 'unmapped' };
}

function classifyIndexPath(
  relativePath: string,
):
  | { kind: 'file'; sourcePath: string }
  | { kind: 'aggregate'; scope: string; level: 'project' | 'folder' }
  | { kind: 'unmapped' } {
  if (!relativePath.endsWith('.json')) {
    return { kind: 'unmapped' };
  }

  const sourceLikePath = relativePath.slice(0, -'.json'.length);
  return classifySourceLikePath(sourceLikePath);
}

function classifyAtlasRelativePath(
  relativePath: string,
):
  | { kind: 'file'; sourcePath: string }
  | { kind: 'aggregate'; scope: string; level: 'project' | 'folder' }
  | { kind: 'unmapped' } {
  if (!relativePath.endsWith('.md')) {
    return { kind: 'unmapped' };
  }

  const sourceLikePath = relativePath.slice(0, -'.md'.length);
  return classifySourceLikePath(sourceLikePath);
}

function classifySourceLikePath(
  sourceLikePath: string,
):
  | { kind: 'file'; sourcePath: string }
  | { kind: 'aggregate'; scope: string; level: 'project' | 'folder' }
  | { kind: 'unmapped' } {
  if (!sourceLikePath || sourceLikePath === 'project') {
    return { kind: 'aggregate', scope: '', level: 'project' };
  }

  const baseName = sourceLikePath.split('/').pop();
  if (baseName === 'folder') {
    return {
      kind: 'aggregate',
      scope: sourceLikePath.slice(0, -'/folder'.length),
      level: 'folder',
    };
  }

  if (sourceLikePath.endsWith('/')) {
    return { kind: 'unmapped' };
  }

  return { kind: 'file', sourcePath: sourceLikePath };
}

function isAggregatePathCoveredByTargetedFiles(
  scope: string,
  targetedSourceFiles: string[],
): boolean {
  if (targetedSourceFiles.length === 0) {
    return false;
  }

  if (!scope) {
    return targetedSourceFiles.length > 0;
  }

  return targetedSourceFiles.some((sourcePath) => sourcePath.startsWith(`${scope}/`));
}

function sortPaths(values: Iterable<string>): string[] {
  return [...values].sort();
}
