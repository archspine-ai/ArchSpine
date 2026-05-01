<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src/api","role":"This directory contains metadata definitions for indexing and analyzing source code files within the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory define the structural metadata schema for source code directories and files, including indexing provenance, dependency graphs, and architectural rule enforcement.","children":[{"filePath":"examples/demo-project/.spine/index/src/api/folder.json","role":"Defines the structural metadata and indexing provenance for a source code directory within the ArchSpine mirror system.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/api/handler.ts.json","role":"Defines the semantic metadata, dependency graph, and structural skeleton for a single source file within the ArchSpine mirror system.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.797Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine API Metadata Directory

This directory (`api/`) holds the core metadata definitions that power the indexing and analysis layer of the ArchSpine mirror system. It defines the structural schema for source code directories and files, including indexing provenance, dependency graphs, and architectural rule enforcement.

## Notable Children

- **`folder.json`** – Defines the structural metadata and indexing provenance for a source code directory within the ArchSpine mirror system. This file acts as the schema for how directories are represented in the mirror.
- **`handler.ts.json`** – Defines the semantic metadata, dependency graph, and structural skeleton for a single source file. This is the per-file metadata descriptor that captures imports, exports, and architectural relationships.

## Key Implementation Areas

- **Indexing Provenance** – Both files track when and how they were indexed, including the pipeline stages used (AST parsing and LLM analysis).
- **Dependency Graphs** – The `handler.ts.json` file specifically captures the dependency graph of the source file, enabling architectural analysis.
- **Structural Skeleton** – The metadata includes a structural skeleton of the source code, allowing the mirror system to understand code organization without re-parsing the original files.
- **Architectural Rule Enforcement** – The metadata schema supports enforcement of architectural rules by providing a standardized representation of code structure and dependencies.