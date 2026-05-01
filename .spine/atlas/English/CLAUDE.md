# ArchSpine Project Overview

## Purpose

This document serves as the central onboarding and governance reference for the ArchSpine project. It explains why ArchSpine exists — to embed a physical `.spine/` control plane inside Git repositories, making codebases queryable, governable, and auditable for AI-assisted engineering. It also defines the technical stack, development conventions, and strict commit discipline required to maintain the integrity of the `.spine/` distribution artifact.

## Who Should Read This

The intended audience includes developers, AI agents, and maintainers who need to understand the project's architecture, contribute code, or operate the spine sync pipeline. The document assumes familiarity with TypeScript, Node.js, Git, and conventional commits. It is particularly relevant for anyone working on or with the `.spine/` control plane files.

## Key Decisions and Workflows

### Tech Stack and Conventions

The project uses TypeScript 5 (strict mode, ESM), Node.js >=20, Vitest for testing, ESLint with Prettier for linting, VitePress for documentation, better-sqlite3 for local caching, @ast-grep/napi for AST extraction across multiple languages, and the MCP SDK for STDIO server communication. Code conventions mandate ES modules with `.js` import suffixes, 2-space indentation, camelCase/PascalCase naming, and Conventional Commits with optional scopes.

### Architecture Layers

The source code is organized into nine layers under `src/`:

- **cli/** — Entrypoint and command dispatch (thin layer)
- **core/** — Domain types, errors, pipeline, task state
- **engines/** — Business logic (scanner, rules, checker, fixer, context)
- **services/** — Runtime orchestration (sync, check, fix, view)
- **infra/** — Infrastructure (config, DB, LLM, MCP, I/O, prompt)
- **tasks/** — Individual task implementations
- **types/** — Protocol type definitions
- **utils/** — Shared utilities
- **ast/** — AST extraction and language discovery

### Commit Discipline

The `.spine/` directory is a distribution artifact tracked in Git. It must follow strict commit discipline:

1. **Source changes first, then sync**: Modify logic (src/, rules/, etc.) → `npm run build` → commit source changes. Then run `spine sync` separately → commit `.spine/` updates. These must be two distinct commits.
2. **No `.spine/` noise in source commits**: If `.spine/` has dirty changes, restore it with `git checkout -- .spine/` before committing source code. Exceptions: `.spine/config.json` and `.spine/rules/**` are human-reviewed control plane files that can be committed with source changes.
3. **Agent workflow**: AI agents must use `node dist/cli/index.js sync` to refresh `.spine/`, never edit generated files directly. Always run `git status` before committing to verify correct file classification.

### Documentation Requirements

All documentation must be bilingual (English and Simplified Chinese), with entry points kept aligned. Design and planning documents under `docs/design/`, `docs/planning/`, and `docs/archive/` should not be promoted into public navigation. Interim change notes for docs should be recorded in `docs/temporary-to-be-cleared/` first, with a periodic sync agent handling consolidation.