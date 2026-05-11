import { OutputManager } from '../../infra/output.js';
import { ViewRenderer } from './view-renderer.js';
import type {
  IPublicSurfaceViewItem,
  IRiskHotspotViewItem,
  IViewArtifactEnvelope,
} from '../../types/view.js';
import type { RuntimeIO } from '../../infra/runtime-io.js';

import type { LLMClient } from '../../infra/llm.js';
import type { ViewId } from '../../types/view.js';
import { getViewDefinition } from './view-registry.js';
import { getViewProducer } from './producer-registry.js';
import { ViewIndexLoader } from './index-loader.js';
import { buildPublicSurfaceView } from './public-surface-view.js';
import { buildRiskHotspotsView } from './risk-hotspots-view.js';
import type { LoadedUnit } from './types.js';
import type { ViewContext } from './producer.js';
import { withProtectedOutputsWriteAccess } from '../../infra/writer-boundary.js';
import { writeProtectedOutputBaseline } from '../../infra/spine-gate.js';

export class ViewService {
  private readonly loader: ViewIndexLoader;
  private readonly rootDir: string;

  constructor(
    rootDir: string,
    private readonly outputManager: Pick<
      OutputManager,
      'saveView' | 'saveViewMarkdown' | 'saveViewHtml' | 'deleteViewArtifacts'
    >,
    private readonly runtimeIO?: RuntimeIO,
    private readonly llmClient?: LLMClient,
  ) {
    this.rootDir = rootDir;
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
    const producer = getViewProducer('architecture-diagram');
    if (!producer) {
      return {
        generated: false,
        viewId: 'architecture-diagram',
        reason: 'Producer not registered.',
      };
    }

    const artifact = await producer.derive(this.buildViewContext());
    return {
      generated: artifact.generated,
      viewId: 'architecture-diagram',
      reason: artifact.reason,
    };
  }

  public async deriveProjectHealthView(): Promise<{
    generated: boolean;
    viewId: ViewId;
    reason?: string;
  }> {
    const producer = getViewProducer('project-health');
    if (!producer) {
      return {
        generated: false,
        viewId: 'project-health',
        reason: 'Producer not registered.',
      };
    }

    const artifact = await producer.derive(this.buildViewContext());
    return {
      generated: artifact.generated,
      viewId: 'project-health',
      reason: artifact.reason,
    };
  }

  public buildPublicSurfaceView(
    units: LoadedUnit[],
  ): IViewArtifactEnvelope<IPublicSurfaceViewItem> {
    return buildPublicSurfaceView(units);
  }

  public buildRiskHotspotsView(units: LoadedUnit[]): IViewArtifactEnvelope<IRiskHotspotViewItem> {
    return buildRiskHotspotsView(units, this.rootDir);
  }

  /**
   * Get number of indexed units available for view generation.
   */
  public getIndexedUnitCount(): number {
    return this.loader.getIndexedUnits().length;
  }

  /**
   * Derive the given set of enabled views, wrapping file writes in protected output access.
   */
  public async deriveViews(
    enabledViewIds: ViewId[],
  ): Promise<{ generated: string[]; failed: string[] }> {
    const generated: string[] = [];
    const failed: string[] = [];

    await withProtectedOutputsWriteAccess(this.rootDir, async () => {
      for (const viewId of enabledViewIds) {
        try {
          switch (viewId) {
            case 'public-surface': {
              this.derivePublicSurfaceView();
              break;
            }
            case 'risk-hotspots': {
              this.deriveRiskHotspotsView();
              break;
            }
            case 'architecture-diagram': {
              const result = await this.deriveArchitectureDiagramView();
              if (!result.generated) {
                this.runtimeIO?.warn(
                  `[View] architecture-diagram skipped: ${result.reason || 'Unknown reason.'}`,
                );
              }
              break;
            }
            case 'project-health': {
              const result = await this.deriveProjectHealthView();
              if (!result.generated) {
                this.runtimeIO?.warn(
                  `[View] project-health skipped: ${result.reason || 'Unknown reason.'}`,
                );
              }
              break;
            }
            default:
              this.runtimeIO?.warn(`[View] Unsupported view id "${viewId}".`);
              continue;
          }
          generated.push(viewId);
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          this.runtimeIO?.error(`❌ Failed to generate view "${viewId}": ${message}`);
          failed.push(viewId);
        }
      }

      writeProtectedOutputBaseline(this.rootDir);
    });

    return { generated, failed };
  }

  private buildViewContext(): ViewContext {
    return {
      rootDir: this.rootDir,
      loader: this.loader,
      outputManager: this.outputManager,
      runtimeIO: this.runtimeIO,
      llmClient: this.llmClient,
      isFullSync: true,
    };
  }
}
