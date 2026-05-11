import * as path from 'path';
import * as fs from 'fs';
import { SpineTask, TaskContext } from '../core/task.js';
import type { ScanStageInput, ScanStageOutput } from '../core/task-types.js';
import { LangRegistry } from '../ast/lang-registry.js';

export class ScanAndCleanupTask extends SpineTask<ScanStageInput, ScanStageOutput> {
  name = 'Scan & Cleanup Orphan Files';
  checkpointId = 'scan-cleanup';

  async execute(ctx: TaskContext, input: ScanStageInput): Promise<ScanStageOutput> {
    const snapshot = ctx.manifest.loadLanguageSnapshot();
    const trackedExtensions = snapshot
      ? snapshot.detectedExtensions
      : LangRegistry.getTrackedExtensions();

    let files: string[];
    if (input.candidateFiles && input.candidateFiles.length > 0) {
      files = input.candidateFiles;
    } else if (ctx.isFullSync) {
      files = ctx.scanner.getAllTrackedFiles();
    } else {
      // Hybrid Discovery: Start with Git-suggested changes
      const gitChanged = ctx.scanner.getChangedFiles();
      // But also include any tracked file that is missing from index or has hash mismatch
      const allTracked = ctx.scanner.getAllTrackedFiles();
      const needsSync = allTracked.filter((f) => {
        const filePath = path.join(ctx.rootDir, f);
        if (!fs.existsSync(filePath)) {
          return false;
        }
        const hash = ctx.manifest.calculateHash(filePath);
        return ctx.manifest.needsUpdate(f, hash);
      });
      files = [...new Set([...gitChanged, ...needsSync])];

      // `check` should still be able to audit a clean, fully-synced workspace.
      // If there is no incremental surface at all, fall back to the tracked files.
      if (files.length === 0) {
        files = allTracked;
      }
    }

    const filtered = ctx.scanner.filterFiles(files, trackedExtensions);
    const missingFilteredFiles = filtered.filter((f) => !fs.existsSync(path.join(ctx.rootDir, f)));
    const filteredFiles = filtered.filter((f) => fs.existsSync(path.join(ctx.rootDir, f)));
    const affectedDirs = new Set<string>();

    const trackedFilesSet = new Set(ctx.scanner.getAllTrackedFiles());
    const manifestFiles = ctx.manifest.getTrackedFiles();

    for (const manifestFile of manifestFiles) {
      if (!trackedFilesSet.has(manifestFile) || missingFilteredFiles.includes(manifestFile)) {
        ctx.runtimeIO.info(`[Task: Scan] Removing orphan file from index: ${manifestFile}`);
        ctx.manifest.removeFileState(manifestFile);
        ctx.outputManager.deleteFile(manifestFile);
        affectedDirs.add(path.dirname(manifestFile));
      }
    }

    const result = {
      selection: {
        filteredFiles,
        affectedDirs,
      },
    };
    ctx.executionCheckpoint?.updateStageData(this.checkpointId, {
      filteredFiles,
      affectedDirs: Array.from(affectedDirs).sort(),
    });
    return result;
  }
}
