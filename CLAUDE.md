# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArchSpine is an architectural governance and semantic layer tool for AI coding assistants. It creates a `.spine/` control plane inside a Git repository — a machine-readable semantic index that AI agents query via MCP (Model Context Protocol). The CLI is just the installer; the primary interface is 21 MCP tools, 3 resource templates, and 2 prompt templates.

## Commands

| Command                | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `npm run build`        | Clean build: delete dist, tsc, copy assets, chmod CLI entry |
| `npm run dev:build`    | Faster dev-only build                                       |
| `npm test`             | Unit tests only                                             |
| `npm run test:unit`    | Vitest unit tests (`tests/**/*.test.ts`, excludes e2e)      |
| `npm run test:e2e`     | Vitest e2e tests (`tests/e2e/**/*.test.ts`)                 |
| `npm run test:schema`  | Schema compliance tests                                     |
| `npm run test:ci`      | Full CI: build + unit + schema + e2e                        |
| `npm run lint`         | ESLint on src and tests                                     |
| `npm run lint:fix`     | Autofix lint issues                                         |
| `npm run format:check` | Prettier format check                                       |
| `npm run docs:dev`     | VitePress dev server on port 5173                           |
| `npm run docs:build`   | Build VitePress documentation site                          |
| `npm run validate`     | Validate protocol assets (schemas, examples)                |
| `npm run release:gate` | Pre-release gate checks                                     |
| `npm run pack:check`   | Dry-run npm pack to verify publish snapshot                 |

## Architecture

Strict 6-layer dependency model (enforced by `.spine/rules/layered-architecture.yml`). Each layer may only depend on layers below it:

```
CLI (src/cli/)
  |  Entrypoints & command dispatch. Thin — no pipeline or persistence logic.
  |
Services (src/services/)
  |  Business orchestration: runtime, check, fix, view, rule, init, sync, try.
  |  View subsystem lives under src/services/view/ (6 deterministic views).
  |
Core (src/core/) + Tasks (src/tasks/) + Engines (src/engines/)
  |  Core: pipeline contracts (TaskRunner, SpineTask), shared state, scan policy.
  |  Tasks: pipeline stages (aggregate, validate, knowledge-graph, views, etc.).
  |  Engines: pure logic — scanner (git-tracked + ignore chains), dependency graph
  |  (Tarjan cycle detection, fan-in/out, dead code), rule engine (picomatch), check.
  |
Infrastructure (src/infra/)
  |  Low-level capabilities: SQLite DB facade, LLM clients (OpenAI, Anthropic,
  |  DeepSeek, Google), MCP server (21 tools), config, secrets, index reader.
  |
AST (src/ast/) + Types (src/types/) + Utils (src/utils/)
  |  AST extraction (ast-grep, 14 languages), shared types, utility functions.
```

## Key Subsystems

- **MCP Server** (`src/infra/mcp/`): Full MCP stdio server. Tools in 5 categories — Query (invariants, responsibilities, symbols, graph), Context (file context, change impact, drift), Status (sync, violations, diagnostics), Views (view data, scan preview), Actions (scan, sync, check).
- **Dependency Graph** (`src/engines/dependency-graph.ts`): Builds KnowledgeGraph with module nodes and import edges. Pure deterministic logic — zero LLM cost. Graph diagnostics detect cycles (Tarjan), dead code, hubs.
- **Pipeline** (`src/core/pipeline.ts`): TaskRunner orchestrates SpineTask implementations with timing, memory metrics, checkpoint recording. Runs during `spine build` and `spine sync`.
- **Scanner** (`src/engines/scanner.ts`): Uses git-tracked files + ignore chain (.gitignore, .spineignore, .spineignore.local).
- **LLM Abstraction** (`src/infra/llm/`): Providers for OpenAI, Anthropic, DeepSeek, Google. Configurable via env vars or OS keychain.

## TypeScript Conventions

- ES modules with explicit `.js` extensions in imports: `import { foo } from './bar.js'`
- No `require()`. No `as any`. TypeScript strict mode.
- Prefer `interface` for object types, `type` for unions/utility types.
- Exported functions must have explicit return types.
- File naming: kebab-case. Test files: `*.test.ts`, co-located or mirrored in `tests/`.
- Use `infra/runtime-io.ts` logging utilities instead of `console.log` (error in services/tasks/infra).
- Prettier: 100 print width, single quotes, trailing commas all, 2-space indent.

## Documentation Conventions

- English in `docs/`, Chinese mirror in `docs/zh-CN/`. Update both when changing docs.
- VitePress navigation must be updated when adding new public docs.
- `docs/design/`, `docs/planning/`, `docs/archive/` not in public nav.
- New feature/architecture intermediate records go in `docs/temporary-to-be-cleared/`.

## Testing

- Vitest v4. Unit tests: `tests/**/*.test.ts` (60s timeout). E2E: `tests/e2e/` (120s timeout).
- Test fixtures in `tests/fixtures/`. Helpers in `tests/helpers/`.
- Run single test file: `npx vitest run tests/path/to/file.test.ts --config vitest.config.ts`

## Use MCP Server for Development

Instead of re-running CLI commands directly, start the MCP server for development:

```bash
node dist/cli/index.js mcp start
```

This exposes all 21 MCP tools. Claude Code can then query the semantic index, run scans, and check architectural rules through the MCP interface.

## Architecture Rules

Project ships `.spine/rules/layered-architecture.yml` (6 rules enforcing the layer model) and `naming-conventions.yml`. When adding new modules, ensure they respect the layer dependency direction. Importing upward (e.g., infra importing from services) is a violation.

<!-- ARCHSPINE_MCP:BEGIN -->
## ArchSpine MCP Tools

When the ArchSpine MCP server is connected, prefer these tools over grep/file search for structural queries:

1. `spine_query_graph` — Query the module dependency graph (filter by from/to/type/compliant/layer)
2. `spine_match_semantic` — Find modules by keyword matching on role/responsibilities
3. `spine_get_diagnostics` — Get cycle dependencies, dead code, or hub module reports
4. `spine_get_change_impact` — Compute the downstream impact of changing a file (BFS, configurable depth)
5. `spine_get_module_context` — Get a module's full context: semantic info, dependencies, violations, diagnostics

Use these tools when you need to:
- Understand how modules are connected
- Find the right module to edit for a given task
- Assess the risk of a proposed change
- Check whether architectural rules are being violated
<!-- ARCHSPINE_MCP:END -->
