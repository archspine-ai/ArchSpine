import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as http from 'http';
import type { IPublicSurfaceViewItem, IRiskHotspotViewItem } from '../../types/view.js';

const DEFAULT_PORT = 7899;

// ---------------------------------------------------------------------------
// Lightweight Markdown → HTML converter (covers the subset used by .spine/pages/)
// ---------------------------------------------------------------------------

function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let inTable = false;
  let tableHtml: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];
  let inList = false;
  let listType = 'ul';

  function flushTable(): void {
    if (tableHtml.length > 0) {
      html.push('<div class="table-wrap"><table>');
      html.push(tableHtml.join('\n'));
      html.push('</table></div>');
      tableHtml = [];
    }
    inTable = false;
  }

  function flushCodeBlock(): void {
    if (codeBlockContent.length > 0) {
      const langClass = codeBlockLang ? ` class="lang-${escapeHtml(codeBlockLang)}"` : '';
      html.push(`<pre${langClass}><code>${codeBlockContent.join('\n')}</code></pre>`);
      codeBlockContent = [];
    }
    inCodeBlock = false;
    codeBlockLang = '';
  }

  function flushList(): void {
    if (inList) {
      html.push(`</${listType}>`);
      inList = false;
    }
  }

  for (const raw of lines) {
    // Code block fence
    if (raw.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushTable();
        flushList();
        inCodeBlock = true;
        codeBlockLang = raw.trimStart().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(escapeHtml(raw));
      continue;
    }

    const line = raw;

    // Horizontal rule
    if (/^---\s*$/.test(line) && !inTable) {
      flushTable();
      flushList();
      html.push('<hr>');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushTable();
      flushList();
      const level = headingMatch[1].length;
      const text = inlineMdToHtml(headingMatch[2]);
      html.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Table separator
    if (/^\|[\s:-]+\|[\s:-]+\|/.test(line) && inTable) {
      continue;
    }

    // Table row
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        flushList();
        inTable = true;
        tableHtml = [];
      }
      const cells = line
        .split('|')
        .filter((_, i, a) => i > 0 && i < a.length - 1)
        .map((c) => inlineMdToHtml(c.trim()));
      const cellTag = tableHtml.length === 0 ? 'th' : 'td';
      tableHtml.push(`<tr>${cells.map((c) => `<${cellTag}>${c}</${cellTag}>`).join('')}</tr>`);
      continue;
    }

    // If we were in a table and this line isn't a table row, flush
    if (inTable && !line.startsWith('|')) {
      flushTable();
    }

    // Empty line
    if (line.trim() === '') {
      if (inList) {
        // Don't break list on empty line — add a spacer <li>
      } else {
        flushList();
        html.push('<div class="md-spacer"></div>');
      }
      continue;
    }

    // Unordered list item
    if (/^[\s]*[-*+]\s+/.test(line)) {
      if (!inList) {
        flushTable();
        inList = true;
        listType = 'ul';
        html.push(`<${listType}>`);
      }
      const content = line.replace(/^[\s]*[-*+]\s+/, '');
      html.push(`<li>${inlineMdToHtml(content)}</li>`);
      continue;
    }

    // Ordered list item
    if (/^[\s]*\d+\.\s+/.test(line)) {
      if (!inList || listType !== 'ol') {
        flushTable();
        flushList();
        inList = true;
        listType = 'ol';
        html.push(`<${listType}>`);
      }
      const content = line.replace(/^[\s]*\d+\.\s+/, '');
      html.push(`<li>${inlineMdToHtml(content)}</li>`);
      continue;
    }

    // Not a list item — but we were in a list
    if (inList) {
      flushList();
    }

    // Regular paragraph
    flushTable();
    html.push(`<p>${inlineMdToHtml(line)}</p>`);
  }

  flushTable();
  flushCodeBlock();
  flushList();

  return html.join('\n');
}

