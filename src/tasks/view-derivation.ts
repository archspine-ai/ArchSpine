import { SpineTask, TaskContext } from '../core/task.js';
import type { CommitStageOutput, ViewDerivationStageOutput } from '../core/task-types.js';
import { VIEW_DEFINITIONS } from '../services/view/index.js';
import { ViewService } from '../services/view-service.js';

export class ViewDerivationTask extends SpineTask<CommitStageOutput, ViewDerivationStageOutput> {
  name = 'View Derivation';
  checkpointId = 'view-derivation';

  async execute(ctx: TaskContext, input: CommitStageOutput): Promise<ViewDerivationStageOutput> {
    const service = new ViewService(ctx.rootDir, ctx.outputManager, ctx.runtimeIO, ctx.llmClient);
    const disabledViews = VIEW_DEFINITIONS.map((definition) => definition.id).filter(
      (viewId) => !ctx.enabledViews.includes(viewId),
    );
    service.clearViewArtifacts(disabledViews);

    if (!ctx.isFullSync && input.committedCount === 0 && input.selection.affectedDirs.size === 0) {
      return {
        publicSurfaceCount: 0,
        riskHotspotCount: 0,
        archDiagramGenerated: false,
        generatedViews: [],
        skippedViews: [],
      };
    }

    const generatedViews: ViewDerivationStageOutput['generatedViews'] = [];
    const skippedViews: ViewDerivationStageOutput['skippedViews'] = [];
    let publicSurfaceCount = 0;
    let riskHotspotCount = 0;
    let archDiagramGenerated = false;

    for (const invalidViewId of ctx.invalidEnabledViews) {
      ctx.runtimeIO.warn(`[View] Ignoring unknown enabled view id "${invalidViewId}".`);
    }

    for (const viewId of ctx.enabledViews) {
      switch (viewId) {
        case 'public-surface': {
          const result = service.derivePublicSurfaceView();
          publicSurfaceCount = result.itemCount;
          if (result.generated) {
            generatedViews.push(viewId);
          }
          break;
        }
        case 'risk-hotspots': {
          const result = service.deriveRiskHotspotsView();
          riskHotspotCount = result.itemCount;
          if (result.generated) {
            generatedViews.push(viewId);
          }
          break;
        }
        case 'architecture-diagram': {
          if (!ctx.isFullSync) {
            skippedViews.push({
              viewId,
              reason: 'Requires full build.',
            });
            break;
          }
          const result = await service.deriveArchitectureDiagramView();
          archDiagramGenerated = result.generated;
          if (result.generated) {
            generatedViews.push(viewId);
          } else {
            skippedViews.push({
              viewId,
              reason: result.reason || 'Skipped by generator.',
            });
          }
          break;
        }
        default:
          skippedViews.push({
            viewId,
            reason: `Unsupported view id "${viewId}".`,
          });
      }
    }

    return {
      publicSurfaceCount,
      riskHotspotCount,
      archDiagramGenerated,
      generatedViews,
      skippedViews,
    };
  }
}
