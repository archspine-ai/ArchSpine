<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/atlas","role":"This directory contains the core template definitions for documenting components, documents, folders, projects, and sources within the ArchSpine mirror system.","responsibility":"Collectively, these templates provide a standardized and extensible documentation framework that ensures consistency, clarity, and completeness across all architectural artifacts in the ArchSpine mirror system, serving both human readers and AI agents.","children":[{"filePath":"src/assets/templates/atlas/config.md","role":"Template for documenting a component or module within the ArchSpine mirror system, providing a standardized structure for describing its purpose, parameters, stability, and risks.","fileKind":"document"},{"filePath":"src/assets/templates/atlas/document.md","role":"Template for documenting the narrative purpose, audience, and key insights of a project document within the ArchSpine mirror system","fileKind":"document"},{"filePath":"src/assets/templates/atlas/folder.md","role":"To define the architectural role, responsibilities, and boundaries of a specific component or subsystem within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/assets/templates/atlas/project.md","role":"System vision and module orchestration document for the ArchSpine mirror architecture","fileKind":"document"},{"filePath":"src/assets/templates/atlas/source.md","role":"Defines the narrative purpose and architectural role of a document within the ArchSpine mirror system.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.171Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/assets/templates/atlas` — Template Definitions for the ArchSpine Mirror System

This directory holds the core template definitions that standardize how architectural artifacts are documented within the ArchSpine mirror system. Each template enforces a consistent structure for describing components, documents, folders, projects, and source files, ensuring that both human readers and AI agents can reliably interpret and process architectural knowledge.

## Notable Children

- **`config.md`** — Template for documenting a component or module. Provides a standardized structure for describing purpose, parameters, stability, and risks.
- **`document.md`** — Template for documenting the narrative purpose, audience, and key insights of a project document.
- **`folder.md`** — Defines the architectural role, responsibilities, and boundaries of a specific component or subsystem.
- **`project.md`** — System vision and module orchestration document for the ArchSpine mirror architecture.
- **`source.md`** — Defines the narrative purpose and architectural role of a document within the mirror system.

## Implementation Areas

The most critical implementation areas are:

- **Component documentation** (`config.md`) — Ensures every module has a clear purpose, parameter list, stability indicator, and risk assessment.
- **Project orchestration** (`project.md`) — Provides the high-level vision and module coordination that ties the entire mirror system together.
- **Folder and subsystem boundaries** (`folder.md`) — Defines clear architectural boundaries and responsibilities for each subsystem.
- **Document narrative** (`document.md` and `source.md`) — Standardizes how documents describe their audience, purpose, and key insights.

These templates collectively form the backbone of the ArchSpine documentation framework, enabling consistent, complete, and machine-readable architectural records.