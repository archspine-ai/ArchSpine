# Repository Guidelines for ArchSpine

## Purpose

This document exists to onboard both human developers and AI agents to the ArchSpine repository. It provides a single source of truth for the project's directory layout, development workflow, coding conventions, and the ArchSpine context layer that governs AI interactions. By centralizing this information, the document ensures consistency across contributions and helps maintainers enforce quality standards.

## Audience

The intended audience includes:

- **Software developers** who need to understand how to navigate, build, test, and contribute to the ArchSpine codebase.
- **Maintainers** responsible for reviewing contributions and enforcing repository standards.
- **AI agents** (such as Claude or Copilot) that require structured guidance on how to interact with the repository, including the ArchSpine control plane and protected outputs.

This is a living reference that should be consulted before making any changes.

## Key Decisions and Workflows Anchored by This Document

The following decisions and workflows are explicitly defined and should be followed by all contributors:

### Project Structure

- Source code lives under `src/` with key directories: `cli`, `core`, `engines`, `services`, `infra`, `assets/templates`, and `ast/rules`.
- Tests reside in `tests/` (for Vitest) and research/benchmark assets in `research/bench/`.
- Public documentation has English and Chinese mirrors; `docs/zh-CN/` must stay aligned with English.
- JSON schemas are in `schemas/`, and `examples/demo-project/` serves as the reference demo.

### Development Workflow

- Node.js 20+ is required.
- Standard commands: `npm install`, `npm run build`, `npm test`.
- Additional commands: `npm run test:schema`, `npm run validate`, `npm run docs:dev`, and direct CLI execution via `node dist/cli/index.js`.

### Coding Style & Conventions

- Strict TypeScript with ES modules, explicit `.js` import suffixes, `strict` typing, and 2-space indentation.
- Naming: `camelCase` for variables/functions, `PascalCase` for classes/types, kebab-case for docs/assets.
- Linting and formatting enforced via ESLint, Prettier, and EditorConfig; run `npm run lint` and `npm run format:check` before submitting.

### Testing Guidelines

- Vitest is the test runner, configured in `vitest.config.ts`.
- Test files follow `*.test.ts` pattern in `tests/`.
- Add or update tests for every behavior change, especially CLI flows, schema validation, and runtime services.
- Separate test suites exist for schema compliance and protocol validation.

### Commit & Pull Request Conventions

- Commits must follow the Conventional Commits format (e.g., `fix:`, `feat:`, `feat(cli):`).
- PRs must include a description of behavior change, verification steps, and links to related issues.
- For changes to docs, demos, or CLI UX, include screenshots or terminal output.

### ArchSpine Context for AI Agents

- The `.spine/` directory acts as a control plane:
  - `.spine/atlas/` for file-level semantic summaries.
  - `.spine/view/pages/` for system-level architecture summaries.
  - `.spine/index/` for precise structured data.
- AI agents should prefer reading from the MCP server over manual file search.
- Never manually edit generated output in `.spine/atlas/`, `.spine/view/`, or `.spine/index/`; instead, use `spine sync` to refresh.
- `.spine/config.json` and `.spine/rules/` are the human-reviewed control-plane files.

### Documentation Maintenance

- Public docs must keep English and Chinese entry points aligned.
- Planning and design material under `docs/design/`, `docs/planning/`, and `docs/archive/` should not be promoted into public navigation without intent.