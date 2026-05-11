import { Config } from '../../infra/config.js';
import { ArchSpineError, ErrorCodes } from '../../core/errors.js';
import {
  applyRepositoryStrategy,
  checkRepositoryStrategy,
} from '../../services/repository-admin-service.js';
import type { ArtifactStrategy } from '../init/types.js';

export function parseArtifactStrategy(value: string | undefined): ArtifactStrategy | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'local' || normalized === 'distributable') {
    return normalized;
  }
  return undefined;
}

export function runRepoCheck(repoRoot: string, cfg: Config): void {
  const result = checkRepositoryStrategy(repoRoot, cfg);
  if (!result.strategy) {
    console.log('[Repo Check] No artifact strategy configured. Run "spine init" to set one.');
    return;
  }

  console.log(`[Repo Check] Declared artifact strategy: ${result.strategy}`);
  if (result.issues.length === 0) {
    console.log(
      '[Repo Check] ✅ No drift detected. Managed Git files are consistent with the declared strategy.',
    );
    return;
  }

  console.warn('[Repo Check] ⚠️  Drift detected between declared strategy and managed Git files:');
  for (const issue of result.issues) {
    console.warn(`  - ${issue}`);
  }
  console.warn('');
  console.warn('[Repo Check] Run "spine repo strategy set <mode>" to realign managed blocks.');
  throw new ArchSpineError(
    ErrorCodes.CliCommandFailed,
    '[Repo Check] Repository Git file drift detected.',
    { exitCode: 1, context: { strategy: result.strategy, issueCount: result.issues.length } },
  );
}

export function runRepoStrategySet(
  rootDir: string,
  config: Config,
  nextStrategy: ArtifactStrategy,
  printStep: (message: string, options?: { inline?: boolean }) => void,
): void {
  if (!config.hasPersistedConfig()) {
    throw new ArchSpineError(
      ErrorCodes.CliCommandFailed,
      '[Repo Strategy] No persisted ArchSpine config found. Run "spine init" before setting repository strategy.',
      { exitCode: 1, context: { requiredCommand: 'spine init' } },
    );
  }

  const previousStrategy = config.getArtifactStrategy() || config.getInitArtifactStrategy();
  console.log(`[Repo Strategy] Target strategy: ${nextStrategy}`);
  if (previousStrategy) {
    console.log(`[Repo Strategy] Previous strategy: ${previousStrategy}`);
  } else {
    console.log('[Repo Strategy] Previous strategy: unset');
  }

  const result = applyRepositoryStrategy(rootDir, config, nextStrategy);

  if (result.gitIgnoreStatus === 'created') {
    printStep('Created .gitignore with ArchSpine managed Git rules.', { inline: true });
  } else if (result.gitIgnoreStatus === 'updated') {
    printStep('Updated ArchSpine-managed entries in .gitignore.', { inline: true });
  } else if (result.gitIgnoreStatus === 'appended') {
    printStep('Appended ArchSpine-managed block to .gitignore.', { inline: true });
  } else {
    printStep('ArchSpine-managed .gitignore block already matched the selected strategy.', {
      inline: true,
    });
  }

  if (nextStrategy === 'distributable') {
    if (result.gitAttributesStatus === 'created') {
      printStep('Created .gitattributes with generated snapshot markers.', { inline: true });
    } else if (result.gitAttributesStatus === 'updated') {
      printStep('Updated ArchSpine-managed entries in .gitattributes.', { inline: true });
    } else if (result.gitAttributesStatus === 'appended') {
      printStep('Appended ArchSpine-managed block to .gitattributes.', { inline: true });
    } else {
      printStep('ArchSpine-managed .gitattributes block already matched distributable strategy.', {
        inline: true,
      });
    }

    if (!result.snapshotOutputsPresent) {
      console.warn('[Repo Strategy] Snapshot outputs are not present yet.');
      console.warn(
        '[Repo Strategy] Run "spine build" to create the baseline or "spine sync" to refresh distributable artifacts.',
      );
    } else if (!result.sameStrategy) {
      console.warn(
        '[Repo Strategy] Snapshot outputs may now appear in "git status" because they are no longer managed as ignored artifacts.',
      );
    }
  } else {
    if (result.gitAttributesRemovalStatus === 'deleted') {
      printStep('Removed ArchSpine-managed .gitattributes state for local-first strategy.', {
        inline: true,
      });
    } else if (result.gitAttributesRemovalStatus === 'updated') {
      printStep('Removed ArchSpine-managed .gitattributes block for local-first strategy.', {
        inline: true,
      });
    } else {
      printStep('No ArchSpine-managed .gitattributes block remained to remove.', { inline: true });
    }

    if (result.trackedSnapshotFiles.length > 0) {
      console.warn('[Repo Strategy] Tracked snapshot files are still present in Git.');
      console.warn(
        '[Repo Strategy] Switching to local changes ignore rules, but it does not untrack existing files.',
      );
      console.warn(`[Repo Strategy] Example tracked path: ${result.trackedSnapshotFiles[0]}`);
      console.warn(
        '[Repo Strategy] Decide explicitly whether to keep them, untrack them, or clean them up separately.',
      );
    }
  }

  if (result.sameStrategy) {
    console.log(
      `[Repo Strategy] ${nextStrategy} was already declared. Managed files were reconciled to the current strategy.`,
    );
  } else {
    console.log(
      `[Repo Strategy] Strategy migration completed: ${previousStrategy || 'unset'} -> ${nextStrategy}.`,
    );
  }
}
