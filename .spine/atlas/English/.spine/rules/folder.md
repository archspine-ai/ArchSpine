<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","responsibility":"Collectively, these files define and enforce the layered module architecture, import boundaries, naming conventions, and coding standards for the entire ArchSpine monorepo, ensuring consistency and maintainability across all contributions.","children":[{"filePath":".spine/rules/layered-architecture.yml","role":"Architectural constraint rulebook for the ArchSpine project's layered module structure","fileKind":"document"},{"filePath":".spine/rules/naming-conventions.yml","role":"Defines naming conventions and coding standards for the ArchSpine monorepo codebase.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.132Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.spine/rules` — Architectural & Coding Standard Rulebooks

This directory contains the two foundational rulebooks that govern the structure and conventions of the ArchSpine project. Together, they define the layered module architecture, import boundaries, naming conventions, and coding standards for the entire monorepo, ensuring consistency and maintainability across all contributions.

## Notable Children

- **`layered-architecture.yml`** — The architectural constraint rulebook that enforces the project's layered module structure, including dependency direction and module boundaries.
- **`naming-conventions.yml`** — Defines naming conventions and coding standards for the entire ArchSpine codebase, covering files, classes, functions, and variables.

## Implementation Areas

The most critical implementation areas governed by these rules are:

- **Layered module architecture** — Enforcing strict dependency direction between layers (e.g., presentation → application → domain → infrastructure).
- **Import boundaries** — Preventing cross-layer violations and ensuring modules only import from allowed layers.
- **Naming conventions** — Standardizing identifiers across the monorepo to improve readability and tooling support.
- **Coding standards** — Establishing consistent formatting, documentation, and style guidelines for all contributions.