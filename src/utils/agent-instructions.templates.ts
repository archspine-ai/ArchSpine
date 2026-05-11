export const AGENT_BLOCK_START = '<!-- ARCHSPINE:BEGIN -->';
export const AGENT_BLOCK_END = '<!-- ARCHSPINE:END -->';

export const ARCHSPINE_AGENT_BLOCK = [
  '<!-- ARCHSPINE:BEGIN -->',
  '## ArchSpine Instructions',
  '',
  "Before planning or editing, consult the repository's ArchSpine context.",
  '',
  '- If ArchSpine is not installed locally, use `npx --yes archspine@latest try` for a read-only preview before opting into deeper setup.',
  '- Prefer the local MCP server for repository structure and ArchSpine context before broad workspace search.',
  '- Read `.spine/rules/` and relevant `.spine` control-plane context before major changes.',
  '- Default to not searching generated `.spine/index/**` content unless you are explicitly debugging ArchSpine outputs.',
  '- Treat `.spine/config.json` and `.spine/rules/**` as the main human-reviewed control-plane files.',
  '- Do not directly modify protected `.spine` outputs such as `.spine/index/**`.',
  '- Refresh ArchSpine-managed outputs through `spine` commands instead of manual edits.',
  '<!-- ARCHSPINE:END -->',
].join('\n');

export const ARCHSPINE_V2_BLOCK_START = '<!-- ARCHSPINE_V2:BEGIN -->';
export const ARCHSPINE_V2_BLOCK_END = '<!-- ARCHSPINE_V2:END -->';

export const ARCHSPINE_V2_BRIEFING_CONTENT = [
  '## ArchSpine V2 Knowledge Graph (available)',
  '',
  'This repository has a `.spine/` control plane with machine-readable architecture data:',
  '',
  "- Read `.spine/view/pages/agent-briefing.md` for the project's module topology, tech stack, entry points, and architecture constraints.",
  '- Read `.spine/view/pages/project-health.md` for cycle dependencies, dead code suspects, hub module risks, and active violations.',
  '- Load `.spine/view/data/knowledge-graph.json` for programmatic graph queries (nodes, edges with compliance status).',
  '- Open `.spine/view/pages/architecture-diagram.svg` in a browser for a visual module dependency diagram.',
  '',
  'Before making changes to any module, check:',
  '- Its upstream/downstream dependencies (use MCP tools)',
  "- Whether it's in a cycle or marked as a hub (check diagnostics)",
  '- Any active rule violations that constrain edits',
  '',
  'The `.spine/` is kept in sync via `spine sync`. If the data seems stale, suggest re-syncing.',
];

export const ARCHSPINE_V2_BRIEFING_BLOCK = [
  ARCHSPINE_V2_BLOCK_START,
  ...ARCHSPINE_V2_BRIEFING_CONTENT,
  ARCHSPINE_V2_BLOCK_END,
].join('\n');

export const ARCHSPINE_MCP_BLOCK_START = '<!-- ARCHSPINE_MCP:BEGIN -->';
export const ARCHSPINE_MCP_BLOCK_END = '<!-- ARCHSPINE_MCP:END -->';

export const ARCHSPINE_MCP_TOOLS_CONTENT = [
  '## ArchSpine MCP Tools',
  '',
  'When the ArchSpine MCP server is connected, prefer these tools over grep/file search for structural queries:',
  '',
  '1. `spine_query_graph` — Query the module dependency graph (filter by from/to/type/compliant/layer)',
  '2. `spine_match_semantic` — Find modules by keyword matching on role/responsibilities',
  '3. `spine_get_diagnostics` — Get cycle dependencies, dead code, or hub module reports',
  '4. `spine_get_change_impact` — Compute the downstream impact of changing a file (BFS, configurable depth)',
  "5. `spine_get_module_context` — Get a module's full context: semantic info, dependencies, violations, diagnostics",
  '',
  'Use these tools when you need to:',
  '- Understand how modules are connected',
  '- Find the right module to edit for a given task',
  '- Assess the risk of a proposed change',
  '- Check whether architectural rules are being violated',
];

export const ARCHSPINE_MCP_TOOLS_BLOCK = [
  ARCHSPINE_MCP_BLOCK_START,
  ...ARCHSPINE_MCP_TOOLS_CONTENT,
  ARCHSPINE_MCP_BLOCK_END,
].join('\n');

export const ARCHSPINE_HEALTH_BLOCK_START = '<!-- ARCHSPINE_HEALTH:BEGIN -->';
export const ARCHSPINE_HEALTH_BLOCK_END = '<!-- ARCHSPINE_HEALTH:END -->';

