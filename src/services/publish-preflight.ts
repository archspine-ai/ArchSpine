import * as fs from 'fs';
import * as path from 'path';
import { ArchSpineError, ErrorCodes } from '../core/errors.js';
import { Config } from '../infra/config.js';
import { defaultRuntimeIO, RuntimeIO } from '../infra/runtime-io.js';
import { parseLockPayload } from '../utils/lock.js';

function exists(targetPath: string): boolean {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

export function assertPublishRuntimeBaseline(rootDir: string): void {
  const spineDir = path.join(rootDir, '.spine');
  if (!exists(spineDir)) {
    throw new ArchSpineError(
      ErrorCodes.PublishRuntimeMissing,
      "[Publish] .spine runtime layer is missing. Run 'spine init' and 'spine build' before publishing.",
      { context: { missing: spineDir } },
    );
  }

  const manifestPath = path.join(spineDir, 'manifest.json');
  const baselinePath = path.join(spineDir, 'protected-output-baseline.json');
  const lockPath = path.join(spineDir, '.lock');

  if (exists(lockPath)) {
    let ownerPid: number | null = null;
    let ownerToken: string | null = null;
    let ownerKnown = false;
    try {
      const raw = fs.readFileSync(lockPath, 'utf-8');
      const parsed = parseLockPayload(raw);
      ownerPid = parsed.pid;
      ownerToken = parsed.token;
      ownerKnown = true;
    } catch (error) {
      throw new ArchSpineError(
        ErrorCodes.PublishLockActive,
        '[Publish] Runtime lock file is invalid or uses an unsupported format (.spine/.lock). Confirm no ArchSpine process is still running, then remove the lock and rebuild runtime state if needed.',
        {
          cause: error,
          context: {
            lockPath,
            ownerPid: null,
            ownerToken: null,
            ownerKnown: false,
            ownerVerifiable: null,
            lockValid: false,
          },
        },
      );
    }

    if (ownerKnown && ownerPid !== null) {
      try {
        process.kill(ownerPid, 0);
      } catch (error: unknown) {
        const sysErr = error as { code?: string };
        if (sysErr.code === 'ESRCH') {
          throw new ArchSpineError(
            ErrorCodes.PublishLockActive,
            "[Publish] Found a stale runtime lock (.spine/.lock). Run 'spine build' to rebuild runtime state before publishing.",
            {
              context: {
                lockPath,
                ownerPid,
                ownerToken,
                stale: true,
                expectedCommand: 'spine build',
                lockValid: true,
              },
            },
          );
        }
        if (sysErr.code === 'EPERM') {
          throw new ArchSpineError(
            ErrorCodes.PublishLockActive,
            '[Publish] Runtime lock owner could not be verified (.spine/.lock). Publish fails closed when lock ownership is unverifiable; clear the lock only after confirming no ArchSpine process is still running.',
            {
              context: {
                lockPath,
                ownerPid,
                ownerToken,
                ownerKnown: true,
                ownerVerifiable: false,
                lockValid: true,
              },
            },
          );
        }
      }
    }

    throw new ArchSpineError(
      ErrorCodes.PublishLockActive,
      '[Publish] Runtime lock detected (.spine/.lock). Finish ongoing local sync/check/fix or clear stale lock before publishing.',
      {
        context: {
          lockPath,
          ownerPid: ownerKnown ? ownerPid : null,
          ownerToken: ownerKnown ? ownerToken : null,
          ownerKnown,
          ownerVerifiable: ownerKnown ? true : null,
          lockValid: ownerKnown,
        },
      },
    );
  }

  if (!exists(manifestPath) || !exists(baselinePath)) {
    throw new ArchSpineError(
      ErrorCodes.PublishRuntimeBaselineIncomplete,
      "[Publish] Runtime baseline is incomplete (.spine/manifest.json or protected-output-baseline.json missing). Run 'spine build' first.",
      {
        context: {
          manifestExists: exists(manifestPath),
          baselineExists: exists(baselinePath),
          expectedCommand: 'spine build',
        },
      },
    );
  }
}

export function assertPublishSnapshotReady(rootDir: string): void {
  const spineDir = path.join(rootDir, '.spine');
  const indexDir = path.join(spineDir, 'index');
  const atlasDir = path.join(spineDir, 'atlas');
  const projectIndex = path.join(indexDir, 'project.json');

  if (!exists(indexDir) || !exists(atlasDir) || !exists(projectIndex)) {
    throw new ArchSpineError(
      ErrorCodes.PublishSnapshotIncomplete,
      "[Publish] Distributable snapshot is incomplete (.spine/index/** or .spine/atlas/** missing). Re-run 'spine build' and then 'spine publish'.",
      {
        context: {
          indexExists: exists(indexDir),
          atlasExists: exists(atlasDir),
          projectIndexExists: exists(projectIndex),
        },
      },
    );
  }
}

/**
 * Emits a warning when `spine publish` is run while the artifact strategy is `local`.
 *
 * In `local` mode, snapshot artifacts (.spine/index/**, .spine/atlas/**) are excluded from Git
 * by the managed .gitignore block. Publishing them into a commit is semantically inconsistent
 * with that declared intent. This function does NOT abort — it warns and provides a clear
 * upgrade path, leaving the final decision to the maintainer.
 */
export function warnIfPublishingFromLocalStrategy(
  rootDir: string,
  runtimeIO: RuntimeIO = defaultRuntimeIO,
): void {
  const config = new Config(rootDir);
  const strategy = config.getArtifactStrategy() || config.getInitArtifactStrategy();

  if (strategy !== 'local') {
    // distributable or unset: no warning needed.
    return;
  }

  runtimeIO.warn('');
  runtimeIO.warn('⚠️  [Publish] Strategy mismatch detected.');
  runtimeIO.warn(
    "   Your repository artifact strategy is set to 'local' (config: artifacts.strategy = local).",
  );
  runtimeIO.warn(
    '   In local mode, .spine/index/**, .spine/atlas/**, and related snapshot artifacts are',
  );
  runtimeIO.warn('   excluded from Git by the ArchSpine-managed .gitignore block.');
  runtimeIO.warn('');
  runtimeIO.warn("   Running 'spine publish' in local mode will refresh the local snapshot,");
  runtimeIO.warn(
    '   but committing those outputs to Git would conflict with your declared strategy.',
  );
  runtimeIO.warn('');
  runtimeIO.warn('   To share snapshots with your team:');
  runtimeIO.warn('     spine init --artifact-strategy distributable');
  runtimeIO.warn(
    '   This migrates your managed .gitignore and .gitattributes blocks to the distributable preset.',
  );
  runtimeIO.warn('');
}
