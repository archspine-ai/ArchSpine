import * as fs from 'fs';
import * as path from 'path';
import { SpineTask, TaskContext } from '../core/task.js';
import type { CommitStageOutput } from '../core/task-types.js';
import { SpineUnit } from '../types/protocol.js';
import {
  isCompatibleIndexDocument,
  readIndexDocument,
  reportIndexReadIssueOnce,
} from '../infra/index-reader.js';

/**
 * Files in src/infra/mcp/ that are dynamically loaded by the MCP runtime
 * framework rather than via static import from another indexed file.
 * The AST extractor does not catch these edges, so they get zero
 * dependedBy entries, understating their risk profile.
 *
 * We inject a synthetic consumer to surface them in dependency views.
 */
const MCP_FRAMEWORK_FILES: readonly string[] = [
  'src/infra/mcp/tools.ts',
  'src/infra/mcp/resources.ts',
  'src/infra/mcp/context.ts',
  'src/infra/mcp/server.ts',
];

/** Virtual path used as the synthetic consumer for framework-loaded files. */
const SYNTHETIC_FRAMEWORK_CONSUMER = '__runtime__/mcp';

export class ReverseIndexingTask extends SpineTask<CommitStageOutput, void> {
  name = 'Reverse Dependency Indexing';
  checkpointId = 'reverse-index';

  async execute(ctx: TaskContext, input: CommitStageOutput): Promise<void> {
    if (input.committedCount === 0 && ctx.manifest.isReverseIndexComplete()) {
      return;
    }

    // Rebuild dependedBy edges from the current forward dependency graph.
    const files = ctx.scanner.getAllTrackedFiles();
    const indexCache = new Map<
      string,
      {
        identity: SpineUnit['identity'];
        graph: SpineUnit['graph'];
      }
    >();
    const reverseEdges = new Map<string, string[]>();

    for (const file of files) {
      try {
        const indexPath = path.join(ctx.rootDir, '.spine', 'index', `${file}.json`);
        if (!fs.existsSync(indexPath)) {
          continue;
        }

        const readResult = readIndexDocument<SpineUnit>(ctx.rootDir, indexPath);
        if (!isCompatibleIndexDocument(readResult)) {
          if (readResult.status !== 'missing') {
            reportIndexReadIssueOnce((message) => ctx.runtimeIO.warn(message), readResult);
          }
          continue;
        }
        const unit = readResult.data;
        indexCache.set(file, {
          identity: unit.identity,
          graph: unit.graph,
        });

        const dependsOn = unit.graph?.dependsOn || [];
        for (const edge of dependsOn) {
          if (!reverseEdges.has(edge.targetPath)) {
            reverseEdges.set(edge.targetPath, []);
          }
          reverseEdges.get(edge.targetPath)!.push(file);
        }
      } catch (e) {
        ctx.runtimeIO.warn(
          `[Task: ReverseDependencyIndex] Failed to process index for ${file}:`,
          e,
        );
      }
    }

    // Inject synthetic consumer edges for dynamically-loaded framework files.
    // MCP tools/resources/context/server are loaded by the MCP runtime framework
    // rather than via static imports from indexed files. Without this, they
    // appear to have zero consumers, understating their risk in views and queries.
    for (const mcpFile of MCP_FRAMEWORK_FILES) {
      if (indexCache.has(mcpFile) && !reverseEdges.has(mcpFile)) {
        reverseEdges.set(mcpFile, [SYNTHETIC_FRAMEWORK_CONSUMER]);
      }
    }

    for (const [targetPath, dependentFiles] of reverseEdges.entries()) {
      const cachedTarget = indexCache.get(targetPath);
      if (cachedTarget) {
        // Reload full unit from disk to avoid overwriting and dropping fields
        const indexPath = path.join(ctx.rootDir, '.spine', 'index', `${targetPath}.json`);
        if (!fs.existsSync(indexPath)) {
          continue;
        }
        const readResult = readIndexDocument<SpineUnit>(ctx.rootDir, indexPath);
        if (!isCompatibleIndexDocument(readResult)) {
          if (readResult.status !== 'missing') {
            reportIndexReadIssueOnce((message) => ctx.runtimeIO.warn(message), readResult);
          }
          continue;
        }
        const targetUnit = readResult.data;

        const updatedGraph = {
          ...targetUnit.graph,
          dependedBy: dependentFiles.map((dep) => ({
            targetPath: dep,
            relation: 'import' as const,
            edgeProvenance: dep.startsWith('__') ? ('inferred' as const) : ('ast' as const),
            symbols: [],
          })),
          reverseIndexComplete: true,
        };

        const updatedUnit = { ...targetUnit, graph: updatedGraph };
        ctx.outputManager.saveIndex(targetPath, updatedUnit);

        // Sync the newly calculated graph edges back to cache.db.
        ctx.manifest.updateFileStatusWithDocs(
          targetPath,
          updatedUnit.identity.contentHash,
          updatedUnit.identity.fileKind,
          updatedUnit,
          ['English'],
        );
      }
    }

    ctx.manifest.setReverseIndexComplete(true);
  }
}