export const ARCHSPINE_HEALTH_CONTENT = [
  '## ArchSpine Health Snapshot',
  '',
  'Check `.spine/view/pages/project-health.md` for the latest health report before significant changes:',
  '',
  '- **Cycle dependencies**: Modules involved in circular imports — breaking cycles is architectural priority',
  '- **Dead code suspects**: Modules with zero incoming dependencies — verify before removing',
  '- **Hub modules**: High fan-in modules that are architectural chokepoints — changes here have wide impact',
  '- **Active violations**: Architecture rule violations grouped by rule — understand constraints before editing',
  '',
  'If the health report is stale (more than a few commits behind), run `spine sync` to refresh.',
];

export const ARCHSPINE_HEALTH_BLOCK = [
  ARCHSPINE_HEALTH_BLOCK_START,
  ...ARCHSPINE_HEALTH_CONTENT,
  ARCHSPINE_HEALTH_BLOCK_END,
].join('\n');

export type ArtifactStrategy = 'local' | 'distributable';

export const SEARCH_IGNORE_PATH = '.ignore';
export const SPINEIGNORE_PATH = '.spineignore';
export const SEARCH_IGNORE_LINES = [
  '.spine/index/',
  '.spine/cache.db*',
  '.spine/.lock',
  '.spine/diagnostics/',
];
export const SEARCH_IGNORE_CONTENT = SEARCH_IGNORE_LINES.join('\n');

export const SPINEIGNORE_BLOCK_START = '# >>> ArchSpine recommended >>>';
export const SPINEIGNORE_BLOCK_END = '# <<< ArchSpine recommended <<<';
export const SPINEIGNORE_RECOMMENDED_LINES = [
  '# Recommended semantic exclusions for high-noise, low-information local and generated content.',
  '# Human-facing repository docs usually already have an authoritative readable form.',
  '# Edit or remove these suggestions if they are intentional architecture inputs in this repository.',
  '',
  '# Common local secrets',
  '.env',
  '.env.*',
  '*.pem',
  '*.key',
  '*.p12',
  '*.pfx',
  '*.crt',
  '*.cer',
  '',
  '# Common generated, cache, and runtime noise not worth indexing by default',
  '.next/',
  '.nuxt/',
  '.svelte-kit/',
  '.parcel-cache/',
  '.turbo/',
  '.cache/',
  'tmp/',
  'temp/',
  '__pycache__/',
  '.pytest_cache/',
  '.mypy_cache/',
  '.tox/',
  '.venv/',
  'venv/',
  'target/',
  '',
  '# Common semantic-noise outputs',
  'docs/',
  'README.md',
  'README.en.md',
  'README.zh-CN.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CODE_OF_CONDUCT.md',
  'docs/.vitepress/dist/',
  'externaldocs/',
  '',
  '# Keep repository automation and control-plane inputs indexable by default',
  '!schemas/',
  '!.github/workflows/',
];

export const ARCHSPINE_PACKAGE_SCRIPTS: Record<string, string> = {
  'spine:init': 'npx --yes archspine@latest init',
  'spine:sync': 'npx --yes archspine@latest sync',
  'spine:check': 'npx --yes archspine@latest check',
  'spine:fix': 'npx --yes archspine@latest fix',
};

export const GITIGNORE_BLOCK_START = '# >>> ArchSpine managed >>>';
export const GITIGNORE_BLOCK_END = '# <<< ArchSpine managed <<<';
export const GITATTRIBUTES_BLOCK_START = '# >>> ArchSpine managed >>>';
export const GITATTRIBUTES_BLOCK_END = '# <<< ArchSpine managed <<<';

export const LOCAL_GITIGNORE_LINES = [
  '.spine/cache.db*',
  '.spine/.lock',
  '.spine/runtime/',
  '.spine/protected-output-baseline.json',
  '.spineignore.local',
  '.spine/index/',
  '.spine/manifest.json',
  '.spine/languages.json',
  '.spine/diagnostics/',
  '.mcp.json',
];

export const DISTRIBUTABLE_GITIGNORE_LINES = [
  '.spine/cache.db*',
  '.spine/.lock',
  '.spine/runtime/',
  '.spine/protected-output-baseline.json',
  '.spineignore.local',
  '.mcp.json',
];

export const DISTRIBUTABLE_GITATTRIBUTES_LINES = [
  '.spine/index/** linguist-generated=true',
  '.spine/manifest.json linguist-generated=true',
  '.spine/languages.json linguist-generated=true',
  '.spine/diagnostics/** linguist-generated=true',
];
