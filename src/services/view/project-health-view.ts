import * as fs from 'fs';
import * as path from 'path';
import type { ViewArtifact, ViewContext, ViewProducer } from './producer.js';
import type { IViewArtifactEnvelope } from '../../types/view.js';

// ---------------------------------------------------------------------------
// Diagnostic data shapes – mirror the JSON files under .spine/view/data/
// ---------------------------------------------------------------------------

interface KGNode {
  id: string;
  path: string;
  layer: string;
  role: string;
  responsibilities: string[];
  invariants: string[];
  fanIn: number;
  fanOut: number;
  violationCount: number;
  publicSurface: string[];
}

interface KGEdge {
  from: string;
  to: string;
  type: string;
  fileCount: number;
  compliant: boolean;
}

interface KnowledgeGraph {
  nodes: KGNode[];
  edges: KGEdge[];
}

interface CycleEntry {
  cycleId: string;
  nodes: string[];
  length: number;
}

interface DeadCodeEntry {
  moduleId: string;
  reason: string;
  confidence: string;
}

interface HubEntry {
  moduleId: string;
  fanIn: number;
  percentile: number;
}

interface AggregatedViolation {
  ruleId: string;
  severity: string;
  count: number;
}

// ---------------------------------------------------------------------------
// JSON envelope types
// ---------------------------------------------------------------------------

interface TopologySummary {
  moduleCount: number;
  edgeCount: number;
  compliantEdgeCount: number;
  nonCompliantEdgeCount: number;
  compliantRatio: string;
}

interface ProjectHealthData {
  topology: TopologySummary | null;
  cycles: CycleEntry[] | null;
  deadCode: DeadCodeEntry[] | null;
  hubs: HubEntry[] | null;
  violations: AggregatedViolation[];
}

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------

