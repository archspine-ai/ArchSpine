<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index","role":"Root configuration and structural index for the ArchSpine mirror system.","responsibility":"Establishes the foundational metadata, indexing, and rule framework for the ArchSpine mirror system, enabling configuration management, semantic analysis, drift detection, dependency graph management, change intent recording, and rule engine organization.","children":[{"filePath":"examples/demo-project/.spine/index/.spine","role":"This directory serves as the root configuration and structural index for the ArchSpine mirror system, defining system identity, file tracking, and rule engine organization.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/README.md.json","role":"Metadata index entry for a documentation file (README.md) within the ArchSpine mirror system","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/demo.gif.json","role":"Metadata index entry for a binary/document file (demo.gif) within the ArchSpine mirror system","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/project.json","role":"Defines the structural layout and metadata of a project for the ArchSpine mirror system, mapping directory modules to their roles and responsibilities.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src","role":"Aggregates metadata and indexing records for the source code directory tree within the ArchSpine mirror system.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:42.651Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Mirror System: `examples/demo-project/.spine/index`

This directory serves as the **root configuration and structural index** for the ArchSpine mirror system. It establishes the foundational metadata, indexing rules, and organization framework that enable all higher-level mirror operations.

## Notable Children

- **`.spine/`** — A hidden folder that holds internal system metadata and rule engine configuration. It defines system identity, file tracking policies, and how the rule engine is organized.
- **`project.json`** — Defines the structural layout and metadata of the entire project, mapping directory modules to their roles and responsibilities. This is the top-level configuration file that orchestrates the mirror's understanding of the project.
- **`README.md.json`** and **`demo.gif.json`** — Metadata index entries for documentation and binary assets. They track the state and semantics of these files for drift detection and change intent recording.
- **`src/`** — Aggregates metadata and indexing records for the source code tree. It is the primary entry point for all source code analysis.

## Key Implementation Areas

The submodules here directly support:

- **Configuration Management** — `project.json` and the `.spine` folder hold the system's identity and structural rules.
- **Semantic Analysis & Drift Detection** — Index entries (`.json` files) enable comparison between the current state and the indexed metadata.
- **Dependency Graph Management** — The `src/` folder hierarchy is designed to capture dependency relationships among source modules.
- **Change Intent Recording** — Each indexed file carries provenance information (indexedAt, generatorVersion, pipelineStages) that tracks how and when the metadata was created.
- **Rule Engine Organization** — The `.spine/` folder contains the rule definitions that govern all mirror operations.

The combination of these concrete submodules makes this directory the central nervous system of the ArchSpine mirror, providing both humans and AI agents with a comprehensive view of project structure and state.