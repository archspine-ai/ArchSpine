import { SpineTask, TaskContext } from '../core/task.js';
import type { CommitStageOutput } from '../core/task-types.js';
import { TaskRunner } from '../core/pipeline.js';
import { AggregationTask } from './aggregate.js';
import { ReverseIndexingTask } from './reverse-index.js';
import { ViewDerivationTask } from './view-derivation.js';
import { ViewService } from '../services/view-service.js';
import { VIEW_DEFINITIONS } from '../services/view/view-registry.js';

export class PostCommitDerivationTask extends SpineTask<CommitStageOutput, void> {
  name = 'Post-Commit Derivation';
  checkpointId = 'post-commit-derivation';

  constructor(private readonly experimentalViewLayer: boolean) {
    super();
  }

  async execute(ctx: TaskContext, input: CommitStageOutput): Promise<void> {
    const runner = new TaskRunner(ctx);
    await runner.run(new ReverseIndexingTask(), input);

    if (ctx.hookMode) {
      return;
    }

    await runner.run(new AggregationTask(), input);

    if (this.experimentalViewLayer) {
      await runner.run(new ViewDerivationTask(), input);
      return;
    }

    const viewService = new ViewService(
      ctx.rootDir,
      ctx.outputManager,
      ctx.runtimeIO,
      ctx.llmClient,
    );
    viewService.clearViewArtifacts(VIEW_DEFINITIONS.map((definition) => definition.id));
  }
}
