import * as path from 'path';
import { CURRENT_SCHEMA_VERSION, type SpineUnit } from '../../types/protocol.js';
import type {
  RiskHotspotViewItem,
  ViewArtifactEnvelope,
  ViewScoreContribution,
} from '../../types/view.js';
import { countCrossBoundaryEdges, isSuppressedPath, sumScores, toConfidence } from './common.js';
import type { LoadedUnit } from './types.js';

const MAX_RISK_HOTSPOTS = 12;

interface RiskHotspotCandidate {
  unit: SpineUnit;
  totalScore: number;
  riskFactors: string[];
  confidence: number;
  scoreBreakdown: ViewScoreContribution[];
}

function buildRiskHotspotCandidate(
  unit: SpineUnit,
  lineCount: number,
  fileSet: Set<string>,
): RiskHotspotCandidate | null {
  const filePath = unit.identity?.filePath;
  if (!filePath || isSuppressedPath(filePath)) {
    return null;
  }

  const dependedByCount = unit.graph?.dependedBy?.length || 0;
  const dependsOnCount = unit.graph?.dependsOn?.length || 0;
  const publicSurfaceCount = unit.semantic?.publicSurface?.length || 0;
  const exportCount = unit.skeleton?.exports?.length || 0;
  const crossBoundaryEdges = countCrossBoundaryEdges(unit);
  const violationWeight = scoreRuleViolations(unit);
  const hasAdjacentTestCoverage = hasAdjacentTests(filePath, fileSet);
  const scoreBreakdown: ViewScoreContribution[] = [];

  if (dependedByCount > 0) {
    scoreBreakdown.push({
      factor: 'fan-in',
      score: Math.min(30, dependedByCount * 4),
      reason: `File is depended on by ${dependedByCount} indexed file(s).`,
    });
  }

  if (dependsOnCount > 0) {
    scoreBreakdown.push({
      factor: 'fan-out',
      score: Math.min(18, dependsOnCount * 2),
      reason: `File depends on ${dependsOnCount} indexed file(s).`,
    });
  }

  if (crossBoundaryEdges > 0) {
    scoreBreakdown.push({
      factor: 'cross-boundary-density',
      score: Math.min(18, crossBoundaryEdges * 4),
      reason: `File crosses ${crossBoundaryEdges} directory-boundary edge(s).`,
    });
  }

  if (publicSurfaceCount > 0 || exportCount > 0) {
    scoreBreakdown.push({
      factor: 'surface-exposure',
      score: Math.min(12, publicSurfaceCount * 4 + Math.min(4, exportCount)),
      reason: `File exposes ${publicSurfaceCount} public-surface item(s) and ${exportCount} export(s).`,
    });
  }

  if (unit.semantic.driftDetected) {
    scoreBreakdown.push({
      factor: 'semantic-change',
      score: 16,
      reason: unit.semantic.driftReason || 'Semantic change was detected for this file.',
    });
  }

  if (violationWeight > 0) {
    scoreBreakdown.push({
      factor: 'rule-violations',
      score: violationWeight,
      reason: `File carries ${unit.semantic?.ruleViolations?.length || 0} active rule violation(s).`,
    });
  }

  if (lineCount >= 250) {
    scoreBreakdown.push({
      factor: 'large-file',
      score: lineCount >= 500 ? 12 : 8,
      reason: `File has ${lineCount} line(s), increasing change surface area.`,
    });
  }

  if (!hasAdjacentTestCoverage && (dependedByCount >= 2 || publicSurfaceCount > 0)) {
    scoreBreakdown.push({
      factor: 'missing-adjacent-tests',
      score: 6,
      reason: 'No adjacent test file was detected near a shared or exposed module.',
    });
  }

  const totalScore = sumScores(scoreBreakdown);
  if (totalScore < 20) {
    return null;
  }

  const riskFactors = scoreBreakdown
    .filter((factor) => factor.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((factor) => factor.factor);

  return {
    unit,
    totalScore,
    riskFactors,
    confidence: toConfidence(totalScore, riskFactors.length),
    scoreBreakdown,
  };
}

export function buildRiskHotspotsView(
  units: LoadedUnit[],
): ViewArtifactEnvelope<RiskHotspotViewItem> {
  const fileSet = new Set(
    units
      .map(({ unit }) => unit.identity?.filePath)
      .filter((p): p is string => typeof p === 'string'),
  );
  const items = units
    .map(({ unit, lineCount }) => buildRiskHotspotCandidate(unit, lineCount, fileSet))
    .filter((candidate): candidate is RiskHotspotCandidate => candidate !== null)
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        a.unit.identity.filePath.localeCompare(b.unit.identity.filePath),
    )
    .slice(0, MAX_RISK_HOTSPOTS)
    .map((candidate, index) => ({
      id: `hotspot-${index + 1}`,
      hotspotPath: candidate.unit.identity.filePath,
      riskFactors: candidate.riskFactors,
      summary: buildRiskSummary(candidate.unit, candidate.riskFactors),
      impactRadiusHint: buildImpactRadiusHint(candidate.unit),
      confidence: candidate.confidence,
      totalScore: candidate.totalScore,
      scoreBreakdown: candidate.scoreBreakdown,
    }));

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    experimental: true,
    viewType: 'risk-hotspots',
    summary:
      items.length === 0
        ? 'No high-confidence risk hotspots were selected.'
        : `Top ${items.length} risk hotspots ranked by a transparent additive score model.`,
    items,
  };
}

function scoreRuleViolations(unit: SpineUnit): number {
  const violations = unit.semantic?.ruleViolations || [];
  return Math.min(
    18,
    violations.reduce((sum, violation) => {
      if (violation.severity === 'error') {
        return sum + 8;
      }
      if (violation.severity === 'warning') {
        return sum + 5;
      }
      return sum + 3;
    }, 0),
  );
}

function hasAdjacentTests(filePath: string, fileSet: Set<string>): boolean {
  const parsed = path.parse(filePath);
  const base = path.join(parsed.dir, parsed.name);
  const candidates = [
    `${base}.test${parsed.ext}`,
    `${base}.spec${parsed.ext}`,
    path.join(parsed.dir, '__tests__', `${parsed.name}.test${parsed.ext}`),
    path.join(parsed.dir, '__tests__', `${parsed.name}.spec${parsed.ext}`),
  ];
  return candidates.some((candidate) => fileSet.has((candidate || '').replace(/\\/g, '/')));
}

function buildRiskSummary(unit: SpineUnit, riskFactors: string[]): string {
  const role = (unit.semantic.role || 'shared module').replace(/[.;，。]+$/, '');
  const factors = riskFactors.slice(0, 2).join(', ') || 'shared dependency pressure';
  return `${role}; ranked due to ${factors}.`;
}

function buildImpactRadiusHint(unit: SpineUnit): string {
  const dependedByCount = unit.graph?.dependedBy?.length || 0;
  const crossBoundaryEdges = countCrossBoundaryEdges(unit);
  if (dependedByCount >= 6 || crossBoundaryEdges >= 4) {
    return 'Likely broad impact across multiple modules.';
  }
  if (dependedByCount >= 3 || crossBoundaryEdges >= 2) {
    return 'Likely medium impact beyond the local directory.';
  }
  return 'Likely localized impact with a few downstream touch points.';
}
