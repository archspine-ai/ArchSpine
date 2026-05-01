<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src","role":"Aggregates metadata and indexing records for the source code directory tree within the ArchSpine mirror system.","responsibility":"Collectively defines the structural metadata schema for source code directories and files, including indexing provenance, dependency graphs, architectural rule enforcement, content integrity tracking, and pipeline stage logging for the src directory and its subdirectories (api, domain, infra).","children":[{"filePath":"examples/demo-project/.spine/index/src/api","role":"This directory contains metadata definitions for indexing and analyzing source code files within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/domain","role":"This directory aggregates metadata and indexing records for a domain source folder within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/folder.json","role":"Defines the structural hierarchy and metadata for the source code directory tree within the ArchSpine project.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/infra","role":"Metadata and indexing layer for the ArchSpine mirror system's database infrastructure.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:38.753Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Source Index (`src`)

This directory aggregates metadata and indexing records for the source code directory tree within the ArchSpine mirror system. It defines the structural metadata schema for source code directories and files, including indexing provenance, dependency graphs, architectural rule enforcement, content integrity tracking, and pipeline stage logging for the `src` directory and its subdirectories.

## Notable Children

- **`api/`** – Contains metadata definitions for indexing and analyzing source code files within the ArchSpine mirror system.
- **`domain/`** – Aggregates metadata and indexing records for a domain source folder within the ArchSpine mirror system.
- **`infra/`** – Provides the metadata and indexing layer for the ArchSpine mirror system's database infrastructure.
- **`folder.json`** – Defines the structural hierarchy and metadata for the source code directory tree within the ArchSpine project.

## Key Implementation Areas

- **Indexing Provenance**: Tracks when and how indexing was performed (`indexedAt`, `generatorVersion`).
- **Pipeline Stages**: Records the stages involved in processing (`ast`, `llm`).
- **Structural Metadata**: Defines the schema for directories and files, including their roles and relationships.
- **Dependency Graphs**: Supports analysis of dependencies between source code components.
- **Architectural Rule Enforcement**: Enables validation of architectural constraints.
- **Content Integrity Tracking**: Ensures the integrity of indexed content.