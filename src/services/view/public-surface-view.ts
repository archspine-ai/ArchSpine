import * as path from 'path';
import { CURRENT_SCHEMA_VERSION, type SpineUnit } from '../../types/protocol.js';
import type {
  PublicSurfaceKind,
  IPublicSurfaceViewItem,
  IViewArtifactEnvelope,
  IViewScoreContribution,
} from '../../types/view.js';
import { isSuppressedPath, sumScores, toConfidence } from './common.js';
import type { LoadedUnit } from './types.js';
import type { ViewArtifact, ViewContext, ViewProducer } from './producer.js';
import { ViewRenderer } from './view-renderer.js';

interface ScoredCandidate<TKind extends string> {
  filePath: string;
  kind: TKind;
  totalScore: number;
  confidence: number;
  scoreBreakdown: IViewScoreContribution[];
}

const MAX_PUBLIC_SURFACE_ITEMS = 24;

function buildPublicSurfaceCandidate(
  unit: SpineUnit,
  reexportCounts: Map<string, number>,
): ScoredCandidate<PublicSurfaceKind> | null {
  const filePath = unit.identity?.filePath;
  if (!filePath) {
    return null;
  }

  const kind = classifyPublicSurfaceKind(unit);
  if (!kind || isSuppressedPath(filePath)) {
    return null;
  }

  const scoreBreakdown: IViewScoreContribution[] = [];
  const publicSurfaceCount = unit.semantic?.publicSurface?.length || 0;
  const exportCount = unit.skeleton?.exports?.length || 0;
  const dependedByCount = unit.graph?.dependedBy?.length || 0;
  const reexportCount = reexportCounts.get(filePath) || 0;

  if (publicSurfaceCount > 0) {
    scoreBreakdown.push({
      factor: 'semantic-public-surface',
      score: Math.min(36, 12 + publicSurfaceCount * 6),
      reason: `File declares ${publicSurfaceCount} semantically exposed symbol(s).`,
    });
  }

  if (kind === 'cli') {
    scoreBreakdown.push({
      factor: 'explicit-cli-entry',
      score: 14,
      reason: 'Path pattern indicates a CLI entry surface.',
    });
  } else if (kind === 'mcp') {
    scoreBreakdown.push({
      factor: 'explicit-mcp-entry',
      score: 16,
      reason: 'Path pattern indicates an MCP-facing surface.',
    });
  } else if (kind === 'config' || kind === 'schema') {
    scoreBreakdown.push({
      factor: 'explicit-config-surface',
      score: 20,
      reason: 'File is a config or schema-facing surface.',
    });
  } else if (kind === 'route') {
    scoreBreakdown.push({
      factor: 'request-entry-surface',
      score: 18,
      reason: 'Path pattern indicates a route or handler entry.',
    });
  }

  if (exportCount > 0) {
    scoreBreakdown.push({
      factor: 'exported-symbols',
      score: Math.min(12, exportCount * 2),
      reason: `File exports ${exportCount} symbol(s).`,
    });
  }

  if (dependedByCount > 0) {
    scoreBreakdown.push({
      factor: 'internal-consumers',
      score: Math.min(14, dependedByCount * 3),
      reason: `File is consumed by ${dependedByCount} indexed file(s).`,
    });
  }

  if (reexportCount > 0) {
    scoreBreakdown.push({
      factor: 'reexport-amplification',
      score: Math.min(12, reexportCount * 4),
      reason: `File is re-exported by ${reexportCount} file(s).`,
    });
  }

  if (unit.skeleton.structuralHints.isBarrel) {
    scoreBreakdown.push({
      factor: 'barrel-shape',
      score: 6,
      reason: 'Barrel files often form a public aggregation surface.',
    });
  }

  if (unit.skeleton.structuralHints.isTypeOnly) {
    scoreBreakdown.push({
      factor: 'type-only-penalty',
      score: -8,
      reason: 'Type-only files are less likely to be runtime entry surfaces.',
    });
  }

  const totalScore = sumScores(scoreBreakdown);
  const hasExplicitSignal = publicSurfaceCount > 0 || kind !== 'public-module';
  const keep =
    totalScore >= 20 && (hasExplicitSignal || dependedByCount >= 3 || reexportCount >= 1);
  if (!keep) {
    return null;
  }

  return {
    filePath,
    kind,
    totalScore,
    confidence: toConfidence(totalScore, scoreBreakdown.length),
    scoreBreakdown,
  } satisfies ScoredCandidate<PublicSurfaceKind>;
}

