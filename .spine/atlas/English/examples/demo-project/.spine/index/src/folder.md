<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src","role":"Aggregates metadata and indexing records for the source code directory tree within the ArchSpine mirror system.","responsibility":"Collectively defines the structural metadata schema for source code directories and files, including indexing provenance, dependency graphs, architectural rule enforcement, content integrity tracking, and pipeline stage logging for the src directory and its subdirectories (api, domain, infra).","children":[{"filePath":"examples/demo-project/.spine/index/src/api","role":"This directory contains metadata definitions for indexing and analyzing source code files within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/domain","role":"This directory aggregates metadata and indexing records for a domain source folder within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/folder.json","role":"Defines the structural hierarchy and metadata for the source code directory tree within the ArchSpine project.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/infra","role":"Metadata and indexing layer for the ArchSpine mirror system's database infrastructure.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:38.753Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Source Index (`src`)

The `src` directory within `examples/demo-project/.spine/index` aggregates metadata and indexing records for the entire source code tree of the demo project. It forms the structural backbone of the ArchSpine mirror system's introspection layer, capturing how source directories and files are organized, validated, and tracked.

### Role & Responsibility

This directory defines the structural metadata schema for all source code directories and files. Its primary responsibility is to collectively record indexing provenance, dependency graphs, architectural rule enforcement, content integrity checks, and pipeline stage logging for the `src` hierarchy and its three sub‑layers: `api`, `domain`, and `infra`.

### Children Overview

| Entry | Type | Purpose |
|-------|------|---------|
| `api` | folder | Metadata definitions for indexing and analyzing API‑related source files. |
| `domain` | folder | Aggregates indexing records for domain logic source folders. |
| `infra` | folder | Metadata and indexing layer for database infrastructure (persistence, ORM mappings, etc.). |
| `folder.json` | config | Defines the structural hierarchy and metadata for the entire `src` directory tree. |

### Key Implementation Areas

- **Indexing Provenance**: Recorded at `indexedAt` timestamp (`2026-05-01T03:58:38.753Z`) using generator version `archspine/1.0.0`.
- **Pipeline Stages**: Two stages (`ast`, `llm`) are used for processing and enrichment.
- **Submodule Granularity**: Each subfolder (`api`, `domain`, `infra`) holds its own indexing records, allowing independent traversal and rule application per architectural layer.

The `folder.json` config acts as the root entry point for the `src` index, tying together the three concrete submodules and their respective metadata files.