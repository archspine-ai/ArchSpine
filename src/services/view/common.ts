import * as path from 'path';
import type { SpineUnit } from '../../types/protocol.js';
import type { ViewScoreContribution } from '../../types/view.js';

export function isSuppressedPath(filePath: string): boolean {
  return /(^|\/)(tests?|__tests__|fixtures?|examples?|docs|dist|build)\//.test(filePath);
}

export function sumScores(scoreBreakdown: ViewScoreContribution[]): number {
  return scoreBreakdown.reduce((sum, factor) => sum + factor.score, 0);
}

export function toConfidence(totalScore: number, supportCount: number): number {
  const normalized = Math.max(0, Math.min(0.99, 0.35 + totalScore / 200 + supportCount * 0.02));
  return Number(normalized.toFixed(2));
}

export function topLevelBoundary(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const [segment] = normalized.split('/');
  return segment || '';
}

function isExternalPackage(targetPath: string): boolean {
  return !targetPath.includes('/') && !targetPath.startsWith('.');
}

function resolveTargetBoundary(targetPath: string, sourceDir: string): string {
  const normalized = targetPath.replace(/\\/g, '/');

  if (isExternalPackage(normalized)) {
    return '';
  }

  if (normalized.startsWith('.')) {
    const resolved = path.posix.resolve(sourceDir, normalized);
    return topLevelBoundary(resolved);
  }

  return topLevelBoundary(normalized);
}

export function countCrossBoundaryEdges(unit: SpineUnit): number {
  const sourcePath = unit.identity?.filePath || '';
  const sourceBoundary = topLevelBoundary(sourcePath);
  const sourceDir = path.posix.dirname(sourcePath) || '.';
  const dependsOn = unit.graph?.dependsOn || [];
  const dependedBy = unit.graph?.dependedBy || [];

  let count = 0;

  for (const edge of dependsOn) {
    const targetBoundary = resolveTargetBoundary(edge.targetPath, sourceDir);
    if (targetBoundary && targetBoundary !== sourceBoundary) {
      count++;
    }
  }

  for (const edge of dependedBy) {
    const targetBoundary = topLevelBoundary(edge.targetPath);
    if (targetBoundary && targetBoundary !== sourceBoundary) {
      count++;
    }
  }

  return count;
}
