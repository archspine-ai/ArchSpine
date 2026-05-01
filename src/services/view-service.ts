import { OutputManager } from '../infra/output.js';
import { ViewRenderer } from './view/view-renderer.js';
import type {
  PublicSurfaceViewItem,
  RiskHotspotViewItem,
  ViewArtifactEnvelope,
} from '../types/view.js';
import type { RuntimeIO } from '../infra/runtime-io.js';
import type { LLMClient } from '../infra/llm.js';
import type { ViewId } from '../types/view.js';
import { getViewDefinition } from './view/view-registry.js';
import { deriveArchitectureDiagramView } from './view/architecture-diagram-view.js';
import { ViewIndexLoader } from './view/index-loader.js';
import { buildPublicSurfaceView } from './view/public-surface-view.js';
import { buildRiskHotspotsView } from './view/risk-hotspots-view.js';
import type { LoadedUnit } from './view/types.js';

export class ViewService {
  private readonly loader: ViewIndexLoader;

  constructor(
    rootDir: string,
    private readonly outputManager: Pick<
      OutputManager,
      'saveView' | 'saveViewMarkdown' | 'saveViewHtml' | 'deleteViewArtifacts'
    >,
    private readonly runtimeIO?: RuntimeIO,
    private readonly llmClient?: LLMClient,
  ) {
    this.loader = new ViewIndexLoader(rootDir, runtimeIO);
  }

  public deriveSelectedViews(): { publicSurfaceCount: number; riskHotspotCount: number } {
    const publicSurface = this.derivePublicSurfaceView();
    const riskHotspots = this.deriveRiskHotspotsView();
    return {
      publicSurfaceCount: publicSurface.itemCount,
      riskHotspotCount: riskHotspots.itemCount,
    };
  }

  public derivePublicSurfaceView(): { generated: boolean; viewId: ViewId; itemCount: number } {
    const publicSurface = this.buildPublicSurfaceView(this.loader.getIndexedUnits());
    const publicSurfaceMarkdown = ViewRenderer.renderPublicSurface(publicSurface);

    this.outputManager.saveViewMarkdown('public-surface.md', publicSurfaceMarkdown);
    this.outputManager.saveView('public-surface.json', publicSurface);
    this.runtimeIO?.info(`[View] Wrote ${publicSurface.items.length} public-surface entries.`);

    return {
      generated: true,
      viewId: 'public-surface',
      itemCount: publicSurface.items.length,
    };
  }

  public deriveRiskHotspotsView(): { generated: boolean; viewId: ViewId; itemCount: number } {
    const riskHotspots = this.buildRiskHotspotsView(this.loader.getIndexedUnits());
    const riskHotspotsMarkdown = ViewRenderer.renderRiskHotspots(riskHotspots);

    this.outputManager.saveViewMarkdown('risk-hotspots.md', riskHotspotsMarkdown);
    this.outputManager.saveView('risk-hotspots.json', riskHotspots);
    this.runtimeIO?.info(`[View] Wrote ${riskHotspots.items.length} risk hotspots.`);

    return {
      generated: true,
      viewId: 'risk-hotspots',
      itemCount: riskHotspots.items.length,
    };
  }

  public clearViewArtifacts(viewIds: ViewId[]): void {
    const fileNames = viewIds.flatMap((viewId) => getViewDefinition(viewId).outputs);
    if (fileNames.length === 0) {
      return;
    }

    this.outputManager.deleteViewArtifacts(fileNames);
    this.runtimeIO?.info(`[View] Cleared artifacts for disabled views: ${viewIds.join(', ')}.`);
  }

  public async deriveArchitectureDiagramView(): Promise<{
    generated: boolean;
    viewId: ViewId;
    reason?: string;
  }> {
    return deriveArchitectureDiagramView(
      this.loader,
      this.outputManager,
      this.runtimeIO,
      this.llmClient,
    );
  }

  public buildPublicSurfaceView(units: LoadedUnit[]): ViewArtifactEnvelope<PublicSurfaceViewItem> {
    return buildPublicSurfaceView(units);
  }

  public buildRiskHotspotsView(units: LoadedUnit[]): ViewArtifactEnvelope<RiskHotspotViewItem> {
    return buildRiskHotspotsView(units);
  }
}
