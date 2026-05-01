import { RuntimeService } from '../../services/runtime-service.js';
import {
  assertPublishRuntimeBaseline,
  assertPublishSnapshotReady,
  warnIfPublishingFromLocalStrategy,
} from '../../services/publish-preflight.js';
import { runSyncWorkflow } from './sync.js';
import { Config } from '../../infra/config.js';
import { throwCliUsage } from '../cli-utils.js';
import { defaultRuntimeIO } from '../../infra/runtime-io.js';
import { DocumentBackfillTask } from '../../tasks/document-backfill.js';
import { Manifest } from '../../infra/manifest.js';

export interface ExecutePublishCommandOptions {
  args: string[];
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
  displayUIBanner: (cmd?: string, argsArr?: string[]) => void;
}

export async function executePublishCommand(options: ExecutePublishCommandOptions): Promise<void> {
  const { args, rootDir, config, runtimeService, displayUIBanner } = options;
  displayUIBanner('publish', args);

  if (args.length > 0) {
    throwCliUsage('Usage: spine publish');
  }

  await runPublishWorkflow({ rootDir, config, runtimeService });
}

export async function runPublishWorkflow(options: {
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
}): Promise<void> {
  const { rootDir, config, runtimeService } = options;
  const runtimeIO = defaultRuntimeIO;

  warnIfPublishingFromLocalStrategy(rootDir, runtimeIO);
  assertPublishRuntimeBaseline(rootDir);
  runtimeIO.info('Preparing canonical distributable .spine snapshot...');
  runtimeIO.info(
    '[Publish] Preflight passed: runtime baseline is present and no active runtime lock is blocking publish.',
  );
  runtimeIO.info('[Publish] Running lightweight sync to refresh JSON indexes.');

  await runSyncWorkflow({
    rootDir,
    config,
    runtimeService,
    full: false,
    hookMode: false,
    repairViolations: false,
    origin: 'user',
    surface: 'publish',
  });

  const { llmClient } = runtimeService.getResolvedLLMClient();
  const backfillTask = new DocumentBackfillTask(rootDir, llmClient, config.getLanguages());
  const backfill = await backfillTask.run();
  if (typeof llmClient?.generateText === 'function') {
    runtimeIO.info(
      `[Publish] Document backfill completed. Generated=${backfill.generated}, Skipped=${backfill.skipped}, ` +
        `Tokens=${backfill.usage.totalTokens}.`,
    );
  } else {
    runtimeIO.info(
      '[Publish] Markdown backfill skipped: no text-generation capability is configured for the current LLM runtime.',
    );
  }
  Manifest.open(rootDir).clearAtlasStale();

  assertPublishSnapshotReady(rootDir);
  runtimeIO.info('\n[Publish] Snapshot refresh completed.');
  runtimeIO.info(
    '[Publish] "spine sync" and "spine publish" are intentionally different boundaries:',
  );
  runtimeIO.info('[Publish]   - spine sync    => local runtime refresh');
  runtimeIO.info('[Publish]   - spine publish => repository distribution snapshot refresh');
  runtimeIO.info(
    '[Publish] "spine publish" refreshes the repository distribution snapshot (.spine/index/**, .spine/atlas/**, and enabled .spine/view/** outputs).',
  );
  runtimeIO.info(
    '[Publish] `.spine/.lock` remains local runtime mutual exclusion only and is not part of Git publish semantics.',
  );
  runtimeIO.info(
    '[Publish] Next step (maintainer flow): review and commit distributable snapshot updates if they are expected.',
  );
}
