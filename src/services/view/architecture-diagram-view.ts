import * as fs from 'fs';
import * as path from 'path';
import type { RuntimeIO } from '../../infra/runtime-io.js';
import type { KnowledgeGraph } from '../../engines/dependency-graph.js';
import { generateArchitectureDiagramSvg } from './arch-diagram-svg-renderer.js';
import type { ViewArtifact, ViewContext, ViewProducer } from './producer.js';

const KNOWLEDGE_GRAPH_PATH = '.spine/view/data/knowledge-graph.json';
const SVG_OUTPUT_NAME = 'architecture-diagram.svg';
const JSON_OUTPUT_NAME = 'architecture-diagram.json';

interface DeriveResult {
  generated: boolean;
  svg?: string;
  graph?: KnowledgeGraph;
  reason?: string;
}

/**
 * Load the knowledge graph from `.spine/view/data/knowledge-graph.json` and
 * produce a deterministic SVG architecture diagram.
 *
 * Fully deterministic – no LLM calls, no network I/O.
 */
function deriveFromKnowledgeGraph(rootDir: string, runtimeIO?: RuntimeIO): DeriveResult {
  const kgPath = path.join(rootDir, KNOWLEDGE_GRAPH_PATH);

  if (!fs.existsSync(kgPath)) {
    runtimeIO?.info(
      '[View] Skipping architecture diagram because knowledge-graph.json is missing. Run a full sync first.',
    );
    return {
      generated: false,
      reason: 'knowledge-graph.json is missing.',
    };
  }

  try {
    const raw = fs.readFileSync(kgPath, 'utf-8');
    const graph = JSON.parse(raw) as KnowledgeGraph;

    if (
      !graph.nodes ||
      !Array.isArray(graph.nodes) ||
      !graph.edges ||
      !Array.isArray(graph.edges)
    ) {
      runtimeIO?.warn(
        '[View] Skipping architecture diagram because knowledge-graph.json has an unexpected structure.',
      );
      return {
        generated: false,
        reason: 'knowledge-graph.json has an unexpected structure.',
      };
    }

    const svg = generateArchitectureDiagramSvg(graph);

    return {
      generated: true,
      svg,
      graph,
      reason: `Generated SVG with ${graph.nodes.length} nodes and ${graph.edges.length} edges.`,
    };
  } catch (error) {
    runtimeIO?.warn(
      '[View] Failed to derive architecture diagram:',
      error instanceof Error ? error.message : String(error),
    );
    return {
      generated: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * View producer registered in the producer-registry.
 *
 * Reads the pre-computed knowledge graph (`.spine/view/data/knowledge-graph.json`)
 * and produces an SVG architecture diagram. Runs on every sync — the knowledge
 * graph is rebuilt during post-commit-derivation for both full and incremental syncs.
 *
 * Outputs:
 * - `.spine/view/pages/architecture-diagram.svg` – standalone SVG diagram
 * - `.spine/view/data/architecture-diagram.json` – metadata envelope
 */
export const architectureDiagramProducer: ViewProducer = {
  async derive(ctx: ViewContext): Promise<ViewArtifact> {
    const result = deriveFromKnowledgeGraph(ctx.rootDir, ctx.runtimeIO);

    if (result.generated && result.svg && result.graph) {
      // Write SVG to .spine/view/pages/ directory
      ctx.outputManager.saveViewMarkdown(SVG_OUTPUT_NAME, result.svg);

      // Write a lightweight JSON metadata envelope for backward compatibility
      // with existing tooling that expects architecture-diagram.json
      ctx.outputManager.saveView(JSON_OUTPUT_NAME, {
        title: 'Architecture Diagram',
        subtitle: `Dependency graph with ${result.graph.nodes.length} modules and ${result.graph.edges.length} edges.`,
        nodeCount: result.graph.nodes.length,
        edgeCount: result.graph.edges.length,
        generatedAt: new Date().toISOString(),
        _quality: {
          nodeCount: result.graph.nodes.length,
          edgeCount: result.graph.edges.length,
        },
      });

      ctx.runtimeIO?.info(
        `[View] Wrote architecture diagram SVG with ${result.graph.nodes.length} nodes and ${result.graph.edges.length} edges.`,
      );
    }

    return {
      viewType: 'architecture-diagram',
      generated: result.generated,
      generatedAt: new Date().toISOString(),
      reason: result.reason,
      metrics: result.graph
        ? {
            nodeCount: result.graph.nodes.length,
            edgeCount: result.graph.edges.length,
          }
        : {},
    };
  },
};
