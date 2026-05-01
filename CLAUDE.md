# ArchSpine

Architectural Governance & Semantic Layer for the AI Era — an open-source protocol and toolchain that builds a physical `.spine/` control plane inside Git repositories. It makes codebases queryable, governable, and auditable for AI-assisted engineering.

## Tech Stack

- **Language**: TypeScript 5, strict mode, ESM (`"type": "module"`)
- **Runtime**: Node.js >= 20
- **Test**: Vitest (`tests/**/*.test.ts`)
- **Lint**: ESLint flat config + Prettier
- **Docs**: VitePress (`docs/`)
- **DB**: better-sqlite3 (local cache/index)
- **AST**: @ast-grep/napi (C, C++, Go, Java, Python, Rust)
- **MCP**: @modelcontextprotocol/sdk (STDIO server)

## Common Commands

```bash
npm run build          # Compile src/ → dist/ via scripts/build.mjs
npm test               # Run full Vitest suite
npm run test:schema    # Schema compliance tests only
npm run test:ci        # Full CI: build → unit → schema
npm run validate       # Validate protocol asset integrity
npm run lint           # ESLint on src/**/*.ts tests/**/*.ts
npm run lint:fix       # Auto-fix lint issues
npm run format:check   # Prettier check
npm run docs:dev       # Start VitePress docs server
npm run release:gate   # Pre-release checks
npm run pack:check     # Dry-run npm pack
node dist/cli/index.js <command>  # Exercise built CLI
```

## Code Conventions

- ES modules with explicit `.js` import suffixes in TS source
- TypeScript `strict: true`, ESNext target
- 2-space indentation
- `camelCase` variables/functions, `PascalCase` classes/types
- `*.test.ts` naming for test files, mirror source structure under `tests/`
- Prettier: 100 printWidth, singleQuote, trailingComma: all
- ESLint: no-unused-vars (ignore `_` prefix), prefer-const, eqeqeq always, curly all
- `no-console` is error in `services/`, `tasks/`, `infra/` — allowed in `tests/`, `scripts/`, `cli/`
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`, `style:`
- Optional scopes: `feat(cli): add interactive guide`

## Architecture Layers

```
src/
├── cli/           # Entrypoint & command dispatch (thin layer)
├── core/          # Domain types, errors, pipeline, task state
├── engines/       # Business logic (scanner, rules, checker, fixer, context)
├── services/      # Runtime orchestration (sync, check, fix, view)
├── infra/         # Infrastructure (config, DB, LLM, MCP, I/O, prompt)
├── tasks/         # Individual task implementations
├── types/         # Protocol type definitions
├── utils/         # Shared utilities
└── ast/           # AST extraction & language discovery
```

## Git Workflow

- Feature branches from `main`: `git checkout -b feature/AmazingFeature`
- Conventional Commits with optional scopes
- PR template requires: Summary, Motivation, Testing checklist, Docs impact

## Key Constraints

- Bilingual documentation (English + Simplified Chinese), keep entry points aligned
- `.spine/` is dogfooding its own protocol — `config.json` and `rules/**` are human-reviewed control plane files
- Never directly modify generated `.spine/index/**`, `.spine/atlas/**`, or `.spine/view/**`
- Use `spine sync` to refresh generated outputs
- When editing docs, record interim change notes in `docs/temporary-to-be-cleared/` first (a periodic sync agent consolidates later)
- Design/planning docs under `docs/design/`, `docs/planning/`, `docs/archive/` should NOT be promoted into public nav

## Pipeline & Commit Discipline

`.spine/` is a distribution artifact — it IS tracked in git and pushed to GitHub so consumers can read the control plane. But it must follow strict commit discipline:

1. **改源 → 编译 → 提源码 → sync → 提 .spine**
   - 修改逻辑（src/、rules/ 等）→ `npm run build` → 提交源码改动
   - 单独运行 `spine sync` → 提交 `.spine/` 刷新
   - 两个步骤分两次 commit，不得混入同一次提交

2. **禁止在源码 commit 中夹带 `.spine/` 噪音**
   - 如果工作区里的 `.spine/` 已有 dirty 改动（格式、缓存等），在提交源码前先用 `git checkout -- .spine/` 还原，让 `.spine/` 跟随 sync 单独提交
   - 例外：`.spine/config.json`、`.spine/rules/**` 等人工 review 的控制面文件可以随源码修改一起提交

3. **Agent 操作规范**
   - 需要刷新 `.spine/` 时，执行 `node dist/cli/index.js sync`（正式管线入口），而不是直接编辑生成文件
   - 提交前必须 `git status` 确认 staged 文件的分类正确
   - `spine sync` 可能需要较长时间（扫描全仓库并调用 LLM），建议在后台运行或提示用户手动执行
