import * as fs from 'fs';
import * as path from 'path';
import type { KnowledgeGraph } from '../../engines/dependency-graph.js';
import { changeImpact } from '../../engines/graph-query.js';
import type { ViewArtifact, ViewContext, ViewProducer } from './producer.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImpactModuleEntry {
  moduleId: string;
  totalAffected: number;
  truncated: boolean;
  depth1: number;
  depth2: number;
  depth3: number;
  affectedRules: string[];
}

interface ChangeImpactEnvelope {
  schemaVersion: string;
  generatedAt: string;
  viewType: string;
  summary: string;
  modules: ImpactModuleEntry[];
  /** Self-check quality metadata */
  _quality?: {
    nodeCount: number;
    totalCandidatesEvaluated: number;
    highImpactModuleCount: number;
    truncatedEntryCount: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeMarkdownTableCell(value: string): string {
  return (value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function loadKnowledgeGraph(rootDir: string): KnowledgeGraph | null {
  const kgPath = path.join(rootDir, '.spine', 'view', 'data', 'knowledge-graph.json');
  if (!fs.existsSync(kgPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(kgPath, 'utf-8')) as KnowledgeGraph;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function renderChangeImpactMarkdown(entries: ImpactModuleEntry[]): string {
  const generatedAt = new Date().toISOString();

  const sorted = [...entries].sort((a, b) => b.totalAffected - a.totalAffected);

  const rows = sorted.map((entry) => {
    const truncated = entry.truncated ? ' :warning: truncated' : '';
    return `| \`${escapeMarkdownTableCell(entry.moduleId)}\` | ${entry.totalAffected}${truncated} | ${entry.depth1} | ${entry.depth2} | ${entry.depth3} | ${entry.affectedRules.length} |`;
  });

  return [
    '# Change Impact Report',
    '',
    `_Generated at ${generatedAt}_`,
    '',
    `Pre-computed impact radius for **${entries.length}** modules. For each module, "affected" means every other module that directly or transitively depends on it (BFS up to depth 3).`,
    '',
    '| Module | Total Affected | Depth 1 | Depth 2 | Depth 3 | Rules Affected |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '---',
    '',
    '## How to Read This',
    '',
    '- **Total Affected** — distinct modules in the impact cone (excluding the origin module itself).',
    '- **Depth 1** — modules that directly import the origin module.',
    '- **Depth 2** — modules that import depth-1 modules.',
    '- **Depth 3** — modules that import depth-2 modules.',
    '- **Rules Affected** — count of architecture rules violated on edges within the impact cone.',
    '- **:warning: truncated** — impact radius exceeds depth 3; there may be more modules beyond.',
    '',
    'Changes to modules with high Total Affected scores have the largest blast radius and should be reviewed with extra care.',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

async function deriveChangeImpact(ctx: ViewContext): Promise<ViewArtifact> {
  const kg = loadKnowledgeGraph(ctx.rootDir);

  if (!kg || !kg.nodes || kg.nodes.length === 0) {
    return {
      viewType: 'change-impact',
      generated: true,
      generatedAt: new Date().toISOString(),
      metrics: { moduleCount: 0, totalImpactEntries: 0 },
    };
  }

  const entries: ImpactModuleEntry[] = [];

  for (const node of kg.nodes) {
    const report = changeImpact(kg, node.id, 3);

    const depthCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    for (const group of report.affectedModules) {
      depthCounts[group.depth] = group.modules.length;
    }

    entries.push({
      moduleId: node.id,
      totalAffected: report.totalAffected,
      truncated: report.truncated,
      depth1: depthCounts[1] ?? 0,
      depth2: depthCounts[2] ?? 0,
      depth3: depthCounts[3] ?? 0,
      affectedRules: report.affectedRules,
    });
  }

  const envelope: ChangeImpactEnvelope = {
    schemaVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    viewType: 'change-impact',
    summary: `Pre-computed change impact radius for ${entries.length} modules.`,
    modules: entries,
    _quality: {
      nodeCount: kg.nodes.length,
      totalCandidatesEvaluated: kg.nodes.length,
      highImpactModuleCount: entries.filter((e) => e.totalAffected >= 5).length,
      truncatedEntryCount: entries.filter((e) => e.truncated).length,
    },
  };

  ctx.outputManager.saveView('change-impact.json', envelope);

  const markdown = renderChangeImpactMarkdown(entries);
  ctx.outputManager.saveViewMarkdown('change-impact.md', markdown);

  ctx.runtimeIO?.info(`[View] Wrote change-impact report for ${entries.length} modules.`);

  return {
    viewType: 'change-impact',
    generated: true,
    generatedAt: new Date().toISOString(),
    metrics: {
      moduleCount: kg.nodes.length,
      totalImpactEntries: entries.length,
      highImpactModules: entries.filter((e) => e.totalAffected >= 5).length,
      truncatedEntries: entries.filter((e) => e.truncated).length,
    },
  };
}

export const changeImpactProducer: ViewProducer = {
  async derive(ctx: ViewContext): Promise<ViewArtifact> {
    return deriveChangeImpact(ctx);
  },
};
