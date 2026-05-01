# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the TypeScript implementation: `cli/` for the entrypoint and modular command handlers (`cli/commands/`), `core/` and `engines/` for pipeline logic, `services/` for runtime orchestration, `infra/` for config, MCP, LLM, and persistence code, and `assets/templates/` plus `ast/rules/` for bundled rule assets. `tests/` holds the default Vitest product coverage. Research-oriented benchmark and corpus assets live under `research/bench/`. Public docs live in `docs/` with Chinese mirrors under `docs/zh-CN/`. JSON schemas are in `schemas/`, and `examples/demo-project/` is the reference demo workspace.

## Build, Test, and Development Commands

Use Node.js 20+.

- `npm install`: install dependencies from `package-lock.json`.
- `npm run build`: compile `src/` into `dist/` via `scripts/build.mjs`.
- `npm test`: run the full Vitest suite in `tests/`.
- `npm run test:schema`: run schema compliance checks only.
- `npm run validate`: validate protocol and asset integrity.
- `npm run docs:dev`: start the VitePress docs server locally.
- `node dist/cli/index.js <command>`: exercise the built CLI, for example `node dist/cli/index.js sync`.

## Coding Style & Naming Conventions

Follow the existing TypeScript style: ES modules, explicit `.js` import suffixes in TS source, `strict` typing, and 2-space indentation. Use `camelCase` for variables/functions, `PascalCase` for classes and types, and kebab-case for most documentation and asset filenames. Keep modules focused by responsibility and place new tests beside the matching domain in `tests/` using `*.test.ts`. Formatter and linter configs (`eslint.config.js`, `.prettierrc`, `.editorconfig`) are checked in — run `npm run lint` and `npm run format:check` before submitting.

## Testing Guidelines

Vitest is configured in `vitest.config.ts` with `tests/**/*.test.ts` and `tests/**/*.bench.ts` patterns for the default product suite. Add or update tests for every behavior change, especially CLI flows, schema validation, and runtime services. Keep research and benchmark fixtures under `research/bench/corpus/` so they stay outside the default open-source CI path.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits such as `fix: harden credential backend persistence` and `feat: add configurable hook sync mode`; optional scopes are acceptable, for example `feat(cli): ...`. Keep commits focused and descriptive. PRs should explain the behavior change, list verification steps, link related issues, and include screenshots or terminal output when changing docs, demos, or CLI UX.

## Documentation & Configuration Notes

When changing public docs, keep English and Chinese entry points aligned. User-facing docs belong in the public docs tree; planning and design material under `docs/design/`, `docs/planning/`, and `docs/archive/` should not be promoted into public navigation without intent.

`docs/temporary-to-be-cleared/` is the temporary working area for recording each new feature and architecture change. When there is a change, record the details and timestamp there first. This directory is the source of truth for interim change notes, so new or modified functionality does not need to be synchronized into `docs/` one by one. A periodic cleanup/sync agent will later consolidate and move the relevant content into the formal docs.

<!-- ARCHSPINE:BEGIN -->

## ArchSpine Instructions

Before planning or editing, consult the repository's ArchSpine context.

- **Context First**: Always prioritize reading `.spine/atlas/` (for file-level semantic summaries) and `.spine/view/pages/` (for system-level architecture summaries) before broad workspace search.
- **Precise Data**: Use `.spine/index/**` only when you need precise, structured data (e.g., exact dependency lists, line counts, or rule violation details) that isn't covered in the summaries.
- **MCP Access**: Prefer the local MCP server for repository structure and ArchSpine context.
- **Control Plane**: Treat `.spine/config.json` and `.spine/rules/**` as the main human-reviewed control-plane files.
- **Protected Outputs**: Do not directly modify generated `.spine/index/**`, `.spine/atlas/**`, or `.spine/view/**` content.
- **Refresh**: Use `spine sync` to refresh ArchSpine-managed outputs instead of manual edits.
<!-- ARCHSPINE:END -->
