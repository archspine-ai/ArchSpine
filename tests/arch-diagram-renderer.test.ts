import { describe, expect, it } from 'vitest';
import { ArchitectureDiagramRenderer } from '../src/services/view/index.js';
import type { ArchDiagramSpec } from '../src/types/view.js';

function createSpec(overrides: Partial<ArchDiagramSpec> = {}): ArchDiagramSpec {
  return {
    title: 'ArchSpine',
    subtitle: 'Experimental architecture view.',
    nodes: [
      { id: 'web', label: 'Web UI', sublabel: 'Frontend', type: 'frontend' },
      { id: 'api', label: 'API', sublabel: 'Node.js', type: 'backend' },
      { id: 'bus', label: 'Queue', sublabel: 'Async', type: 'messagebus' },
      { id: 'db', label: 'DB', sublabel: 'SQLite', type: 'database' },
      { id: 'ext', label: 'GitHub', sublabel: 'External', type: 'external' },
    ],
    edges: [
      { from: 'web', to: 'api', label: 'HTTP', style: 'solid' },
      { from: 'api', to: 'bus', label: 'Events', style: 'solid' },
      { from: 'api', to: 'db', label: 'State', style: 'solid' },
      { from: 'api', to: 'ext', label: 'Repo', style: 'dashed' },
    ],
    summaryCards: [
      { heading: 'Core Modules', points: ['Frontend', 'Backend', 'Persistence'] },
      { heading: 'Key Dependencies', points: ['Queue', 'SQLite', 'GitHub'] },
      {
        heading: 'System Boundaries',
        points: ['Repo runtime', 'Protected outputs', 'External APIs'],
      },
    ],
    ...overrides,
  };
}

describe('architecture diagram renderer', () => {
  it('renders HTML with node ids and svg content', () => {
    const output = ArchitectureDiagramRenderer.render(createSpec());

    expect(output).toContain('<svg');
    expect(output).toContain('data-node-id="api"');
    expect(output).toContain('Experimental View');
    expect(output).toContain('Core Modules');
  });

  it('handles larger node sets without dropping the document shell', () => {
    const nodes = Array.from({ length: 20 }, (_, index) => ({
      id: `node-${index}`,
      label: `Node ${index}`,
      sublabel: `Layer ${index}`,
      type: (
        ['frontend', 'backend', 'messagebus', 'database', 'security', 'cloud', 'external'] as const
      )[index % 7],
    }));

    const output = ArchitectureDiagramRenderer.render(
      createSpec({
        nodes,
        edges: nodes.slice(0, -1).map((node, index) => ({
          from: node.id,
          to: nodes[index + 1].id,
          label: `Flow ${index}`,
          style: 'solid',
        })),
      }),
    );

    expect(output).toContain('<!DOCTYPE html>');
    expect(output).toContain('data-node-id="node-19"');
    expect(output).toContain('<section class="cards">');
  });

  it('renders a meaningful empty state when no nodes are present', () => {
    const output = ArchitectureDiagramRenderer.render(createSpec({ nodes: [], edges: [] }));

    expect(output).toContain('No architecture diagram data available.');
    expect(output).toContain('<html lang="en">');
  });
});
