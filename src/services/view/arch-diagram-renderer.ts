import type { IArchDiagramSpec, IArchDiagramNode, ArchNodeType } from '../../types/view.js';

const NODE_STYLES: Record<ArchNodeType, { fill: string; stroke: string }> = {
  frontend: { fill: 'rgba(8, 51, 68, 0.4)', stroke: '#22d3ee' },
  backend: { fill: 'rgba(6, 78, 59, 0.4)', stroke: '#34d399' },
  database: { fill: 'rgba(76, 29, 149, 0.4)', stroke: '#a78bfa' },
  cloud: { fill: 'rgba(120, 53, 15, 0.3)', stroke: '#fbbf24' },
  security: { fill: 'rgba(136, 19, 55, 0.4)', stroke: '#fb7185' },
  messagebus: { fill: 'rgba(251, 146, 60, 0.3)', stroke: '#fb923c' },
  external: { fill: 'rgba(30, 41, 59, 0.5)', stroke: '#94a3b8' },
};

const LAYER_ORDER: ArchNodeType[] = [
  'frontend',
  'backend',
  'messagebus',
  'database',
  'security',
  'cloud',
  'external',
];

interface PositionedNode {
  node: IArchDiagramNode;
  x: number;
  y: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '-');
}

function groupByLayer(nodes: IArchDiagramNode[]): IArchDiagramNode[][] {
  return LAYER_ORDER.map((type) => nodes.filter((node) => node.type === type)).filter(
    (group) => group.length > 0,
  );
}

function layoutNodes(nodes: IArchDiagramNode[]): {
  positioned: PositionedNode[];
  width: number;
  height: number;
  legendTop: number;
} {
  const groups = groupByLayer(nodes);
  const cardWidth = 220;
  const cardHeight = 88;
  const horizontalGap = 56;
  const verticalGap = 120;
  const leftPadding = 72;
  const topPadding = 120;
  const minWidth = 960;

  const maxColumns = groups.reduce((max, group) => Math.max(max, group.length), 1);
  const width = Math.max(
    minWidth,
    leftPadding * 2 + maxColumns * cardWidth + Math.max(0, maxColumns - 1) * horizontalGap,
  );
  const positioned: PositionedNode[] = [];

  groups.forEach((group, rowIndex) => {
    const rowWidth = group.length * cardWidth + Math.max(0, group.length - 1) * horizontalGap;
    const startX = Math.round((width - rowWidth) / 2);
    const y = topPadding + rowIndex * verticalGap;
    group.forEach((node, columnIndex) => {
      positioned.push({
        node,
        x: startX + columnIndex * (cardWidth + horizontalGap),
        y,
      });
    });
  });

  const lastY = positioned.length > 0 ? Math.max(...positioned.map((item) => item.y)) : topPadding;
  const legendTop = lastY + cardHeight + 30;
  const height = legendTop + 240;
  return { positioned, width, height, legendTop };
}

