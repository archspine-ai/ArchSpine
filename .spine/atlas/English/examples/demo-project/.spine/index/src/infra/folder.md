<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src/infra","role":"Metadata and indexing layer for the ArchSpine mirror system's database infrastructure.","responsibility":"Provides structural metadata, content integrity tracking, and provenance records for database-related source files and directories within the ArchSpine mirror system.","children":[{"filePath":"examples/demo-project/.spine/index/src/infra/database.ts.json","role":"Metadata and structural index for a TypeScript database infrastructure source file","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/infra/folder.json","role":"Defines the structural metadata and indexing provenance for a source code directory within the ArchSpine mirror system.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.643Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# infra/ — Metadata & Indexing Layer

This directory holds the structural metadata and content integrity records for the database infrastructure source files of the ArchSpine mirror system. It is part of the `.spine/index/src` hierarchy, which provides a machine-readable mirror of the project's source tree.

## Notable Children

- **database.ts.json** — A config-kind file that indexes a TypeScript database infrastructure source file. It contains structural metadata and provenance information for that specific source.
- **folder.json** — A config-kind file that defines the structural metadata and indexing provenance for the `infra/` directory itself, recording when and how the directory was indexed.

## Key Implementation Areas

- **Metadata Storage** — Both children are JSON files that store structural metadata (file paths, roles, kinds) and provenance records (index timestamps, generator version, pipeline stages).
- **Content Integrity Tracking** — The provenance block in each file records the indexing pipeline stages (`ast`, `llm`) used to generate the metadata, enabling traceability.
- **Provenance Records** — The `folder.json` file specifically tracks the directory-level indexing provenance, while `database.ts.json` tracks the file-level provenance.

## Concrete Submodules

- `database.ts.json` — Metadata for a TypeScript database infrastructure file.
- `folder.json` — Directory-level structural metadata and provenance.