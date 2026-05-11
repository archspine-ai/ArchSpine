import * as fs from 'fs';
import * as path from 'path';
import { CURRENT_SCHEMA_VERSION, type SpineUnit } from '../../types/protocol.js';
import type {
  IRiskHotspotViewItem,
  IViewArtifactEnvelope,
  IViewScoreContribution,
} from '../../types/view.js';
import { countCrossBoundaryEdges, isSuppressedPath, sumScores, toConfidence } from './common.js';
import type { LoadedUnit } from './types.js';
import type { ViewArtifact, ViewContext, ViewProducer } from './producer.js';
import { ViewRenderer } from './view-renderer.js';

const MAX_RISK_HOTSPOTS = 12;

interface RiskHotspotCandidate {
  unit: SpineUnit;
  totalScore: number;
  riskFactors: string[];
  confidence: number;
  scoreBreakdown: IViewScoreContribution[];
}

function buildRiskHotspotCandidate(
  unit: SpineUnit,
  lineCount: number,
  fileSet: Set<string>,
  rootDir?: string,
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
  const hasAdjacentTestCoverage = hasAdjacentTests(filePath, fileSet, rootDir);
  const scoreBreakdown: IViewScoreContribution[] = [];

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
  rootDir?: string,
): IViewArtifactEnvelope<IRiskHotspotViewItem> {
  const fileSet = new Set(
    units
      .map(({ unit }) => unit.identity?.filePath)
      .filter((p): p is string => typeof p === 'string'),
  );
  const candidates = units
    .map(({ unit, lineCount }) => buildRiskHotspotCandidate(unit, lineCount, fileSet, rootDir))
    .filter((candidate): candidate is RiskHotspotCandidate => candidate !== null)
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        a.unit.identity.filePath.localeCompare(b.unit.identity.filePath),
    );
  const items = candidates.slice(0, MAX_RISK_HOTSPOTS).map((candidate, index) => ({
    id: `hotspot-${index + 1}`,
    hotspotPath: candidate.unit.identity.filePath,
    riskFactors: candidate.riskFactors,
    summary: buildRiskSummary(candidate.unit, candidate.riskFactors),
    impactRadiusHint: buildImpactRadiusHint(candidate.unit),
    confidence: candidate.confidence,
    totalScore: candidate.totalScore,
    scoreBreakdown: candidate.scoreBreakdown,
  }));

  // Compute quality metadata
  const scores = items.map((i) => i.totalScore);
  const factorDistribution: Record<string, number> = {};
  for (const item of items) {
    for (const factor of item.riskFactors) {
      factorDistribution[factor] = (factorDistribution[factor] || 0) + 1;
    }
  }
  const quality =
    items.length > 0
      ? {
          scoreRange: {
            min: Math.min(...scores),
            median: (() => {
              const sorted = [...scores].sort((a, b) => a - b);
              const mid = Math.floor(sorted.length / 2);
              return sorted.length % 2 !== 0
                ? sorted[mid]
                : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
            })(),
            max: Math.max(...scores),
          },
          diversity: factorDistribution,
          totalCandidatesEvaluated: candidates.length,
          selectionRate: `${((items.length / candidates.length) * 100).toFixed(1)}%`,
        }
      : undefined;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    viewType: 'risk-hotspots',
    summary:
      items.length === 0
        ? 'No high-confidence risk hotspots were selected.'
        : `Top ${items.length} risk hotspots ranked by a transparent additive score model.`,
    items,
    _quality: quality,
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

/**
 * Common test-directory names to scan for mirror-tree test coverage.
 * Ordered by likelihood (unit tests are most common).
 */
const TEST_DIRS = ['unit', 'integration', 'e2e', 'engines', 'infra'];

