import type { ViewId } from '../../types/view.js';

export interface ViewDefinition {
  id: ViewId;
  title: string;
  description: string;
  defaultEnabled: boolean;
  requiresFullSync: boolean;
  requiresLlm: boolean;
  outputs: string[];
}

export const VIEW_DEFINITIONS: ViewDefinition[] = [
  {
    id: 'public-surface',
    title: 'Public Surface',
    description: 'Fast repo entry surface map for readers and agents.',
    defaultEnabled: true,
    requiresFullSync: false,
    requiresLlm: false,
    outputs: ['public-surface.json', 'public-surface.md'],
  },
  {
    id: 'risk-hotspots',
    title: 'Risk Hotspots',
    description: 'Structurally risky files with transparent score breakdowns.',
    defaultEnabled: true,
    requiresFullSync: false,
    requiresLlm: false,
    outputs: ['risk-hotspots.json', 'risk-hotspots.md'],
  },
  {
    id: 'architecture-diagram',
    title: 'Architecture Diagram',
    description: 'Full-sync deterministic architecture diagram rendered as standalone SVG.',
    defaultEnabled: true,
    requiresFullSync: true,
    requiresLlm: false,
    outputs: ['architecture-diagram.json', 'architecture-diagram.html', 'architecture-diagram.svg'],
  },
  {
    id: 'project-health',
    title: 'Project Health',
    description:
      'Human-readable project health report with topology, cycles, dead code, hubs, and violations.',
    defaultEnabled: true,
    requiresFullSync: false,
    requiresLlm: false,
    outputs: ['project-health.md'],
  },
  {
    id: 'agent-briefing',
    title: 'Agent Briefing',
    description:
      'One-page project briefing for AI agents covering tech stack, entry points, module topology, constraints, and health.',
    defaultEnabled: true,
    requiresFullSync: false,
    requiresLlm: false,
    outputs: ['agent-briefing.md'],
  },
  {
    id: 'change-impact',
    title: 'Change Impact',
    description:
      'Pre-computed BFS impact radius for every module — see what breaks before you change it.',
    defaultEnabled: true,
    requiresFullSync: false,
    requiresLlm: false,
    outputs: ['change-impact.json', 'change-impact.md'],
  },
];

const VIEW_DEFINITION_MAP = new Map(
  VIEW_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function isViewId(value: string): value is ViewId {
  return VIEW_DEFINITION_MAP.has(value as ViewId);
}

export function getViewDefinition(viewId: ViewId): ViewDefinition {
  return VIEW_DEFINITION_MAP.get(viewId)!;
}

export function getDefaultEnabledViewIds(): ViewId[] {
  return VIEW_DEFINITIONS.filter((definition) => definition.defaultEnabled).map(
    (definition) => definition.id,
  );
}

export function normalizeViewIds(values: string[] | undefined): {
  known: ViewId[];
  unknown: string[];
} {
  if (!values) {
    return {
      known: [],
      unknown: [],
    };
  }

  const seen = new Set<string>();
  const known: ViewId[] = [];
  const unknown: string[] = [];

  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    if (isViewId(value)) {
      known.push(value);
    } else {
      unknown.push(value);
    }
  }

  return { known, unknown };
}
