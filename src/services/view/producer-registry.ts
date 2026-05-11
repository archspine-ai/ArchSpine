import type { ViewType } from '../../types/view.js';
import type { ViewProducer } from './producer.js';

const registry = new Map<ViewType, ViewProducer>();

export function registerViewProducer(viewType: ViewType, producer: ViewProducer): void {
  registry.set(viewType, producer);
}

export function getViewProducer(viewType: ViewType): ViewProducer | undefined {
  return registry.get(viewType);
}

export function listViewTypes(): ViewType[] {
  return Array.from(registry.keys());
}

// Self-register producers at module load.
// Import order is safe because each producer file is a pure definition
// with no side-effects aside from the producer export itself.
import { riskHotspotsProducer } from './risk-hotspots-view.js';
import { architectureDiagramProducer } from './architecture-diagram-view.js';
import { projectHealthProducer } from './project-health-view.js';
import { agentBriefingProducer } from './agent-briefing-view.js';
import { changeImpactProducer } from './change-impact-view.js';
import { publicSurfaceProducer } from './public-surface-view.js';

registerViewProducer('risk-hotspots', riskHotspotsProducer);
registerViewProducer('architecture-diagram', architectureDiagramProducer);
registerViewProducer('project-health', projectHealthProducer);
registerViewProducer('agent-briefing', agentBriefingProducer);
registerViewProducer('change-impact', changeImpactProducer);
registerViewProducer('public-surface', publicSurfaceProducer);
