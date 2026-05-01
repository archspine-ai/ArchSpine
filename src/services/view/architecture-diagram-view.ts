import { generateArchitectureDiagramPrompt } from '../../assets/templates/prompts/arch-diagram.js';
import { ArchitectureDiagramRenderer } from './arch-diagram-renderer.js';
import type { LLMClient } from '../../infra/llm.js';
import type { RuntimeIO } from '../../infra/runtime-io.js';
import type { ArchDiagramSpec, ArchNodeType, ViewId } from '../../types/view.js';
import type { OutputManager } from '../../infra/output.js';
import { ViewIndexLoader } from './index-loader.js';

const ARCH_DIAGRAM_CARD_HEADINGS = [
  'Core Modules',
  'Key Dependencies',
  'System Boundaries',
] as const;

export async function deriveArchitectureDiagramView(
  loader: ViewIndexLoader,
  outputManager: Pick<OutputManager, 'saveView' | 'saveViewHtml'>,
  runtimeIO?: RuntimeIO,
  llmClient?: LLMClient,
): Promise<{ generated: boolean; viewId: ViewId; reason?: string }> {
  if (!llmClient?.generateText) {
    runtimeIO?.info(
      '[View] Skipping architecture diagram because no text-generation LLM client is configured.',
    );
    return {
      generated: false,
      viewId: 'architecture-diagram',
      reason: 'No text-generation LLM client is configured.',
    };
  }

  const project = loader.loadProjectUnit();
  if (!project) {
    runtimeIO?.info(
      '[View] Skipping architecture diagram because .spine/index/project.json is missing.',
    );
    return {
      generated: false,
      viewId: 'architecture-diagram',
      reason: '.spine/index/project.json is missing.',
    };
  }

  const folders = loader.loadFolderUnits();
  if (folders.length === 0) {
    runtimeIO?.info(
      '[View] Skipping architecture diagram because no folder.json inputs were found.',
    );
    return {
      generated: false,
      viewId: 'architecture-diagram',
      reason: 'No folder.json inputs were found.',
    };
  }

  try {
    const prompt = generateArchitectureDiagramPrompt(project, folders);
    const response = await llmClient.generateText(prompt);
    const parsed = JSON.parse(response.content) as unknown;
    const spec = validateArchDiagramSpec(parsed);
    if (!spec) {
      runtimeIO?.warn(
        '[View] Skipping architecture diagram because the LLM output did not match ArchDiagramSpec.',
      );
      return {
        generated: false,
        viewId: 'architecture-diagram',
        reason: 'The generated spec failed validation.',
      };
    }

    const html = ArchitectureDiagramRenderer.render(spec);
    outputManager.saveViewHtml('architecture-diagram.html', html);
    outputManager.saveView('architecture-diagram.json', spec);
    runtimeIO?.info(
      `[View] Wrote architecture diagram with ${spec.nodes.length} nodes and ${spec.edges.length} edges.`,
    );
    return { generated: true, viewId: 'architecture-diagram' };
  } catch (error) {
    runtimeIO?.warn(
      '[View] Failed to derive architecture diagram:',
      error instanceof Error ? error.message : String(error),
    );
    return {
      generated: false,
      viewId: 'architecture-diagram',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function validateArchDiagramSpec(input: unknown): ArchDiagramSpec | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const candidate = input as Record<string, unknown>;
  if (typeof candidate.title !== 'string' || typeof candidate.subtitle !== 'string') {
    return null;
  }

  if (
    !Array.isArray(candidate.nodes) ||
    !Array.isArray(candidate.edges) ||
    !Array.isArray(candidate.summaryCards)
  ) {
    return null;
  }

  if (
    candidate.nodes.length < 5 ||
    candidate.nodes.length > 20 ||
    candidate.summaryCards.length !== 3
  ) {
    return null;
  }

  const allowedTypes = new Set<ArchNodeType>([
    'frontend',
    'backend',
    'database',
    'cloud',
    'security',
    'messagebus',
    'external',
  ]);

  const nodes = candidate.nodes.map((node) => {
    if (!node || typeof node !== 'object') {
      return null;
    }
    const value = node as Record<string, unknown>;
    if (
      typeof value.id !== 'string' ||
      typeof value.label !== 'string' ||
      typeof value.type !== 'string' ||
      !allowedTypes.has(value.type as ArchNodeType)
    ) {
      return null;
    }
    if (value.sublabel !== undefined && typeof value.sublabel !== 'string') {
      return null;
    }
    return {
      id: value.id,
      label: value.label,
      sublabel: value.sublabel,
      type: value.type as ArchNodeType,
    };
  });

  if (nodes.some((node) => node === null)) {
    return null;
  }

  const dedupedIds = new Set(nodes.map((node) => node!.id));
  if (dedupedIds.size !== nodes.length) {
    return null;
  }

  const edges = candidate.edges.map((edge) => {
    if (!edge || typeof edge !== 'object') {
      return null;
    }
    const value = edge as Record<string, unknown>;
    if (typeof value.from !== 'string' || typeof value.to !== 'string') {
      return null;
    }
    if (value.label !== undefined && typeof value.label !== 'string') {
      return null;
    }
    if (value.style !== undefined && value.style !== 'solid' && value.style !== 'dashed') {
      return null;
    }
    return {
      from: value.from,
      to: value.to,
      label: value.label,
      style: value.style as 'solid' | 'dashed' | undefined,
    };
  });

  if (edges.some((edge) => edge === null)) {
    return null;
  }

  if (edges.some((edge) => !dedupedIds.has(edge!.from) || !dedupedIds.has(edge!.to))) {
    return null;
  }

  const summaryCards = candidate.summaryCards.map((card) => {
    if (!card || typeof card !== 'object') {
      return null;
    }
    const value = card as Record<string, unknown>;
    if (
      typeof value.heading !== 'string' ||
      !Array.isArray(value.points) ||
      value.points.some((point) => typeof point !== 'string')
    ) {
      return null;
    }
    return {
      heading: value.heading,
      points: value.points as string[],
    };
  });

  if (summaryCards.some((card) => card === null)) {
    return null;
  }

  const headings = summaryCards.map((card) => card!.heading);
  if (ARCH_DIAGRAM_CARD_HEADINGS.some((heading, index) => headings[index] !== heading)) {
    return null;
  }

  return {
    title: candidate.title,
    subtitle: candidate.subtitle,
    nodes: nodes as ArchDiagramSpec['nodes'],
    edges: edges as ArchDiagramSpec['edges'],
    summaryCards: summaryCards as ArchDiagramSpec['summaryCards'],
  };
}
