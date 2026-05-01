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
  '- Default to not searching generated `.spine/index/**` or `.spine/atlas/**` content unless you are explicitly debugging ArchSpine outputs.',
  '- Treat `.spine/config.json` and `.spine/rules/**` as the main human-reviewed control-plane files.',
  '- Do not directly modify protected `.spine` outputs such as `.spine/index/**` or `.spine/atlas/**`.',
  '- Refresh ArchSpine-managed outputs through `spine` commands instead of manual edits.',
  '<!-- ARCHSPINE:END -->',
].join('\n');

export type ArtifactStrategy = 'local' | 'distributable';

export const SEARCH_IGNORE_PATH = '.ignore';
export const SPINEIGNORE_PATH = '.spineignore';
export const SEARCH_IGNORE_LINES = [
  '.spine/index/',
  '.spine/atlas/',
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
  'spine:publish': 'npx --yes archspine@latest publish',
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
  '.spine/secrets.json',
  'secrets.json',
  '.spine/index/',
  '.spine/atlas/',
  '.spine/manifest.json',
  '.spine/languages.json',
  '.spine/diagnostics/',
];

export const DISTRIBUTABLE_GITIGNORE_LINES = [
  '.spine/cache.db*',
  '.spine/.lock',
  '.spine/runtime/',
  '.spine/protected-output-baseline.json',
  '.spineignore.local',
  '.spine/secrets.json',
  'secrets.json',
];

export const DISTRIBUTABLE_GITATTRIBUTES_LINES = [
  '.spine/index/** linguist-generated=true',
  '.spine/atlas/** linguist-generated=true',
  '.spine/manifest.json linguist-generated=true',
  '.spine/languages.json linguist-generated=true',
  '.spine/diagnostics/** linguist-generated=true',
];
