# ArchSpine Project Overview and Developer Guide

## Purpose

This document is the central README and developer onboarding guide for the ArchSpine project. It explains why ArchSpine exists, what it does, and how to contribute effectively. It serves as the single source of truth for **repository structure, build processes, code conventions, and governance rules** that both human developers and AI agents must follow.

## Who Should Read This

- **Primary audience:** Developers working on the ArchSpine toolchain itself, including AI agents that need to understand repository layout, build commands, and contribution protocols.
- **Secondary audience:** Contributors exploring the codebase, reviewers, and anyone who needs to grasp the architectural philosophy behind `.spine/`.

## Key Decisions and Workflows Anchored by This Document

### 1. What ArchSpine Is (and Isn't)

ArchSpine is an **open-source protocol and toolchain** that builds a physical `.spine/` control plane inside Git repositories. This control plane makes codebases queryable, governable, and auditable for AI-assisted engineering. It is **not** a user manual or detailed API reference — those live in `docs/`.

### 2. Technology Stack and Build Pipeline

The project uses **TypeScript 5 (strict mode, ESM)** on **Node.js ≥20**, with **Vitest** for testing, **ESLint + Prettier** for code quality, and **VitePress** for documentation. Key commands (build, test, lint, validate, sync) are standardized in the README.

### 3. Code Conventions and Architecture Layers

- ES modules with explicit `.js` import suffixes, `strict: true`, 2-space indentation.
- `camelCase` variables/functions, `PascalCase` classes/types.
- Conventional Commits with optional scopes (e.g., `feat(cli): …`).
- Architecture layers are clearly defined: `cli/`, `core/`, `engines/`, `services/`, `infra/`, `tasks/`, `types/`, `utils/`, `ast/`.

### 4. Git Workflow and Commit Discipline

- Feature branches from `main`, PR template required.
- **Critical rule:** Source changes and `.spine/` sync must be committed in **separate commits** — never mix them.
- Generated files under `.spine/index/`, `.spine/atlas/`, `.spine/view/` must never be edited directly; use `spine sync` to refresh.
- Human-reviewed files (`.spine/config.json`, `rules/`) can be committed with source changes.

### 5. Bilingual Documentation Requirement

All documentation must be maintained in **English and Simplified Chinese**, with entry points kept aligned. Never publish design/planning docs into public navigation.

### 6. AI Agent Guidelines

- Always use `node dist/cli/index.js sync` to refresh `.spine/` — never edit generated files.
- Verify staged file classification with `git status` before committing.
- Be aware that `spine sync` may take significant time (scans full repo, calls LLM).

---

**This document anchors all architectural governance for the ArchSpine project.** Developers and AI agents should treat it as the authoritative starting point for understanding the repo’s structure, rules, and contribution workflow.