function renderEmptyState(spec: IArchDiagramSpec): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(spec.title)}</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #020617; color: #e2e8f0; }
    main { max-width: 960px; margin: 0 auto; padding: 48px 24px 64px; }
    .shell { border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 24px; padding: 40px; background: radial-gradient(circle at top, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.98)); }
    h1 { margin: 0 0 8px; font-size: 2rem; }
    p { margin: 0; color: #94a3b8; }
    .empty { margin-top: 32px; padding: 32px; border-radius: 20px; border: 1px dashed rgba(148, 163, 184, 0.35); text-align: center; }
  </style>
</head>
<body>
  <main>
    <section class="shell">
      <h1>${escapeHtml(spec.title)}</h1>
      <p>${escapeHtml(spec.subtitle)}</p>
      <div class="empty">No architecture diagram data available.</div>
    </section>
  </main>
</body>
</html>`;
}

export class ArchitectureDiagramRenderer {
  public static render(spec: IArchDiagramSpec): string {
    if (spec.nodes.length === 0) {
      return renderEmptyState(spec);
    }

    const { positioned, width, height, legendTop } = layoutNodes(spec.nodes);
    const nodeWidth = 220;
    const nodeHeight = 88;
    const nodeLookup = new Map(positioned.map((item) => [item.node.id, item]));

    const edges = spec.edges
      .map((edge, index) => {
        const from = nodeLookup.get(edge.from);
        const to = nodeLookup.get(edge.to);
        if (!from || !to) {
          return '';
        }

        const x1 = from.x + nodeWidth / 2;
        const y1 = from.y + nodeHeight;
        const x2 = to.x + nodeWidth / 2;
        const y2 = to.y;
        const midX = Math.round((x1 + x2) / 2);
        const labelY = Math.round((y1 + y2) / 2) - 8;
        const dash = edge.style === 'dashed' ? ' stroke-dasharray="8 8"' : '';

        return [
          `<g class="edge edge-${index}">`,
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="2.5"${dash} marker-end="url(#arrow)" />`,
          edge.label
            ? `<text x="${midX}" y="${labelY}" text-anchor="middle" fill="#cbd5e1" font-size="12">${escapeHtml(edge.label)}</text>`
            : '',
          '</g>',
        ]
          .filter(Boolean)
          .join('');
      })
      .join('');

    const nodes = positioned
      .map((item) => {
        const style = NODE_STYLES[item.node.type];
        const titleY = item.y + 34;
        const subtitleY = item.y + 58;
        const safeId = sanitizeId(item.node.id);
        return [
          `<g id="node-${safeId}" data-node-id="${escapeHtml(item.node.id)}">`,
          `<rect x="${item.x}" y="${item.y}" rx="18" ry="18" width="${nodeWidth}" height="${nodeHeight}" fill="#020617" />`,
          `<rect x="${item.x}" y="${item.y}" rx="18" ry="18" width="${nodeWidth}" height="${nodeHeight}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2" />`,
          `<text x="${item.x + 18}" y="${titleY}" fill="#f8fafc" font-size="16" font-weight="700">${escapeHtml(item.node.label)}</text>`,
          item.node.sublabel
            ? `<text x="${item.x + 18}" y="${subtitleY}" fill="#cbd5e1" font-size="12">${escapeHtml(item.node.sublabel)}</text>`
            : '',
          '</g>',
        ]
          .filter(Boolean)
          .join('');
      })
      .join('');

    const legend = LAYER_ORDER.map((type, index) => {
      const style = NODE_STYLES[type];
      const x = 72 + index * 122;
      return [
        `<rect x="${x}" y="${legendTop}" width="16" height="16" rx="4" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5" />`,
        `<text x="${x + 24}" y="${legendTop + 13}" fill="#cbd5e1" font-size="12">${escapeHtml(type)}</text>`,
      ].join('');
    }).join('');

    const cards = spec.summaryCards
      .map(
        (card) => `
      <article class="card">
        <h3>${escapeHtml(card.heading)}</h3>
        <ul>
          ${card.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}
        </ul>
      </article>
    `,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(spec.title)}</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, sans-serif;
      color: #e2e8f0;
      background:
        radial-gradient(circle at top, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 1)),
        linear-gradient(180deg, #020617 0%, #0f172a 100%);
    }
    main { max-width: 1200px; margin: 0 auto; padding: 40px 24px 64px; }
    .frame {
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 28px;
      padding: 28px;
      background: rgba(2, 6, 23, 0.78);
      box-shadow: 0 30px 80px rgba(2, 6, 23, 0.45);
      backdrop-filter: blur(12px);
    }
    .eyebrow { color: #38bdf8; font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; }
    h1 { margin: 12px 0 10px; font-size: 2.3rem; line-height: 1.1; }
    .subtitle { margin: 0 0 24px; color: #94a3b8; font-size: 1rem; max-width: 860px; }
    svg { width: 100%; height: auto; display: block; border-radius: 22px; background: rgba(15, 23, 42, 0.72); }
    .cards {
      margin-top: 28px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    .card {
      border-radius: 20px;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.92));
      padding: 18px 18px 16px;
    }
    .card h3 { margin: 0 0 10px; font-size: 1rem; }
    .card ul { margin: 0; padding-left: 18px; color: #cbd5e1; }
    .card li + li { margin-top: 8px; }
    @media (max-width: 900px) {
      .cards { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <section class="frame">
      <div class="eyebrow">Architecture View</div>
      <h1>${escapeHtml(spec.title)}</h1>
      <p class="subtitle">${escapeHtml(spec.subtitle)}</p>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(spec.title)} architecture diagram">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#64748b"></path>
          </marker>
        </defs>
        ${edges}
        ${nodes}
        ${legend}
      </svg>
      <section class="cards">
        ${cards}
      </section>
    </section>
  </main>
</body>
</html>`;
  }
}
