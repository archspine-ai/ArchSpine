import { describe, expect, it } from 'vitest';
import { ViewRenderer } from '../../../src/services/view/index.js';
import type {
  PublicSurfaceViewItem,
  RiskHotspotViewItem,
  ViewArtifactEnvelope,
} from '../../../src/types/view.js';
import { CURRENT_SCHEMA_VERSION } from '../../../src/types/protocol.js';

function createEnvelope<TItem>(
  viewType: 'public-surface' | 'risk-hotspots',
  summary: string,
  items: TItem[],
): ViewArtifactEnvelope<TItem> {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    generatedAt: '2026-04-16T00:00:00.000Z',
    viewType,
    summary,
    items,
  };
}

describe('view renderer', () => {
  it('renders risk hotspots markdown with the expected heading and one table row per item', () => {
    const items: RiskHotspotViewItem[] = [
      {
        id: 'hotspot-1',
        hotspotPath: 'src/core/shared.ts',
        riskFactors: ['fan-in', 'semantic-change'],
        summary: 'Shared coordination module with growing responsibilities.',
        impactRadiusHint: 'Touches shared runtime state.',
        confidence: 0.94,
        totalScore: 38,
        scoreBreakdown: [
          { factor: 'fan-in', score: 18, reason: 'Many internal consumers depend on this file.' },
          { factor: 'semantic-change', score: 16, reason: 'Role expanded beyond previous scope.' },
        ],
      },
      {
        id: 'hotspot-2',
        hotspotPath: 'src/services/task-runtime.ts',
        riskFactors: ['fan-out'],
        summary: 'Runtime service coordinates multiple subsystems.',
        impactRadiusHint: 'Crosses service boundaries.',
        confidence: 0.88,
        totalScore: 26,
        scoreBreakdown: [
          { factor: 'fan-out', score: 10, reason: 'Depends on many indexed files.' },
        ],
      },
    ];

    const output = ViewRenderer.renderRiskHotspots(
      createEnvelope('risk-hotspots', 'Top 2 risk hotspots ranked by score.', items),
    );

    expect(output).toContain('# Risk Hotspots Report');
    expect(output).toContain('| Rank | File | Risk Factors | Impact | Score |');
    expect(output.match(/^\| \d+ \|/gm)).toHaveLength(items.length);
    expect(output).toContain('### 1. `src/core/shared.ts`');
  });

  it('renders public surface markdown with grouped sections and empty states', () => {
    const items: PublicSurfaceViewItem[] = [
      {
        id: 'entry-1',
        entrypoint: 'src/cli/index.ts',
        kind: 'cli',
        symbols: ['run'],
        summary: 'CLI root entry point.',
        confidence: 0.95,
        scoreBreakdown: [],
      },
      {
        id: 'entry-2',
        entrypoint: 'src/config/project.ts',
        kind: 'config',
        symbols: ['loadProjectConfig'],
        summary: 'Project configuration surface.',
        confidence: 0.78,
        scoreBreakdown: [],
      },
    ];

    const output = ViewRenderer.renderPublicSurface(
      createEnvelope('public-surface', 'Top 2 public entry surfaces.', items),
    );

    expect(output).toContain('# Public Surface Map');
    expect(output).toContain('## CLI Entry Points');
    expect(output).toContain('### `src/cli/index.ts`');
    expect(output).toContain('## MCP Entry Points');
    expect(output).toContain('_No mcp entry points detected._');
    expect(output).toContain('## Exported Modules');
    expect(output).toContain('### `src/config/project.ts`');
  });

  it('renders empty view states without crashing', () => {
    const publicOutput = ViewRenderer.renderPublicSurface(
      createEnvelope('public-surface', 'No public surfaces found.', []),
    );
    const riskOutput = ViewRenderer.renderRiskHotspots(
      createEnvelope('risk-hotspots', 'No risk hotspots found.', []),
    );

    expect(publicOutput).toContain('_No cli entry points detected._');
    expect(publicOutput).toContain('_No mcp entry points detected._');
    expect(publicOutput).toContain('_No exported modules detected._');
    expect(riskOutput).toContain('| - | _No hotspots detected_ | - | - | - |');
    expect(riskOutput).toContain('No hotspots were selected for this run.');
  });
});