function inlineMdToHtml(text: string): string {
  // Escape HTML first
  let result = escapeHtml(text);
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// HTTP Server
// ---------------------------------------------------------------------------

function loadJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

const PAGE_CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f6f8; color: #1a1a2e; line-height: 1.6;
    padding: 0; margin: 0;
  }
  .topbar {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #fff; padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 2px solid #0f3460;
  }
  .topbar h1 { font-size: 20px; font-weight: 600; }
  .topbar .subtitle { font-size: 13px; color: #8899b0; }
  .topbar .meta { font-size: 12px; color: #5a7a9a; }
  .container { max-width: 1280px; margin: 0 auto; padding: 24px 32px; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .card {
    background: #fff; border-radius: 10px; padding: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06); cursor: pointer;
    transition: all 0.15s ease; border: 1px solid #eef0f4;
    text-decoration: none; color: inherit; display: block;
  }
  .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-color: #0f3460; transform: translateY(-1px); }
  .card h2 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
  .card .desc { font-size: 13px; color: #5a6a7e; margin-bottom: 12px; }
  .card .stat {
    display: inline-block; font-size: 12px; font-weight: 500;
    padding: 2px 10px; border-radius: 12px;
  }
  .stat-green { background: #e3f5e9; color: #1b7a3d; }
  .stat-amber { background: #fef3d5; color: #a16600; }
  .stat-red { background: #fee8e8; color: #b91c1c; }
  .stat-blue { background: #e0edff; color: #1a56db; }
  .stat-gray { background: #f0f1f3; color: #5a6a7e; }
  .score-badge {
    display: inline-block; font-size: 11px; font-weight: 600;
    padding: 1px 8px; border-radius: 8px; margin-right: 4px;
  }
  .score-high { background: #e3f5e9; color: #1b7a3d; }
  .score-med { background: #fef3d5; color: #a16600; }
  .score-low { background: #fee8e8; color: #b91c1c; }
  .back { display: inline-block; margin-bottom: 20px; color: #1a56db; text-decoration: none; font-size: 14px; }
  .back:hover { text-decoration: underline; }
  h2 { font-size: 20px; margin-bottom: 16px; }
  h3 { font-size: 16px; margin: 24px 0 12px; color: #1a1a2e; }
  .view-content { background: #fff; border-radius: 10px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #eef0f4; }
  .view-content h1 { font-size: 24px; margin-bottom: 8px; }
  .view-content h2 { font-size: 20px; margin: 24px 0 8px; border-bottom: 1px solid #eef0f4; padding-bottom: 6px; }
  .view-content table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  .view-content th, .view-content td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eef0f4; font-size: 13px; }
  .view-content th { background: #f8f9fb; font-weight: 600; color: #5a6a7e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .view-content pre { background: #f4f5f7; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.5; margin: 12px 0; }
  .view-content code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; background: #f0f1f3; padding: 1px 4px; border-radius: 3px; }
  .view-content pre code { background: none; padding: 0; }
  .view-content ul, .view-content ol { padding-left: 24px; margin: 8px 0; }
  .view-content li { margin: 4px 0; font-size: 14px; }
  .view-content hr { border: none; border-top: 1px solid #eef0f4; margin: 24px 0; }
  .view-content .md-spacer { height: 8px; }
  .view-content p { margin: 8px 0; font-size: 14px; }
  .table-wrap { overflow-x: auto; }
  .error { color: #b91c1c; background: #fee8e8; padding: 16px; border-radius: 8px; }
  .loading { color: #5a6a7e; text-align: center; padding: 40px; font-size: 14px; }
  .item-card {
    background: #fff; border: 1px solid #eef0f4; border-radius: 8px; padding: 16px; margin-bottom: 12px;
    transition: border-color 0.15s;
  }
  .item-card:hover { border-color: #c0c8d4; }
  .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .item-path { font-family: 'SF Mono', monospace; font-size: 13px; font-weight: 500; color: #1a1a2e; word-break: break-all; }
  .item-summary { font-size: 13px; color: #5a6a7e; margin-bottom: 8px; }
  .item-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .symbol-list { display: flex; flex-wrap: wrap; gap: 4px; }
  .symbol-tag { font-family: 'SF Mono', monospace; font-size: 11px; background: #e8edf5; color: #1a56db; padding: 1px 6px; border-radius: 4px; }
  .footer { text-align: center; padding: 24px; font-size: 12px; color: #8899b0; }
  .nav-tabs { display: flex; gap: 4px; margin-bottom: 20px; flex-wrap: wrap; }
  .nav-tab {
    padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;
    background: #f0f1f3; color: #5a6a7e; text-decoration: none; transition: all 0.1s;
  }
  .nav-tab:hover { background: #e0edff; color: #1a56db; }
  .nav-tab.active { background: #1a56db; color: #fff; }
`;

function renderDashboard(spineDir: string): string {
  const views: Array<{
    id: string;
    title: string;
    desc: string;
    stat: string;
    statClass: string;
    badge?: string;
  }> = [];

  // Public Surface
  const ps = loadJson<{ items: IPublicSurfaceViewItem[]; generatedAt: string }>(
    path.join(spineDir, 'view', 'data', 'public-surface.json'),
  );
  views.push({
    id: 'public-surface',
    title: 'Public Surface',
    desc: 'High-confidence public entry surfaces',
    stat: `${ps?.items?.length || 0} items`,
    statClass: ps?.items?.length ? 'stat-blue' : 'stat-gray',
  });

  // Risk Hotspots
  const rh = loadJson<{ items: IRiskHotspotViewItem[]; generatedAt: string }>(
    path.join(spineDir, 'view', 'data', 'risk-hotspots.json'),
  );
  const avgScore = rh?.items?.length
    ? Math.round(rh.items.reduce((s, i) => s + (i.totalScore || 0), 0) / rh.items.length)
    : 0;
  views.push({
    id: 'risk-hotspots',
    title: 'Risk Hotspots',
    desc: 'Top risk-ranked files by impact & complexity',
    stat: `${rh?.items?.length || 0} hotspots`,
    statClass: rh?.items?.length ? (avgScore > 60 ? 'stat-red' : 'stat-amber') : 'stat-gray',
  });

  // Agent Briefing
  const ab = loadJson<{ items: Array<{ moduleTopology: unknown[] }>; generatedAt: string }>(
    path.join(spineDir, 'view', 'data', 'agent-briefing.json'),
  );
  views.push({
    id: 'agent-briefing',
    title: 'Agent Briefing',
    desc: 'One-page project overview for AI agents',
    stat: ab?.items?.[0]?.moduleTopology
      ? `${ab.items[0].moduleTopology.length} modules`
      : 'available',
    statClass: ab ? 'stat-green' : 'stat-gray',
  });

  // Architecture Diagram
  const diag = loadJson<{ title: string; nodes: unknown[] }>(
    path.join(spineDir, 'view', 'data', 'architecture-diagram.json'),
  );
  views.push({
    id: 'architecture-diagram',
    title: 'Architecture Diagram',
    desc: 'Module topology rendered as SVG',
    stat: diag?.nodes ? `${diag.nodes.length} nodes` : 'available',
    statClass: diag ? 'stat-blue' : 'stat-gray',
  });

  // Project Health
  const ph = loadJson<{ items: Array<{ healthSummary?: { cycleCount?: number } }> }>(
    path.join(spineDir, 'view', 'data', 'project-health.json'),
  );
  views.push({
    id: 'project-health',
    title: 'Project Health',
    desc: 'Topology, cycles, dead code & violations',
    stat: ph?.items?.[0]?.healthSummary
      ? `${ph.items[0].healthSummary.cycleCount || 0} cycles`
      : 'available',
    statClass: ph?.items?.[0]?.healthSummary?.cycleCount ? 'stat-red' : 'stat-green',
  });

  // Change Impact
  const ci = loadJson<{ modules: unknown[] }>(
    path.join(spineDir, 'view', 'data', 'change-impact.json'),
  );
  views.push({
    id: 'change-impact',
    title: 'Change Impact',
    desc: 'Change propagation analysis for modified files',
    stat: ci?.modules ? `${ci.modules.length} modules` : 'available',
    statClass: ci ? 'stat-blue' : 'stat-gray',
  });

  const generatedAt = ps?.generatedAt || rh?.generatedAt || 'unknown';
  const projectName = path.basename(spineDir.replace('/.spine', ''));

  const cards = views
    .map(
      (v) => `
    <a class="card" href="/view/${v.id}">
      <h2>${v.title}</h2>
      <div class="desc">${v.desc}</div>
      <span class="stat ${v.statClass}">${v.stat}</span>
    </a>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(projectName)} — ArchSpine Dashboard</title>
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="topbar">
  <div>
    <h1>${escapeHtml(projectName)}</h1>
    <div class="subtitle">ArchSpine Architecture Dashboard</div>
  </div>
  <div class="meta">Generated ${new Date(generatedAt).toLocaleString()}</div>
</div>
<div class="container">
  <div class="card-grid">${cards}</div>
  <div style="font-size:12px;color:#8899b0;text-align:center;">
    <a href="/view/architecture-diagram" style="color:inherit;">Architecture Diagram SVG</a>
    &middot; Views powered by ArchSpine &mdash; <code>spine view serve</code>
  </div>
</div>
</body>
</html>`;
}

function renderViewPage(spineDir: string, viewType: string): string {
  const dataPath = path.join(spineDir, 'view', 'data', `${viewType}.json`);
  const rawData = loadJson<Record<string, unknown>>(dataPath);

  if (!rawData) {
    return renderErrorPage(viewType, `View data not found for "${viewType}".`);
  }

  const summary = (rawData.summary as string) || '';
  const generatedAt = (rawData.generatedAt as string) || '';
  const items = (rawData.items || rawData.modules || []) as Record<string, unknown>[];
  const totalCount = rawData.totalCount as number | undefined;

  // Build HTML from items
  let itemsHtml = '';
  if (items.length > 0) {
    itemsHtml = `<div class="item-count">${items.length} item${items.length > 1 ? 's' : ''}${totalCount && totalCount > items.length ? ` (${totalCount} total)` : ''}</div>`;
    for (const item of items) {
      const pathStr = (item.entrypoint || item.hotspotPath || item.id || '') as string;
      const summaryStr = (item.summary || item.role || '') as string;
      const confidence = item.confidence as number | undefined;
      const totalScore = item.totalScore as number | undefined;
      const symbols = (item.symbols || []) as string[];
      const riskFactors = (item.riskFactors || []) as string[];
      const kind = item.kind as string | undefined;
      const impactHint = item.impactRadiusHint as string | undefined;

      let metaHtml = '';
      if (kind) {
        metaHtml += `<span class="stat stat-blue">${kind}</span> `;
      }
      if (totalScore) {
        const cls = totalScore > 60 ? 'score-high' : totalScore > 35 ? 'score-med' : 'score-low';
        metaHtml += `<span class="score-badge ${cls}">${totalScore}</span> `;
      }
      if (confidence) {
        const cls = confidence > 0.7 ? 'score-high' : confidence > 0.5 ? 'score-med' : 'score-low';
        metaHtml += `<span class="score-badge ${cls}">${Math.round(confidence * 100)}%</span> `;
      }
      if (impactHint) {
        metaHtml += `<span style="font-size:11px;color:#5a6a7e;display:block;margin-top:4px;">${escapeHtml(impactHint)}</span> `;
      }

      let symbolHtml = '';
      if (symbols.length > 0) {
        symbolHtml = `<div class="symbol-list">${symbols
          .map((s) => `<span class="symbol-tag">${escapeHtml(s)}</span>`)
          .join('')}</div>`;
      }

      let riskHtml = '';
      if (riskFactors.length > 0) {
        riskHtml = `<div class="symbol-list" style="margin-top:6px;">${riskFactors
          .map((f) => `<span class="score-badge score-low">${escapeHtml(f)}</span>`)
          .join('')}</div>`;
      }

      itemsHtml += `
      <div class="item-card">
        <div class="item-header">
          <div class="item-path">${escapeHtml(pathStr)}</div>
          <div class="item-meta">${metaHtml}</div>
        </div>
        <div class="item-summary">${escapeHtml(summaryStr)}</div>
        ${symbolHtml}
        ${riskHtml}
      </div>`;
    }
  } else {
    itemsHtml = '<p style="color:#5a6a7e;text-align:center;padding:20px;">No items to display.</p>';
  }

  // Check for SVG companion
  const svgPath = path.join(spineDir, 'view', 'pages', `${viewType}.svg`);
  let svgHtml = '';
  if (fs.existsSync(svgPath)) {
    try {
      const svgContent = fs.readFileSync(svgPath, 'utf-8');
      svgHtml = `<div style="background:#fff;border-radius:10px;padding:16px;margin-top:20px;text-align:center;">${svgContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')}</div>`;
    } catch {
      // ignore SVG read errors
    }
  }

  // Attempt to render markdown page
  const mdPath = path.join(spineDir, 'view', 'pages', `${viewType}.md`);
  let mdHtml = '';
  if (fs.existsSync(mdPath)) {
    try {
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      mdHtml = mdToHtml(mdContent);
    } catch {
      // ignore
    }
  }

  const projectName = path.basename(spineDir.replace('/.spine', ''));

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(viewType)} — ${escapeHtml(projectName)}</title>
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="topbar">
  <div>
    <h1>${escapeHtml(viewType)}</h1>
    <div class="subtitle">${escapeHtml(projectName)}</div>
  </div>
  <div class="meta">${generatedAt ? new Date(generatedAt).toLocaleString() : ''}</div>
</div>
<div class="container">
  <a class="back" href="/">&larr; Dashboard</a>
  <div class="nav-tabs">
    <a class="nav-tab active" href="/view/${viewType}">Overview</a>
    <a class="nav-tab" href="/raw/${viewType}">Raw JSON</a>
  </div>

  ${summary ? `<p style="color:#5a6a7e;margin-bottom:16px;">${escapeHtml(summary)}</p>` : ''}

  ${svgHtml}

  ${mdHtml ? `<div class="view-content">${mdHtml}</div>` : ''}

  <h3>${items.length > 0 ? 'Items' : 'Data'}</h3>
  ${itemsHtml}

  <div class="footer">
    <a href="/raw/${viewType}" style="color:#1a56db;">View Raw JSON</a>
  </div>
</div>
</body>
</html>`;
}

function renderRawJsonPage(spineDir: string, viewType: string): string {
  const dataPath = path.join(spineDir, 'view', 'data', `${viewType}.json`);
  const rawData = loadJson<Record<string, unknown>>(dataPath);
  const jsonStr = rawData ? JSON.stringify(rawData, null, 2) : '{}';
  const projectName = path.basename(spineDir.replace('/.spine', ''));

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(viewType)} JSON — ${escapeHtml(projectName)}</title>
<style>${PAGE_CSS}
  pre.json-display { background:#1a1a2e; color:#e8e8e8; padding:24px; border-radius:10px; font-size:13px; overflow-x:auto; }
</style>
</head>
<body>
<div class="topbar">
  <div>
    <h1>${escapeHtml(viewType)}</h1>
    <div class="subtitle">Raw JSON data</div>
  </div>
</div>
<div class="container">
  <a class="back" href="/view/${viewType}">&larr; Back to view</a>
  <pre class="json-display"><code>${escapeHtml(jsonStr)}</code></pre>
</div>
</body>
</html>`;
}

function renderErrorPage(viewType: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Error — ArchSpine</title><style>${PAGE_CSS}</style>
</head>
<body>
<div class="container" style="padding-top:40px;">
  <a class="back" href="/">&larr; Dashboard</a>
  <div class="error"><strong>${escapeHtml(viewType)}</strong>: ${escapeHtml(message)}</div>
</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

export interface ViewServerOptions {
  spineDir: string;
  port?: number;
}

export function startViewServer(options: ViewServerOptions): http.Server {
  const { spineDir, port = DEFAULT_PORT } = options;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${port}`);
    const pathname = url.pathname;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (pathname === '/' || pathname === '') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDashboard(spineDir));
      return;
    }

    // Raw JSON view
    const rawMatch = pathname.match(/^\/raw\/([a-z-]+)$/);
    if (rawMatch) {
      const viewType = rawMatch[1];
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderRawJsonPage(spineDir, viewType));
      return;
    }

    // View page
    const viewMatch = pathname.match(/^\/view\/([a-z-]+)$/);
    if (viewMatch) {
      const viewType = viewMatch[1];
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderViewPage(spineDir, viewType));
      return;
    }

    // Serve generated SVG diagram directly
    const svgMatch = pathname.match(/^\/view\/([a-z-]+\.svg)$/);
    if (svgMatch) {
      const svgFile = path.join(spineDir, 'view', 'pages', svgMatch[1]);
      if (fs.existsSync(svgFile)) {
        const content = fs.readFileSync(svgFile, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
        res.end(content);
        return;
      }
    }

    // Serve generated markdown as raw text
    const mdMatch = pathname.match(/^\/view\/([a-z-]+\.md)$/);
    if (mdMatch) {
      const mdFile = path.join(spineDir, 'view', 'pages', mdMatch[1]);
      if (fs.existsSync(mdFile)) {
        const content = fs.readFileSync(mdFile, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
        res.end(content);
        return;
      }
    }

    // Data JSON API endpoint
    const dataMatch = pathname.match(/^\/data\/([a-z-]+\.json)$/);
    if (dataMatch) {
      const dataFile = path.join(spineDir, 'view', 'data', dataMatch[1]);
      if (fs.existsSync(dataFile)) {
        const content = fs.readFileSync(dataFile, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(content);
        return;
      }
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<html><body style="font-family:sans-serif;padding:40px;">
      <h1>404</h1>
      <p>Not found: ${escapeHtml(pathname)}</p>
      <a href="/" style="color:#1a56db;">Back to Dashboard</a>
    </body></html>`);
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n  🏗️  ArchSpine View Dashboard\n`);
    console.log(`  Local:   ${url}`);
    console.log(`  Network: http://${getLocalIp()}:${port}\n`);
    console.log(`  Views available:`);
    console.log(`  ${url}/view/public-surface`);
    console.log(`  ${url}/view/risk-hotspots`);
    console.log(`  ${url}/view/agent-briefing`);
    console.log(`  ${url}/view/architecture-diagram`);
    console.log(`  ${url}/view/project-health`);
    console.log(`  ${url}/view/change-impact`);
    console.log(`\n  Press Ctrl+C to stop.\n`);
  });

  return server;
}

function getLocalIp(): string {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch {
    // ignore
  }
  return '127.0.0.1';
}
