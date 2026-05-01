# ArchSpine Repository Guidelines

## Purpose

This document is the central reference for developers contributing to the ArchSpine project. It defines the repository structure, development workflow, coding conventions, testing expectations, and documentation practices to ensure consistency across contributions.

## Who Should Read This

The intended audience is developers and maintainers working on the ArchSpine codebase. It is particularly relevant for new contributors who need to understand how the project is organized, how to run builds and tests, and how to follow the established conventions for commits, pull requests, and documentation updates. The document also includes ArchSpine-specific instructions for AI agents and developers interacting with the repository's semantic indexing and control plane.

## Key Decisions and Workflows

### Project Structure

Source code lives under `src/` with a clear separation into CLI, core, engines, services, infra, and asset directories. Tests reside in `tests/`, public documentation in `docs/` with Chinese mirrors under `docs/zh-CN/`, and JSON schemas in `schemas/`. The `examples/demo-project/` directory serves as the reference demo workspace.

### Development Environment

Use Node.js 20+ with ES modules and strict TypeScript. Key commands include `npm install` for dependencies, `npm run build` to compile, `npm test` for the full Vitest suite, and `npm run docs:dev` to start the local documentation server.

### Coding Standards

Follow the existing TypeScript style: ES modules, explicit `.js` import suffixes, strict typing, and 2-space indentation. Use `camelCase` for variables and functions, `PascalCase` for classes and types, and kebab-case for documentation and asset filenames. Match surrounding code closely as no dedicated formatter or linter config is checked in.

### Testing Requirements

Add or update tests for every behavior change using Vitest. The default product suite covers `tests/**/*.test.ts` and `tests/**/*.bench.ts`. Focus testing on CLI flows, schema validation, and runtime services.

### Commit and Pull Request Conventions

Follow Conventional Commits format (e.g., `fix:`, `feat:`, `feat(cli):`). Keep commits focused and descriptive. PRs should explain the behavior change, list verification steps, link related issues, and include screenshots or terminal output when changing docs, demos, or CLI UX.

### Documentation Maintenance

Keep English and Chinese documentation aligned when making changes. Use `docs/temporary-to-be-cleared/` as the interim change log for recording new features and architecture changes. A periodic cleanup agent will later consolidate this content into the formal documentation.

### ArchSpine Context Management

ArchSpine context is managed via `.spine/` files. Always consult `.spine/atlas/` for file-level summaries and `.spine/view/pages/` for system-level architecture before broad workspace search. Use `spine sync` to refresh generated outputs—never edit `.spine/index/**`, `.spine/atlas/**`, or `.spine/view/**` directly. Treat `.spine/config.json` and `.spine/rules/**` as the main human-reviewed control-plane files.