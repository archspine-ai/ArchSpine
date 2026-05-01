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
    description: 'Full-sync architecture view rendered as JSON plus HTML/SVG.',
    defaultEnabled: true,
    requiresFullSync: true,
    requiresLlm: true,
    outputs: ['architecture-diagram.json', 'architecture-diagram.html'],
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
