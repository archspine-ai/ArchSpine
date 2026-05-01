<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates","role":"This directory contains the core template definitions and documentation standards for the ArchSpine mirror system.","responsibility":"Collectively, these templates provide a standardized and extensible framework for documenting components, generating structured architecture summaries, enforcing architectural and coding standards, and analyzing the public surface and risk profile of the ArchSpine project, ensuring consistency and completeness across all architectural artifacts for both human readers and AI agents.","children":[{"filePath":"src/assets/templates/atlas","role":"This directory contains the core template definitions for documenting components, documents, folders, projects, and sources within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"src/assets/templates/prompts","role":"This directory contains the prompt template engine and schema definitions for generating structured architecture summaries.","fileKind":"folder"},{"filePath":"src/assets/templates/rules","role":"This directory defines the architectural and coding standards for the ArchSpine project.","fileKind":"folder"},{"filePath":"src/assets/templates/view","role":"This directory contains analysis and documentation files that describe the public surface and risk profile of the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.206Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/assets/templates` — Core Template Definitions & Documentation Standards

This directory is the structural backbone of the ArchSpine mirror system. It holds all canonical template definitions, prompt engines, coding rules, and surface-analysis documents that ensure every architectural artifact is consistent, complete, and machine-readable.

## Notable Children

- **`atlas/`** — Contains the core template definitions for documenting components, documents, folders, projects, and sources. This is where the fundamental schema for describing any entity in the mirror lives.
- **`prompts/`** — Houses the prompt template engine and its schema definitions. This submodule drives the generation of structured architecture summaries by feeding context-aware prompts to AI agents.
- **`rules/`** — Defines the architectural and coding standards enforced across the ArchSpine project. These rules govern how code is written, structured, and validated.
- **`view/`** — Provides analysis and documentation files that describe the public surface and risk profile of the project. This is the primary output layer for human and AI consumers.

## Implementation Areas of Highest Importance

- **Template Extensibility** — The `atlas/` submodule must remain flexible enough to accommodate new entity types without breaking existing schemas.
- **Prompt Engine Reliability** — The `prompts/` engine must produce deterministic, well-formed summaries that both humans and AI agents can parse reliably.
- **Rule Enforcement** — The `rules/` submodule should be kept in sync with the actual codebase to prevent drift between documented standards and real-world practices.
- **Surface Analysis Accuracy** — The `view/` documents must accurately reflect the current public API surface and risk posture, requiring regular updates as the project evolves.