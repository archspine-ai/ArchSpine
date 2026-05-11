import * as fs from 'fs';
import * as path from 'path';
import { SpineTask, TaskContext } from '../core/task.js';
import type { CommitStageOutput } from '../core/task-types.js';
import { buildGraph, getModuleId, KnowledgeGraph } from '../engines/dependency-graph.js';
import {
  detectCycles,
  detectDeadCode,
  detectHubs,
  CycleReport,
  DeadCodeReport,
  HubReport,
} from '../engines/graph-diagnostics.js';
import {
  isCompatibleIndexDocument,
  readIndexDocument,
  reportIndexReadIssueOnce,
} from '../infra/index-reader.js';
import { SpineUnit } from '../types/protocol.js';
import type { HealthFlags } from '../types/protocol/index-documents.js';

export class KnowledgeGraphTask extends SpineTask<CommitStageOutput, void> {
  name = 'Knowledge Graph Construction';
  checkpointId = 'knowledge-graph';

  async execute(ctx: TaskContext, _input: CommitStageOutput): Promise<void> {
    if (ctx.hookMode) {
      return;
    }

    const indexDir = path.join(ctx.rootDir, '.spine', 'index');

    const graph = buildGraph(indexDir, [], ctx.rootDir);

    const cycles = detectCycles(graph);
    const deadCode = detectDeadCode(graph);
    const hubs = detectHubs(graph);

    ctx.outputManager.saveView('knowledge-graph.json', graph);

    ctx.outputManager.saveView('diagnostics/cycles.json', cycles);
    ctx.outputManager.saveView('diagnostics/dead-code.json', deadCode);
    ctx.outputManager.saveView('diagnostics/hubs.json', hubs);

    this.writeHealthFlags(ctx, graph, cycles, deadCode, hubs);
  }

  private writeHealthFlags(
    ctx: TaskContext,
    graph: KnowledgeGraph,
    cycles: CycleReport[],
    deadCode: DeadCodeReport[],
    hubs: HubReport[],
  ): void {
    const cycleByModule = new Map<string, CycleReport[]>();
    for (const cycle of cycles) {
      for (const nodeId of cycle.nodes) {
        const list = cycleByModule.get(nodeId);
        if (list) {
          list.push(cycle);
        } else {
          cycleByModule.set(nodeId, [cycle]);
        }
      }
    }

    const deadCodeSet = new Set(deadCode.map((d) => d.moduleId));

    const hubByModule = new Map<string, HubReport>();
    for (const hub of hubs) {
      hubByModule.set(hub.moduleId, hub);
    }

    const nodeByModule = new Map<string, { fanIn: number }>();
    for (const node of graph.nodes) {
      nodeByModule.set(node.id, { fanIn: node.fanIn });
    }

    const files = ctx.scanner.getAllTrackedFiles();

    for (const file of files) {
      try {
        const indexPath = path.join(ctx.rootDir, '.spine', 'index', `${file}.json`);
        if (!fs.existsSync(indexPath)) {
          continue;
        }

        const moduleId = getModuleId(file, ctx.rootDir);

        const nodeCycles = cycleByModule.get(moduleId);
        const inCycle = nodeCycles !== undefined && nodeCycles.length > 0;
        const cycleId = inCycle ? nodeCycles![0].cycleId : undefined;
        const isDead = deadCodeSet.has(moduleId);
        const hub = hubByModule.get(moduleId);
        const nodeMeta = nodeByModule.get(moduleId);
        const fanIn = nodeMeta?.fanIn ?? 0;

        const flags: HealthFlags = {
          fanIn,
          isHub: hub !== undefined,
          hubPercentile: hub?.percentile ?? 0,
          inCycle,
          ...(cycleId ? { cycleId } : {}),
          isDeadCodeSuspect: isDead,
        };

        const readResult = readIndexDocument<SpineUnit>(ctx.rootDir, indexPath);
        if (!isCompatibleIndexDocument(readResult)) {
          if (readResult.status !== 'missing') {
            reportIndexReadIssueOnce((message) => ctx.runtimeIO.warn(message), readResult);
          }
          continue;
        }

        const unit = readResult.data;
        const updatedUnit = { ...unit, healthFlags: flags };

        ctx.outputManager.saveIndex(file, updatedUnit as SpineUnit);
        ctx.manifest.updateFileStatusWithDocs(
          file,
          unit.identity.contentHash,
          unit.identity.fileKind,
          updatedUnit as SpineUnit,
          ['English'],
        );
      } catch (e) {
        ctx.runtimeIO.warn(
          `[KnowledgeGraph] Failed to write health flags for ${file}:`,
          e instanceof Error ? e.message : String(e),
        );
      }
    }
  }
}