function loadJsonFile<T>(rootDir: string, relativePath: string): T | null {
  const fullPath = path.join(rootDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadKnowledgeGraph(rootDir: string): KnowledgeGraph | null {
  return loadJsonFile<KnowledgeGraph>(rootDir, '.spine/view/data/knowledge-graph.json');
}

function loadCycles(rootDir: string): CycleEntry[] | null {
  return loadJsonFile<CycleEntry[]>(rootDir, '.spine/view/data/diagnostics/cycles.json');
}

function loadDeadCode(rootDir: string): DeadCodeEntry[] | null {
  return loadJsonFile<DeadCodeEntry[]>(rootDir, '.spine/view/data/diagnostics/dead-code.json');
}

function loadHubs(rootDir: string): HubEntry[] | null {
  return loadJsonFile<HubEntry[]>(rootDir, '.spine/view/data/diagnostics/hubs.json');
}

function aggregateViolations(
  units: Array<{
    unit: { semantic?: { ruleViolations?: Array<{ id: string; severity: string }> } };
  }>,
): AggregatedViolation[] {
  const map = new Map<string, AggregatedViolation>();

  for (const { unit } of units) {
    const violations = unit.semantic?.ruleViolations;
    if (!violations || violations.length === 0) {
      continue;
    }
    for (const v of violations) {
      const key = `${v.id}\x00${v.severity}`;
      const entry = map.get(key);
      if (entry) {
        entry.count++;
      } else {
        map.set(key, { ruleId: v.id, severity: v.severity, count: 1 });
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.ruleId.localeCompare(b.ruleId),
  );
}

// ---------------------------------------------------------------------------
// Risk hint helper
// ---------------------------------------------------------------------------

function riskHint(percentile: number): string {
  if (percentile >= 90) {
    return 'Critical hub — single point of failure risk';
  }
  if (percentile >= 80) {
    return 'High hub — broad blast radius';
  }
  if (percentile >= 70) {
    return 'Moderate hub — growing dependency concentration';
  }
  if (percentile >= 50) {
    return 'Low hub — notable fan-in';
  }
  return 'Minimal risk';
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function renderTopologySection(kg: KnowledgeGraph | null): string {
  if (!kg) {
    return '## Topology Overview\n\nTopology data unavailable (knowledge-graph.json is missing).\n';
  }

  const moduleCount = kg.nodes.length;
  const totalEdges = kg.edges.length;
  const compliantEdges = kg.edges.filter((e) => e.compliant).length;
  const nonCompliantEdges = totalEdges - compliantEdges;
  const compliantRatio = totalEdges > 0 ? ((compliantEdges / totalEdges) * 100).toFixed(1) : '0.0';

  return [
    '## Topology Overview',
    '',
    `- **Modules**: ${moduleCount}`,
    `- **Dependency edges**: ${totalEdges}`,
    `- **Compliant edge ratio**: ${compliantRatio}% (${compliantEdges} / ${totalEdges})`,
    `- **Non-compliant edges**: ${nonCompliantEdges}`,
    '',
  ].join('\n');
}

function renderCyclesSection(cycles: CycleEntry[] | null): string {
  if (!cycles || cycles.length === 0) {
    return '## Cycle Dependencies\n\nNo cycle dependencies detected.\n';
  }

  const sorted = [...cycles].sort(
    (a, b) => b.length - a.length || a.cycleId.localeCompare(b.cycleId),
  );

  const rows = sorted.map((c) => {
    const modules = c.nodes.join(', ');
    return `| ${escapeMarkdownTableCell(c.cycleId)} | ${escapeMarkdownTableCell(modules)} | ${c.length} |`;
  });

  return [
    '## Cycle Dependencies',
    '',
    `_${sorted.length} cycle(s) detected._`,
    '',
    '| Cycle ID | Modules | Length |',
    '|----------|---------|--------|',
    ...rows,
    '',
  ].join('\n');
}

function renderDeadCodeSection(deadCode: DeadCodeEntry[] | null): string {
  if (!deadCode || deadCode.length === 0) {
    return '## Suspicious Dead Code\n\nNo suspicious dead code detected.\n';
  }

  const rows = deadCode.map((d) => {
    return `| ${escapeMarkdownTableCell(d.moduleId)} | ${escapeMarkdownTableCell(d.reason)} | ${d.confidence} |`;
  });

  return [
    '## Suspicious Dead Code',
    '',
    `_${deadCode.length} suspect(s) identified._`,
    '',
    '| Module | Reason | Confidence |',
    '|--------|--------|------------|',
    ...rows,
    '',
  ].join('\n');
}

function renderHubsSection(hubs: HubEntry[] | null): string {
  if (!hubs || hubs.length === 0) {
    return '## Hub Module Risks\n\nNo hub module risks detected.\n';
  }

  // Only surface modules with fanIn >= 2 to keep the table focused on real hubs
  const meaningful = hubs.filter((h) => h.fanIn >= 2);
  if (meaningful.length === 0) {
    return '## Hub Module Risks\n\nNo modules with significant fan-in detected (all fanIn < 2).\n';
  }

  const rows = meaningful.map((h) => {
    const hint = riskHint(h.percentile);
    return `| ${escapeMarkdownTableCell(h.moduleId)} | ${h.fanIn} | ${h.percentile} | ${escapeMarkdownTableCell(hint)} |`;
  });

  return [
    '## Hub Module Risks',
    '',
    `_${meaningful.length} module(s) with notable fan-in._`,
    '',
    '| Module | Fan-In | Percentile | Risk Hint |',
    '|--------|--------|------------|-----------|',
    ...rows,
    '',
  ].join('\n');
}

function renderViolationsSection(violations: AggregatedViolation[]): string {
  if (violations.length === 0) {
    return '## Active Violations Summary\n\nNo active rule violations detected across the codebase.\n';
  }

  const rows = violations.map((v) => {
    return `| ${escapeMarkdownTableCell(v.ruleId)} | ${v.severity} | ${v.count} |`;
  });

  return [
    '## Active Violations Summary',
    '',
    `_${violations.length} distinct rule violation type(s) across the codebase._`,
    '',
    '| Rule ID | Severity | Occurrences |',
    '|---------|----------|-------------|',
    ...rows,
    '',
  ].join('\n');
}

function renderProjectHealthMarkdown(params: {
  kg: KnowledgeGraph | null;
  cycles: CycleEntry[] | null;
  deadCode: DeadCodeEntry[] | null;
  hubs: HubEntry[] | null;
  violations: AggregatedViolation[];
}): string {
  const generatedAt = new Date().toISOString();

  const sections = [
    '# Project Health Report',
    '',
    `_Generated at ${generatedAt}_`,
    '',
    renderTopologySection(params.kg),
    renderCyclesSection(params.cycles),
    renderDeadCodeSection(params.deadCode),
    renderHubsSection(params.hubs),
    renderViolationsSection(params.violations),
  ];

  return sections.join('\n').trim() + '\n';
}

// ---------------------------------------------------------------------------
// JSON builder
// ---------------------------------------------------------------------------

function buildProjectHealthJson(params: {
  kg: KnowledgeGraph | null;
  cycles: CycleEntry[] | null;
  deadCode: DeadCodeEntry[] | null;
  hubs: HubEntry[] | null;
  violations: AggregatedViolation[];
}): IViewArtifactEnvelope<ProjectHealthData> {
  const topology: TopologySummary | null = params.kg
    ? {
        moduleCount: params.kg.nodes.length,
        edgeCount: params.kg.edges.length,
        compliantEdgeCount: params.kg.edges.filter((e) => e.compliant).length,
        nonCompliantEdgeCount: params.kg.edges.filter((e) => !e.compliant).length,
        compliantRatio:
          params.kg.edges.length > 0
            ? (
                (params.kg.edges.filter((e) => e.compliant).length / params.kg.edges.length) *
                100
              ).toFixed(1)
            : '0.0',
      }
    : null;

  return {
    schemaVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    viewType: 'project-health',
    summary:
      [
        topology
          ? `${topology.moduleCount} modules, ${topology.edgeCount} edges`
          : 'Topology unavailable',
        params.cycles?.length ? `${params.cycles.length} cycle(s)` : 'No cycles',
        params.deadCode?.length ? `${params.deadCode.length} dead code suspect(s)` : 'No dead code',
        params.hubs?.length ? `${params.hubs.length} hub(s)` : 'No hubs',
        params.violations.length
          ? `${params.violations.length} violation type(s)`
          : 'No violations',
      ]
        .filter(Boolean)
        .join('. ') + '.',
    items: [
      {
        topology,
        cycles: params.cycles,
        deadCode: params.deadCode,
        hubs: params.hubs,
        violations: params.violations,
      },
    ],
    _quality: {
      nodeCount: topology?.moduleCount ?? 0,
      edgeCount: topology?.edgeCount ?? 0,
      cycleCount: params.cycles?.length ?? 0,
      deadCodeCount: params.deadCode?.length ?? 0,
      hubCount: params.hubs?.length ?? 0,
      violationTypeCount: params.violations.length,
    },
  };
}

// ---------------------------------------------------------------------------
// ViewProducer implementation
// ---------------------------------------------------------------------------

export const projectHealthProducer: ViewProducer = {
  async derive(ctx: ViewContext): Promise<ViewArtifact> {
    const kg = loadKnowledgeGraph(ctx.rootDir);
    const cycles = loadCycles(ctx.rootDir);
    const deadCode = loadDeadCode(ctx.rootDir);
    const hubs = loadHubs(ctx.rootDir);

    const indexedUnits = ctx.loader.getIndexedUnits();
    const violations = aggregateViolations(indexedUnits.map((u) => ({ unit: u.unit })));

    const markdown = renderProjectHealthMarkdown({
      kg,
      cycles,
      deadCode,
      hubs,
      violations,
    });

    const jsonEnvelope = buildProjectHealthJson({
      kg,
      cycles,
      deadCode,
      hubs,
      violations,
    });

    ctx.outputManager.saveViewMarkdown('project-health.md', markdown);
    ctx.outputManager.saveView('project-health.json', jsonEnvelope);

    ctx.runtimeIO?.info(
      `[View] Wrote project health report (modules: ${kg?.nodes.length ?? '?'}, edges: ${kg?.edges.length ?? '?'}).`,
    );

    return {
      viewType: 'project-health',
      generated: true,
      generatedAt: new Date().toISOString(),
      metrics: {
        moduleCount: kg?.nodes.length ?? 0,
        edgeCount: kg?.edges.length ?? 0,
        cycleCount: cycles?.length ?? 0,
        deadCodeSuspectCount: deadCode?.length ?? 0,
        hubCount: hubs?.length ?? 0,
        distinctViolationTypes: violations.length,
      },
    };
  },
};