function hasAdjacentTests(filePath: string, fileSet: Set<string>, rootDir?: string): boolean {
  const parsed = path.parse(filePath);
  const base = path.join(parsed.dir, parsed.name);
  const norm = (p: string) => (p || '').replace(/\\/g, '/');

  // 1. Adjacent and __tests__ sub-directory candidates (O(1) via fileSet).
  const adjacentCandidates = [
    `${base}.test${parsed.ext}`,
    `${base}.spec${parsed.ext}`,
    path.join(parsed.dir, '__tests__', `${parsed.name}.test${parsed.ext}`),
    path.join(parsed.dir, '__tests__', `${parsed.name}.spec${parsed.ext}`),
  ];
  if (adjacentCandidates.some((c) => fileSet.has(norm(c)))) {
    return true;
  }

  // 2. Mirror tree check: tests/{category}/{relPathFromSrc}.{test|spec}.ts
  //    e.g. src/cli/commands/scan.ts → tests/unit/cli/commands/scan.test.ts
  if (!rootDir || !filePath.startsWith('src/')) {
    return false;
  }

  const srcRelPath = filePath.slice(4); // strip "src/"
  const srcRelDir = path.posix.dirname(srcRelPath);
  const fileName = parsed.name;

  for (const testDir of TEST_DIRS) {
    for (const suffix of ['.test', '.spec']) {
      const candidate = path.join(
        rootDir,
        'tests',
        testDir,
        srcRelDir,
        `${fileName}${suffix}${parsed.ext}`,
      );
      try {
        if (fs.existsSync(candidate)) {
          return true;
        }
      } catch {
        // Permission error — skip.
      }
    }
  }

  // 3.   Prefix-match fallback: scan the mirror directory and its parent for files
  //    starting with the source file name (e.g. sync.ts → sync-command.test.ts).
  //    Also checks the parent dir because mirror trees aren't always exact
  //    (e.g. src/cli/commands/sync.ts → tests/integration/cli/sync-command.test.ts).
  const dirsToCheck = [srcRelDir];
  const parentDir = path.posix.dirname(srcRelDir);
  if (parentDir && parentDir !== '.' && parentDir !== srcRelDir) {
    dirsToCheck.push(parentDir);
  }
  for (const testDir of TEST_DIRS) {
    for (const relDir of dirsToCheck) {
      const mirrorDir = path.join(rootDir, 'tests', testDir, relDir);
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(mirrorDir, { withFileTypes: true });
      } catch {
        continue; // Dir missing or unreadable — skip.
      }
      for (const entry of entries) {
        if (!entry.isFile()) {
          continue;
        }
        const entryName = entry.name;
        if (
          entryName.startsWith(`${fileName}-`) &&
          (entryName.endsWith(`.test${parsed.ext}`) || entryName.endsWith(`.spec${parsed.ext}`))
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function buildRiskSummary(unit: SpineUnit, riskFactors: string[]): string {
  const role = (unit.semantic.role || 'shared module').replace(/[.;，。]+$/, '');
  const factors = riskFactors.slice(0, 2).join(', ') || 'shared dependency pressure';
  return `${role}; ranked due to ${factors}.`;
}

function buildImpactRadiusHint(unit: SpineUnit): string {
  const dependedBy = unit.graph?.dependedBy || [];
  const dependedByCount = dependedBy.length;
  const crossBoundaryEdges = countCrossBoundaryEdges(unit);
  const publicSurfaceCount = unit.semantic?.publicSurface?.length || 0;
  const hasViolations = (unit.semantic?.ruleViolations?.length || 0) > 0;

  // Build consumer specificity
  const consumerDetail = buildConsumerDetail(dependedBy);

  // Determine impact level
  let impactLevel: string;
  let guidance: string;

  if (dependedByCount >= 8 || crossBoundaryEdges >= 5) {
    impactLevel = 'Critical';
    guidance =
      'Any change here ripples broadly. Require integration tests and a deprecation plan for public API changes.';
  } else if (dependedByCount >= 5 || crossBoundaryEdges >= 3) {
    impactLevel = 'High';
    guidance =
      'Changes affect multiple downstream modules. Run the full test suite and notify dependent module owners.';
  } else if (dependedByCount >= 3 || crossBoundaryEdges >= 1) {
    impactLevel = 'Medium';
    guidance =
      'Changes may propagate beyond the local directory. Verify adjacent modules after modification.';
  } else {
    impactLevel = 'Low';
    guidance = 'Impact is contained. Standard unit test coverage should suffice.';
  }

  // Build the hint
  const parts: string[] = [];
  parts.push(`${impactLevel} impact`);

  if (dependedByCount > 0) {
    parts.push(
      `${dependedByCount} direct consumer${dependedByCount > 1 ? 's' : ''}${consumerDetail}`,
    );
  } else {
    parts.push('no direct consumers indexed');
  }

  if (crossBoundaryEdges > 0) {
    parts.push(`${crossBoundaryEdges} cross-boundary edge${crossBoundaryEdges > 1 ? 's' : ''}`);
  }

  if (publicSurfaceCount > 0) {
    parts.push(`${publicSurfaceCount} public surface symbol${publicSurfaceCount > 1 ? 's' : ''}`);
  }

  if (hasViolations) {
    parts.push('active rule violations');
  }

  return `${parts.join(', ')}. ${guidance}`;
}

/** Build a short description of who depends on this file. */
function buildConsumerDetail(
  dependedBy: Array<{ sourcePath?: string; consumerPath?: string; targetPath?: string }>,
): string {
  if (dependedBy.length === 0) {
    return '';
  }

  // Extract consumer module names (top-level dir or basename without ext)
  const consumerNames = dependedBy
    .map((edge) => {
      const p = (edge.sourcePath || edge.consumerPath || '').replace(/\\/g, '/');
      const parts = p.split('/');
      // Find the src/ or top-level dir boundary
      const srcIdx = parts.indexOf('src');
      const startIdx = srcIdx >= 0 ? srcIdx + 1 : 0;
      // Get the first meaningful directory name
      return parts[startIdx] || path.basename(p, path.extname(p));
    })
    .filter((name) => name && name.length > 0);

  const unique = [...new Set(consumerNames)].slice(0, 3);
  if (unique.length === 0) {
    return '';
  }

  return ` (${unique.join(', ')}${consumerNames.length > 3 ? ', ...' : ''})`;
}

export const riskHotspotsProducer: ViewProducer = {
  async derive(ctx: ViewContext): Promise<ViewArtifact> {
    const units = ctx.loader.getIndexedUnits();
    const viewData = buildRiskHotspotsView(units, ctx.rootDir);
    const markdown = ViewRenderer.renderRiskHotspots(viewData);

    ctx.outputManager.saveViewMarkdown('risk-hotspots.md', markdown);
    ctx.outputManager.saveView('risk-hotspots.json', viewData);
    ctx.runtimeIO?.info(`[View] Wrote ${viewData.items.length} risk hotspots.`);

    return {
      viewType: 'risk-hotspots',
      generated: true,
      generatedAt: viewData.generatedAt,
      metrics: { itemCount: viewData.items.length },
    };
  },
};
