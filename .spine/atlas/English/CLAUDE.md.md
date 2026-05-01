<!-- spine-content-hash:6bf4d8bb67e0b32344c867a0012f555d6e2064ee80bf311468f4db7bf263c1df -->
# ArchSpine Project Overview

## Purpose

This document serves as the central onboarding and governance reference for the ArchSpine project. It explains why ArchSpine exists — to embed a physical `.spine/` control plane inside Git repositories, making codebases queryable, governable, and auditable for AI-assisted engineering. It also defines the technical stack, development conventions, and strict commit discipline required to maintain the integrity of the `.spine/` distribution artifact.

## Context and Audience

The intended audience includes developers, AI agents, and maintainers who need to understand the project's architecture, contribute code, or operate the spine sync pipeline. The document assumes familiarity with TypeScript, Node.js, Git, and conventional commits. It is particularly relevant for anyone working on or with the `.spine/` control plane files.

## Key Responsibilities

- Describes the ArchSpine project's purpose as an architectural governance and semantic layer for AI-assisted engineering
- Documents the tech stack, common commands, code conventions, and architecture layers
- Defines the Git workflow, commit discipline, and maintenance boundaries for the `.spine/` control plane
- Specifies bilingual documentation requirements and pipeline usage

## Out of Scope

- Detailed API reference or function-level documentation
- Tutorials or step-by-step usage guides
- Contributor licensing or community governance policies
- Historical changelog or release notes

## Key Takeaways

- ArchSpine is an open-source protocol and toolchain that creates a `.spine/` control plane inside Git repos for AI-era governance
- The tech stack is TypeScript 5 (strict, ESM), Node.js >=20, Vitest, ESLint, Prettier, VitePress, better-sqlite3, `@ast-grep/napi`, and MCP SDK
- Code conventions include ES modules with `.js` import suffixes, 2-space indentation, camelCase/PascalCase naming, and Conventional Commits with optional scopes
- The architecture is layered into `cli/`, `core/`, `engines/`, `services/`, `infra/`, `tasks/`, `types/`, `utils/`, and `ast/`
- Commit discipline requires separating source changes from `.spine/` sync updates into two distinct commits, with exceptions only for human-reviewed control plane files like `config.json` and `rules/`