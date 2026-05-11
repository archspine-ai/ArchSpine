import type {
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
} from '../../engines/dependency-graph.js';

// ---------------------------------------------------------------------------
// Layered layout engine (dagre-equivalent Sugiyama-style)
// ---------------------------------------------------------------------------

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutResult {
  nodes: LayoutNode[];
  width: number;
  height: number;
}

/** Escape XML special characters for safe SVG embedding. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Sanitize a string into a valid XML ID fragment. */
function sanitizeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '-');
}

// ---------------------------------------------------------------------------
// Color palette – layers are assigned colors in topological order
// ---------------------------------------------------------------------------

const LAYER_PALETTE: { fill: string; stroke: string; text: string }[] = [
  { fill: '#1e3a5f', stroke: '#3b82f6', text: '#93c5fd' },
  { fill: '#14532d', stroke: '#22c55e', text: '#86efac' },
  { fill: '#451a03', stroke: '#f59e0b', text: '#fcd34d' },
  { fill: '#450a0a', stroke: '#ef4444', text: '#fca5a5' },
  { fill: '#2e1065', stroke: '#8b5cf6', text: '#c4b5fd' },
  { fill: '#4a044e', stroke: '#ec4899', text: '#f9a8d4' },
  { fill: '#164e63', stroke: '#06b6d4', text: '#67e8f9' },
  { fill: '#431407', stroke: '#f97316', text: '#fdba74' },
  { fill: '#134e4a', stroke: '#14b8a6', text: '#5eead4' },
  { fill: '#172554', stroke: '#6366f1', text: '#a5b4fc' },
];

function getLayerColor(index: number): (typeof LAYER_PALETTE)[0] {
  return LAYER_PALETTE[index % LAYER_PALETTE.length];
}

// ---------------------------------------------------------------------------
// Layout algorithm
// ---------------------------------------------------------------------------

/**
 * Topological sort of layers based on inter-layer dependency edges.
 * Layers with no incoming dependencies come first.
 */