export function buildPublicSurfaceView(
  units: LoadedUnit[],
): IViewArtifactEnvelope<IPublicSurfaceViewItem> {
  const reexportCounts = computeReexportCounts(units);
  const candidates = units
    .map(({ unit }) => buildPublicSurfaceCandidate(unit, reexportCounts))
    .filter((candidate): candidate is ScoredCandidate<PublicSurfaceKind> => candidate !== null)
    .sort((a, b) => b.totalScore - a.totalScore || a.filePath.localeCompare(b.filePath));

  // Diversity cap: no single kind may exceed 50% of available slots
  const maxPerKind = Math.max(3, Math.floor(MAX_PUBLIC_SURFACE_ITEMS / 2));
  const kindCounts = new Map<string, number>();
  const diversified: ScoredCandidate<PublicSurfaceKind>[] = [];
  const reserve: ScoredCandidate<PublicSurfaceKind>[] = [];

  for (const candidate of candidates) {
    const kind = candidate.kind;
    const currentCount = kindCounts.get(kind) || 0;
    if (currentCount < maxPerKind) {
      diversified.push(candidate);
      kindCounts.set(kind, currentCount + 1);
    } else {
      reserve.push(candidate);
    }
  }

  // Backfill remaining slots from reserve (score-ordered)
  for (const candidate of reserve) {
    if (diversified.length >= MAX_PUBLIC_SURFACE_ITEMS) {
      break;
    }
    diversified.push(candidate);
  }

  const items = diversified.slice(0, MAX_PUBLIC_SURFACE_ITEMS).map((candidate, index) => {
    const unit = units.find((entry) => entry.unit.identity.filePath === candidate.filePath)!.unit;
    return {
      id: `entry-${index + 1}`,
      entrypoint: candidate.filePath,
      kind: candidate.kind,
      symbols: pickSurfaceSymbols(unit, candidate.kind),
      summary: buildPublicSurfaceSummary(unit, candidate.kind),
      confidence: candidate.confidence,
      scoreBreakdown: candidate.scoreBreakdown,
    } satisfies IPublicSurfaceViewItem;
  });

  // Compute quality metadata
  const scores = items.map((i) => i.confidence);
  const diversity: Record<string, number> = {};
  for (const item of items) {
    diversity[item.kind] = (diversity[item.kind] || 0) + 1;
  }
  const quality =
    items.length > 0
      ? {
          scoreRange: {
            min: Math.round(Math.min(...scores) * 100) / 100,
            median: (() => {
              const sorted = [...scores].sort();
              const mid = Math.floor(sorted.length / 2);
              return sorted.length % 2 !== 0
                ? Math.round(sorted[mid] * 100) / 100
                : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
            })(),
            max: Math.round(Math.max(...scores) * 100) / 100,
          },
          diversity,
          totalCandidatesEvaluated: candidates.length,
          selectionRate: `${((items.length / candidates.length) * 100).toFixed(1)}%`,
        }
      : undefined;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    viewType: 'public-surface',
    summary:
      items.length === 0
        ? 'No high-confidence public entry surfaces were selected.'
        : `Top ${items.length} high-confidence public entry surfaces derived from index and graph signals.`,
    items,
    _quality: quality,
  };
}

