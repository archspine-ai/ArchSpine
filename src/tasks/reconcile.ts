import * as fs from 'fs';
import * as path from 'path';
import { SpineTask, TaskContext } from '../core/task.js';
import { SpineUnit } from '../types/protocol.js';
import { LangRegistry } from '../ast/lang-registry.js';
import {
  isCompatibleIndexDocument,
  readIndexDocument,
  reportIndexReadIssueOnce,
} from '../infra/index-reader.js';

export class ReconcileTask extends SpineTask<void> {
  name = 'Reconcile State & Cache';

  async execute(ctx: TaskContext, _input: void): Promise<void> {
    const snapshot = ctx.manifest.loadLanguageSnapshot();
    const availableExtensions = snapshot
      ? snapshot.detectedExtensions.filter((ext) => {
          const lang = Object.values(snapshot.languages).find((l) => l.extensions.includes(ext));
          return lang?.status === 'available';
        })
      : LangRegistry.getTrackedExtensions();

    const files = ctx.scanner.getAllTrackedFiles();
    const filteredFiles = ctx.scanner.filterFiles(files, LangRegistry.getTrackedExtensions());

    let reconciledCount = 0;

    for (const file of filteredFiles) {
      const filePath = path.join(ctx.rootDir, file);
      const indexPath = path.join(ctx.rootDir, '.spine', 'index', `${file}.json`);

      if (!fs.existsSync(indexPath)) {
        continue;
      }

      // New: Check if the language is still available for this record
      const extension = path.extname(file).toLowerCase();
      if (!availableExtensions.includes(extension) && !['.md', '.json'].includes(extension)) {
        // Language package was removed since last sync!
        // We don't restore to manifest, leaving it for cleanup if it's currently considered tracked.
        continue;
      }

      // Guard: source file may have been deleted since the last sync.
      // Skip here — ScanAndCleanupTask will handle orphan removal.
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const currentHash = ctx.manifest.calculateHash(filePath);
      const needsUpdate = ctx.manifest.needsUpdate(file, currentHash);

      if (needsUpdate) {
        try {
          const readResult = readIndexDocument<SpineUnit>(ctx.rootDir, indexPath);
          if (!isCompatibleIndexDocument(readResult)) {
            if (readResult.status !== 'missing') {
              reportIndexReadIssueOnce((message) => ctx.runtimeIO.warn(message), readResult);
            }
            continue;
          }
          const unit = readResult.data;
          if (unit.identity && unit.identity.contentHash === currentHash) {
            // DB is out of sync with JSON, but JSON is up to date with the actual file!
            // Restore to DB to avoid unnecessary LLM call.
            ctx.manifest.updateFileStatusWithDocs(
              file,
              currentHash,
              unit.identity.fileKind || 'source',
              unit,
              ctx.targetLocales,
            );

            // Also restore exports
            if (unit.skeleton && unit.skeleton.exports) {
              ctx.manifest.clearFileExports(file);
              ctx.manifest.registerExports(
                file,
                unit.skeleton.exports.map((e: { name: string }) => e.name),
              );
            }
            reconciledCount++;
          }
        } catch (e) {
          ctx.runtimeIO.warn(
            `[Task: Reconcile] Skipping corrupted index file for ${file}. Will re-sync.`,
          );
        }
      }
    }

    if (reconciledCount > 0) {
      ctx.runtimeIO.info(
        `[Task: Reconcile] Restored ${reconciledCount} cached entries from index files.`,
      );
    }
  }
}
