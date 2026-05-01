import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type {
  PublicSurfaceKind,
  PublicSurfaceViewItem,
  RiskHotspotViewItem,
  ViewArtifactEnvelope,
} from '../../types/view.js';

interface ViewTemplateData {
  generatedAt: string;
  summary: string;
  hotspotRows?: string;
  hotspotDetails?: string;
  cliEntries?: string;
  mcpEntries?: string;
  moduleEntries?: string;
}

const DEFAULT_TEMPLATE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../assets/templates/view',
);

function escapeRegExp(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeMarkdownInline(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/`/g, '\\`');
}

function escapeMarkdownTableCell(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function formatConfidence(value: number): string {
  const bounded = Math.max(0, Math.min(1, value));
  return bounded.toFixed(2);
}

function renderTemplate(template: string, data: ViewTemplateData): string {
  let output = template;

  for (const [key, value] of Object.entries(data)) {
    output = output.replace(new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g'), value ?? '');
  }

  return output.replace(/\n{3,}/g, '\n\n').trim();
}

function formatKind(kind: PublicSurfaceKind): string {
  switch (kind) {
    case 'cli':
      return 'CLI';
    case 'mcp':
      return 'MCP';
    case 'config':
      return 'Config';
    case 'schema':
      return 'Schema';
    case 'route':
      return 'Route';
    case 'public-module':
      return 'Public Module';
    default:
      return kind;
  }
}

function renderPublicSurfaceGroup(title: string, items: PublicSurfaceViewItem[]): string {
  if (items.length === 0) {
    return `_No ${title.toLowerCase()} detected._`;
  }

  return items
    .map((item) => {
      const symbols =
        item.symbols.length > 0
          ? item.symbols.map((symbol) => `\`${escapeMarkdownInline(symbol)}\``).join(', ')
          : '_None_';

      return [
        `### \`${escapeMarkdownInline(item.entrypoint)}\``,
        `Kind: ${formatKind(item.kind)}`,
        `Symbols: ${symbols}`,
        `Confidence: ${formatConfidence(item.confidence)}`,
        item.summary,
      ].join('\n');
    })
    .join('\n\n');
}

function renderRiskRows(items: RiskHotspotViewItem[]): string {
  if (items.length === 0) {
    return '| - | _No hotspots detected_ | - | - | - |';
  }

  return items
    .map((item, index) => {
      const factors =
        item.riskFactors.length > 0
          ? item.riskFactors.map((factor) => `\`${escapeMarkdownTableCell(factor)}\``).join(', ')
          : '_None_';

      return `| ${index + 1} | \`${escapeMarkdownTableCell(item.hotspotPath)}\` | ${factors} | ${escapeMarkdownTableCell(item.impactRadiusHint)} | ${item.totalScore} |`;
    })
    .join('\n');
}

function renderRiskDetails(items: RiskHotspotViewItem[]): string {
  if (items.length === 0) {
    return 'No hotspots were selected for this run.';
  }

  return items
    .map((item, index) => {
      const scoreBreakdown =
        item.scoreBreakdown.length > 0
          ? item.scoreBreakdown
              .map(
                (factor) =>
                  `- \`${escapeMarkdownInline(factor.factor)}\` (${factor.score}): ${factor.reason}`,
              )
              .join('\n')
          : '- No positive score contributors were recorded.';

      return [
        `### ${index + 1}. \`${escapeMarkdownInline(item.hotspotPath)}\``,
        item.summary,
        `Impact Radius: ${item.impactRadiusHint}`,
        `Confidence: ${formatConfidence(item.confidence)}`,
        `Score: ${item.totalScore}`,
        '',
        scoreBreakdown,
      ].join('\n');
    })
    .join('\n\n');
}

export class ViewRenderer {
  public static renderRiskHotspots(data: ViewArtifactEnvelope<RiskHotspotViewItem>): string {
    return renderTemplate(this.loadTemplate('risk-hotspots.md'), {
      generatedAt: data.generatedAt,
      summary: data.summary,
      hotspotRows: renderRiskRows(data.items),
      hotspotDetails: renderRiskDetails(data.items),
    });
  }

  public static renderPublicSurface(data: ViewArtifactEnvelope<PublicSurfaceViewItem>): string {
    const cliEntries = data.items.filter((item) => item.kind === 'cli');
    const mcpEntries = data.items.filter((item) => item.kind === 'mcp');
    const moduleEntries = data.items.filter((item) => item.kind !== 'cli' && item.kind !== 'mcp');

    return renderTemplate(this.loadTemplate('public-surface.md'), {
      generatedAt: data.generatedAt,
      summary: data.summary,
      cliEntries: renderPublicSurfaceGroup('CLI entry points', cliEntries),
      mcpEntries: renderPublicSurfaceGroup('MCP entry points', mcpEntries),
      moduleEntries: renderPublicSurfaceGroup('exported modules', moduleEntries),
    });
  }

  private static loadTemplate(fileName: string): string {
    return fs.readFileSync(path.join(DEFAULT_TEMPLATE_DIR, fileName), 'utf8');
  }
}