function topologicalSortLayers(
  layers: string[],
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): string[] {
  const nodeLayerMap = new Map<string, string>();
  for (const node of nodes) {
    nodeLayerMap.set(node.id, node.layer);
  }

  // Build layer-level adjacency: for each edge from -> to, if layers differ,
  // record that fromLayer precedes toLayer.
  const layerInDegree = new Map<string, number>();
  const layerAdj = new Map<string, string[]>();
  for (const layer of layers) {
    layerInDegree.set(layer, 0);
    layerAdj.set(layer, []);
  }

  for (const edge of edges) {
    const fromLayer = nodeLayerMap.get(edge.from);
    const toLayer = nodeLayerMap.get(edge.to);
    if (!fromLayer || !toLayer || fromLayer === toLayer) {
      continue;
    }

    const neighbors = layerAdj.get(fromLayer)!;
    if (!neighbors.includes(toLayer)) {
      neighbors.push(toLayer);
      layerInDegree.set(toLayer, (layerInDegree.get(toLayer) ?? 0) + 1);
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const layer of layers) {
    if (layerInDegree.get(layer) === 0) {
      queue.push(layer);
    }
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    // Sort queue alphabetically for deterministic output
    queue.sort();
    const current = queue.shift()!;
    sorted.push(current);

    for (const neighbor of layerAdj.get(current) ?? []) {
      const newDegree = (layerInDegree.get(neighbor) ?? 1) - 1;
      layerInDegree.set(neighbor, newDegree);
      if (newDegree === 0 && !sorted.includes(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  // Append any remaining layers not reached by topology (isolated subgraphs)
  for (const layer of layers) {
    if (!sorted.includes(layer)) {
      sorted.push(layer);
    }
  }

  return sorted;
}

/**
 * Order nodes within each layer using the barycenter heuristic to reduce edge crossings.
 * Nodes that are targets of edges from the previous layer are pulled toward their sources.
 */
function orderWithinLayers(
  layerOrder: string[],
  layerNodes: Map<string, KnowledgeGraphNode[]>,
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): Map<string, KnowledgeGraphNode[]> {
  const nodeMap = new Map<string, KnowledgeGraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const ordered = new Map<string, KnowledgeGraphNode[]>();

  for (let i = 0; i < layerOrder.length; i++) {
    const layer = layerOrder[i];
    const layerNodeList = [...(layerNodes.get(layer) ?? [])];

    if (i > 0 && layerNodeList.length > 1) {
      // Compute barycenter for each node based on edges from previous layer
      const prevLayer = layerOrder[i - 1];
      const prevNodes = ordered.get(prevLayer) ?? [];
      const prevPositions = new Map<string, number>();
      prevNodes.forEach((n, idx) => prevPositions.set(n.id, idx));

      const barycenters = new Map<string, number>();
      for (const node of layerNodeList) {
        const sources = edges
          .filter((e) => e.to === node.id)
          .map((e) => prevPositions.get(e.from))
          .filter((p): p is number => p !== undefined);

        if (sources.length > 0) {
          barycenters.set(node.id, sources.reduce((a, b) => a + b, 0) / sources.length);
        } else {
          barycenters.set(node.id, layerNodeList.indexOf(node));
        }
      }

      layerNodeList.sort((a, b) => (barycenters.get(a.id) ?? 0) - (barycenters.get(b.id) ?? 0));
    }

    ordered.set(layer, layerNodeList);
  }

  return ordered;
}

/**
 * Scale node dimensions based on fanIn + fanOut.
 * Min: 100x44, Max: 200x80 (slightly wider than spec minimum for readability).
 */
function scaleNodeSize(
  node: KnowledgeGraphNode,
  allNodes: KnowledgeGraphNode[],
): { width: number; height: number } {
  const totals = allNodes.map((n) => n.fanIn + n.fanOut);
  const minFan = Math.min(...totals);
  const maxFan = Math.max(...totals);
  const range = maxFan - minFan || 1;

  const total = node.fanIn + node.fanOut;
  const t = (total - minFan) / range;

  const minW = 100;
  const maxW = 200;
  const minH = 44;
  const maxH = 80;

  return {
    width: Math.round(minW + t * (maxW - minW)),
    height: Math.round(minH + t * (maxH - minH)),
  };
}

/**
 * Compute absolute (x, y) positions for all nodes given ordered layers.
 */
function assignPositions(
  layerOrder: string[],
  orderedLayers: Map<string, KnowledgeGraphNode[]>,
  nodeSizes: Map<string, { width: number; height: number }>,
): { positioned: LayoutNode[]; totalWidth: number; totalHeight: number } {
  const marginX = 64;
  const marginY = 80;
  const layerGap = 96;
  const nodeGapX = 48;

  let currentY = marginY;
  let maxLayerWidth = 0;
  const positioned: LayoutNode[] = [];

  for (const layer of layerOrder) {
    const layerNodeList = orderedLayers.get(layer) ?? [];
    if (layerNodeList.length === 0) {
      continue;
    }

    // Compute this layer's total width
    let layerWidth = 0;
    let maxNodeHeight = 0;
    for (const node of layerNodeList) {
      const size = nodeSizes.get(node.id)!;
      layerWidth += size.width;
      maxNodeHeight = Math.max(maxNodeHeight, size.height);
    }
    layerWidth += (layerNodeList.length - 1) * nodeGapX;

    maxLayerWidth = Math.max(maxLayerWidth, layerWidth);

    // Center this layer horizontally within the overall canvas
    let currentX = marginX;

    for (const node of layerNodeList) {
      const size = nodeSizes.get(node.id)!;
      // Vertically center shorter nodes within the row
      const yOffset = Math.round((maxNodeHeight - size.height) / 2);

      positioned.push({
        id: node.id,
        x: currentX,
        y: currentY + yOffset,
        width: size.width,
        height: size.height,
      });

      currentX += size.width + nodeGapX;
    }

    currentY += maxNodeHeight + layerGap;
  }

  const totalWidth = Math.max(800, maxLayerWidth + marginX * 2);
  const totalHeight = currentY + marginY;

  return { positioned, totalWidth, totalHeight };
}

/**
 * Build a deterministic layered layout for the knowledge graph nodes.
 *
 * The algorithm follows the Sugiyama framework (same as dagre):
 * 1. Layer assignment – nodes are grouped by their `layer` field; layers are
 *    topologically sorted based on inter-layer dependency edges.
 * 2. Crossing reduction – within each layer, nodes are ordered using the
 *    barycenter heuristic to pull connected nodes closer.
 * 3. Coordinate assignment – nodes are positioned with uniform spacing,
 *    centered within each layer row.
 */
function computeLayout(graph: KnowledgeGraph): LayoutResult {
  const { nodes, edges } = graph;

  // Collect unique layers
  const layers = [...new Set(nodes.map((n) => n.layer))];

  // Sort layers topologically
  const layerOrder = topologicalSortLayers(layers, nodes, edges);

  // Group nodes by layer
  const layerNodes = new Map<string, KnowledgeGraphNode[]>();
  for (const node of nodes) {
    const list = layerNodes.get(node.layer) ?? [];
    list.push(node);
    layerNodes.set(node.layer, list);
  }

  // Order within each layer (crossing reduction)
  const orderedLayers = orderWithinLayers(layerOrder, layerNodes, nodes, edges);

  // Compute per-node sizes
  const nodeSizes = new Map<string, { width: number; height: number }>();
  for (const node of nodes) {
    nodeSizes.set(node.id, scaleNodeSize(node, nodes));
  }

  // Assign coordinates
  const { positioned, totalWidth, totalHeight } = assignPositions(
    layerOrder,
    orderedLayers,
    nodeSizes,
  );

  return { nodes: positioned, width: totalWidth, height: totalHeight };
}

// ---------------------------------------------------------------------------
// SVG generation
// ---------------------------------------------------------------------------

/**
 * Map edge path through dagre-compatible waypoints. For direct edges (no
 * intermediate ranks), draw a straight line. For multi-rank edges, draw a
 * polyline with rounded corners.
 */
function renderEdgePath(
  edge: KnowledgeGraphEdge,
  fromNode: LayoutNode,
  toNode: LayoutNode,
  isCompliant: boolean,
): string {
  const x1 = fromNode.x + fromNode.width / 2;
  const y1 = fromNode.y + fromNode.height;
  const x2 = toNode.x + toNode.width / 2;
  const y2 = toNode.y;

  const midY = (y1 + y2) / 2;
  const path = `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`;

  const strokeColor = isCompliant ? '#64748b' : '#ef4444';
  const strokeWidth = isCompliant ? 1.5 : 2.5;
  const dashArray = isCompliant ? '' : ' stroke-dasharray="8 5"';
  const markerEnd = isCompliant ? 'url(#arrow-compliant)' : 'url(#arrow-violation)';

  let labelSvg = '';
  if (!isCompliant) {
    // Build violation label from ruleRef or message
    const violationText = edge.ruleRef ?? edge.message ?? 'violation';
    const labelX = Math.round((x1 + x2) / 2);
    const labelY = Math.round(midY - 8);
    labelSvg = [
      `<rect x="${labelX - 60}" y="${labelY - 14}" width="120" height="18" rx="4" fill="#450a0a" stroke="#ef4444" stroke-width="0.5" opacity="0.9" />`,
      `<text x="${labelX}" y="${labelY}" text-anchor="middle" fill="#fca5a5" font-size="10" font-family="ui-monospace, SFMono-Regular, monospace">${escapeXml(violationText)}</text>`,
    ].join('');
  } else if (edge.fileCount > 0) {
    const labelX = Math.round((x1 + x2) / 2);
    const labelY = Math.round(midY - 8);
    labelSvg = `<text x="${labelX}" y="${labelY}" text-anchor="middle" fill="#64748b" font-size="10" font-family="ui-monospace, SFMono-Regular, monospace">${edge.fileCount} file${edge.fileCount !== 1 ? 's' : ''}</text>`;
  }

  return [
    `<path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"${dashArray} marker-end="${markerEnd}" />`,
    labelSvg,
  ]
    .filter(Boolean)
    .join('');
}

/**
 * Render a single graph node as an SVG <g> grouping rect + labels + tooltip.
 */
function renderNode(
  layoutNode: LayoutNode,
  graphNode: KnowledgeGraphNode,
  layerColor: ReturnType<typeof getLayerColor>,
): string {
  const { x, y, width, height } = layoutNode;
  const rx = 10;
  const safeId = sanitizeId(graphNode.id);

  // Build tooltip content
  const publicSurfaceText =
    graphNode.publicSurface.length > 0
      ? graphNode.publicSurface.map((s) => s.symbolName ?? s).join(', ')
      : 'none';

  const tooltipLines = [
    `Module: ${graphNode.id}`,
    `Layer: ${graphNode.layer}`,
    `Role: ${graphNode.role}`,
    `fanIn: ${graphNode.fanIn}`,
    `fanOut: ${graphNode.fanOut}`,
    `Violations: ${graphNode.violationCount}`,
    `Public surface: ${publicSurfaceText}`,
  ];

  const title = `<title>${escapeXml(tooltipLines.join('\n'))}</title>`;

  // Shorten path for display
  const displayLabel = graphNode.id.length > 28 ? '...' + graphNode.id.slice(-25) : graphNode.id;

  const labelY = y + height / 2 + 5;

  // fanIn/fanOut badge
  const badgeText = `in:${graphNode.fanIn} out:${graphNode.fanOut}`;
  const badgeY = y + 14;

  return [
    `<g id="node-${safeId}" class="graph-node">`,
    title,
    `<rect x="${x}" y="${y}" rx="${rx}" ry="${rx}" width="${width}" height="${height}" fill="${layerColor.fill}" stroke="${layerColor.stroke}" stroke-width="2" />`,
    `<text x="${x + 8}" y="${badgeY}" fill="${layerColor.text}" font-size="10" font-family="ui-monospace, SFMono-Regular, monospace" opacity="0.8">${badgeText}</text>`,
    `<text x="${x + width / 2}" y="${labelY}" text-anchor="middle" fill="#f8fafc" font-size="13" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="600">${escapeXml(displayLabel)}</text>`,
    '</g>',
  ].join('');
}

/**
 * Render a legend mapping layers to colors.
 */
function renderLegend(
  layerOrder: string[],
  layerColorMap: Map<string, ReturnType<typeof getLayerColor>>,
  topY: number,
  canvasWidth: number,
): string {
  const itemWidth = 140;
  const rowCapacity = Math.max(1, Math.floor((canvasWidth - 80) / itemWidth));
  const rows: string[][] = [];
  let currentRow: string[] = [];
  for (const layer of layerOrder) {
    currentRow.push(layer);
    if (currentRow.length >= rowCapacity) {
      rows.push(currentRow);
      currentRow = [];
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  const rowHeight = 24;
  const startY = topY + 30;
  const elements: string[] = [];

  // Legend title
  elements.push(
    `<text x="40" y="${startY - 8}" fill="#94a3b8" font-size="12" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="600">Layers</text>`,
  );

  rows.forEach((row, rowIndex) => {
    const totalRowWidth = row.length * itemWidth;
    const startX = Math.round((canvasWidth - totalRowWidth) / 2);

    row.forEach((layer, colIndex) => {
      const color = layerColorMap.get(layer)!;
      const x = startX + colIndex * itemWidth;
      const y = startY + rowIndex * rowHeight;

      elements.push(
        `<rect x="${x}" y="${y}" width="14" height="14" rx="3" fill="${color.fill}" stroke="${color.stroke}" stroke-width="1.5" />`,
        `<text x="${x + 20}" y="${y + 12}" fill="#cbd5e1" font-size="11" font-family="ui-sans-serif, system-ui, sans-serif">${escapeXml(layer)}</text>`,
      );
    });
  });

  return elements.join('');
}

/**
 * Generate a standalone SVG architecture diagram from a KnowledgeGraph.
 *
 * Features:
 * - Deterministic layered layout (Sugiyama-style, no LLM)
 * - Nodes colored by architectural layer
 * - Node size scales with fanIn + fanOut
 * - Compliant edges: gray solid; violation edges: red dashed with ruleRef label
 * - SVG `<title>` tooltips on every node (GitHub-native hover)
 * - Inline CSS, zero external dependencies
 */
export function generateArchitectureDiagramSvg(graph: KnowledgeGraph): string {
  const { nodes: graphNodes, edges: graphEdges } = graph;

  if (graphNodes.length === 0) {
    return renderEmptySvg();
  }

  // Compute layout
  const layout = computeLayout(graph);

  // Build node lookup
  const layoutNodeMap = new Map<string, LayoutNode>();
  for (const ln of layout.nodes) {
    layoutNodeMap.set(ln.id, ln);
  }
  const graphNodeMap = new Map<string, KnowledgeGraphNode>();
  for (const gn of graphNodes) {
    graphNodeMap.set(gn.id, gn);
  }

  // Assign layer colors
  const layers = [...new Set(graphNodes.map((n) => n.layer))];
  const layerColorMap = new Map<string, ReturnType<typeof getLayerColor>>();
  layers.forEach((layer, index) => {
    layerColorMap.set(layer, getLayerColor(index));
  });

  // Legend area
  const legendRowCount = Math.ceil(
    layers.length / Math.max(1, Math.floor((layout.width - 80) / 140)),
  );
  const legendHeight = 30 + legendRowCount * 24 + 24;
  const totalHeight = layout.height + legendHeight;

  // Render edges
  const edgeSvg = graphEdges
    .map((edge) => {
      const fromNode = layoutNodeMap.get(edge.from);
      const toNode = layoutNodeMap.get(edge.to);
      if (!fromNode || !toNode) {
        return '';
      }
      return renderEdgePath(edge, fromNode, toNode, edge.compliant);
    })
    .filter(Boolean)
    .join('');

  // Render nodes
  const nodeSvg = layout.nodes
    .map((ln) => {
      const gn = graphNodeMap.get(ln.id);
      if (!gn) {
        return '';
      }
      const color = layerColorMap.get(gn.layer) ?? getLayerColor(0);
      return renderNode(ln, gn, color);
    })
    .filter(Boolean)
    .join('');

  // Render legend
  const legendSvg = renderLegend(layers, layerColorMap, layout.height, layout.width);

  // Edge style legend
  const edgeLegendY = layout.height + 30 + legendRowCount * 24 + 14;
  const edgeLegend = [
    `<line x1="40" y1="${edgeLegendY}" x2="90" y2="${edgeLegendY}" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-compliant)" />`,
    `<text x="100" y="${edgeLegendY + 4}" fill="#94a3b8" font-size="11" font-family="ui-sans-serif, system-ui, sans-serif">Compliant</text>`,
    `<line x1="220" y1="${edgeLegendY}" x2="270" y2="${edgeLegendY}" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="8 5" marker-end="url(#arrow-violation)" />`,
    `<text x="280" y="${edgeLegendY + 4}" fill="#94a3b8" font-size="11" font-family="ui-sans-serif, system-ui, sans-serif">Violation</text>`,
  ].join('');

  const finalHeight = totalHeight + 36;

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${finalHeight}" width="${layout.width}" height="${finalHeight}" role="img" aria-label="Architecture dependency graph">`,
    '<defs>',
    '<marker id="arrow-compliant" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">',
    '<path d="M0,0 L0,6 L8,3 z" fill="#64748b" />',
    '</marker>',
    '<marker id="arrow-violation" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">',
    '<path d="M0,0 L0,6 L8,3 z" fill="#ef4444" />',
    '</marker>',
    '<style>',
    '.graph-node { cursor: pointer; }',
    '.graph-node:hover rect:first-of-type { filter: brightness(1.3); }',
    '</style>',
    '</defs>',
    '<rect width="100%" height="100%" fill="#0b1121" />',
    edgeSvg,
    nodeSvg,
    legendSvg,
    edgeLegend,
    '</svg>',
  ].join('\n');
}

function renderEmptySvg(): string {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200" role="img" aria-label="Empty architecture diagram">`,
    '<rect width="100%" height="100%" fill="#0b1121" />',
    '<text x="200" y="90" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="ui-sans-serif, system-ui, sans-serif">No architecture diagram data available.</text>',
    '<text x="200" y="114" text-anchor="middle" fill="#64748b" font-size="12" font-family="ui-sans-serif, system-ui, sans-serif">Run a full sync to generate the knowledge graph.</text>',
    '</svg>',
  ].join('\n');
}