function classifyPublicSurfaceKind(unit: SpineUnit): PublicSurfaceKind | null {
  const filePath = unit.identity?.filePath;
  if (!filePath) {
    return null;
  }
  const normalized = (filePath || '').replace(/\\/g, '/');
  if (unit.identity.fileKind === 'config' && normalized.startsWith('schemas/')) {
    return 'schema';
  }
  if (
    normalized.includes('/mcp/') ||
    normalized.endsWith('/mcp/tools.ts') ||
    normalized.endsWith('/mcp/server.ts')
  ) {
    return 'mcp';
  }
  if (
    normalized.includes('/cli/') ||
    normalized.startsWith('src/cli/') ||
    /^src\/cli\/commands\/[^/]+\.ts$/.test(normalized)
  ) {
    return 'cli';
  }
  if (/(\broute\b|\broutes\b|\brouter\b|\bhandler\b|\bcontroller\b)/.test(normalized)) {
    return 'route';
  }
  if (
    unit.identity.fileKind === 'config' ||
    /(^|\/)(config|settings)\./.test(path.basename(normalized))
  ) {
    return 'config';
  }
  if (normalized.startsWith('schemas/') || /\.schema\./.test(normalized)) {
    return 'schema';
  }
  if (unit.skeleton.exports.length > 0 || unit.semantic.publicSurface.length > 0) {
    return 'public-module';
  }
  return null;
}

function computeReexportCounts(units: LoadedUnit[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { unit } of units) {
    const dependsOn = unit.graph?.dependsOn || [];
    for (const edge of dependsOn) {
      if (edge.relation !== 'reexport') {
        continue;
      }
      counts.set(edge.targetPath, (counts.get(edge.targetPath) || 0) + 1);
    }
  }
  return counts;
}

function pickSurfaceSymbols(unit: SpineUnit, kind: PublicSurfaceKind): string[] {
  if (kind === 'cli') {
    const filePath = unit.identity?.filePath || '';
    const commandMatch = filePath.match(/^src\/cli\/commands\/([^/]+)\.ts$/);
    if (commandMatch) {
      return [commandMatch[1]];
    }
  }

  const semanticSymbols = (unit.semantic?.publicSurface || [])
    .map((entry) => entry.symbolName)
    .filter((s): s is string => typeof s === 'string');
  const exportSymbols = (unit.skeleton?.exports || [])
    .map((entry) => entry.name)
    .filter((s): s is string => typeof s === 'string');
  return [...new Set([...semanticSymbols, ...exportSymbols])].slice(0, 8);
}

function buildPublicSurfaceSummary(unit: SpineUnit, kind: PublicSurfaceKind): string {
  const role = unit.semantic.role || 'Repository entry surface';
  switch (kind) {
    case 'cli':
      return `CLI-facing entry: ${role}`;
    case 'mcp':
      return `MCP-facing entry: ${role}`;
    case 'config':
      return `Configuration-facing surface: ${role}`;
    case 'schema':
      return `Schema-facing surface: ${role}`;
    case 'route':
      return `Request entry surface: ${role}`;
    case 'public-module':
    default:
      return `Exported module surface: ${role}`;
  }
}

export const publicSurfaceProducer: ViewProducer = {
  async derive(ctx: ViewContext): Promise<ViewArtifact> {
    const units = ctx.loader.getIndexedUnits();
    const viewData = buildPublicSurfaceView(units);
    const markdown = ViewRenderer.renderPublicSurface(viewData);

    ctx.outputManager.saveViewMarkdown('public-surface.md', markdown);
    ctx.outputManager.saveView('public-surface.json', viewData);
    ctx.runtimeIO?.info(`[View] Wrote ${viewData.items.length} public surface items.`);

    return {
      viewType: 'public-surface',
      generated: true,
      generatedAt: viewData.generatedAt,
      metrics: { itemCount: viewData.items.length },
    };
  },
};
