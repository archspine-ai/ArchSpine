# ArchSpine Document Summary

## Purpose of This Document

This document serves as the **primary project documentation** for ArchSpine — an open-source protocol and toolchain that embeds a physical `.spine/` control plane inside Git repositories. It explains the project’s high-level vision: making codebases queryable, governable, and auditable for AI-assisted engineering. The document defines all necessary conventions, commands, and discipline guidelines that contributors and maintainers must follow.

## Who Should Read It

- **Developers and maintainers** working directly on ArchSpine itself  
- **AI agents** that interact with the repository (e.g., agent-assisted programming workflows)  
- Anyone who needs to understand how the `.spine/` control plane is built, maintained, and used  

Readers should be familiar with TypeScript, Node.js, and modern Git workflows. This document is the entry point to the project’s structure, development practices, and the strict commit discipline required to keep the `.spine/` artifact consistent.

## Key Decisions & Workflows Anchored by This Document

### Tech Stack & Code Conventions
- Strictly TypeScript 5 ESM, Node.js ≥20, with Vitest, ESLint, Prettier, VitePress, better-sqlite3, @ast-grep/napi, and MCP SDK.  
- Enforced conventions: ES module imports with `.js` suffixes, strict types, 2-space indentation, `camelCase`/`PascalCase` naming, Conventional Commits with optional scopes.  

### Architecture Layers
The source code is organized into nine distinct layers: `cli`, `core`, `engines`, `services`, `infra`, `tasks`, `types`, `utils`, `ast`. Each layer has a clear responsibility, from CLI dispatch to infrastructure and AST extraction.

### Git Workflow & Commit Discipline
- Feature branches from `main`, using Conventional Commits.  
- **Critical rule for `.spine/`**: source changes and `.spine/` sync commits **must be separate** — never mix them.  
- The pipeline flows: modify source → build → commit source → run `spine sync` → commit `.spine/` refresh.  
- Agents must run the formal `spine sync` command (not edit generated files directly) and verify staged file classification before committing.

### Bilingual Documentation
All documentation is maintained in **English** and **Simplified Chinese**, with aligned entry points. Design, planning, and archive documents live in separate directories and are not promoted into public navigation.

### Self-Dogfooding Protocol
The `.spine/` directory uses ArchSpine’s own protocol; `config.json` and `rules/**` are human-reviewed control plane files. Generated outputs (`.spine/index/**`, `.spine/atlas/**`, `.spine/view/**`) must never be edited directly — always refresh via `spine sync`.

---

This document is the single source of truth for ArchSpine’s development conventions, toolchain setup, and operational discipline. All contributors, whether human or AI, should start here.