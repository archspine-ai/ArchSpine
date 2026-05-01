<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src/domain","role":"This directory aggregates metadata and indexing records for a domain source folder within the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory define the structural metadata, file indexing provenance, and semantic entry for a TypeScript source file, ensuring content integrity, dependency tracking, and pipeline stage logging.","children":[{"filePath":"examples/demo-project/.spine/index/src/domain/folder.json","role":"Defines the structural metadata and indexing provenance for a domain source folder within the ArchSpine mirror system.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/domain/user-service.ts.json","role":"File metadata and semantic index entry for a TypeScript source file","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:35.021Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# Domain Index Directory

This directory (`domain`) is part of the ArchSpine mirror system's index layer. It stores metadata and indexing records for a domain source folder within the project's source tree.

## Contents

The directory contains two key configuration files:

- **`folder.json`** – Defines the structural metadata and indexing provenance for the domain source folder itself. This file records how and when the folder was indexed.
- **`user-service.ts.json`** – A file metadata and semantic index entry for a TypeScript source file (`user-service.ts`). This JSON record captures the file's role, dependencies, and content integrity information.

## Implementation Areas

The most important aspects of this directory are:

- **Structural Metadata** – `folder.json` provides the folder-level indexing record, establishing the context for all files within it.
- **File Indexing** – `user-service.ts.json` demonstrates how individual source files are tracked, including their semantic role and provenance.
- **Pipeline Integration** – The provenance data shows that indexing occurred through two pipeline stages: AST parsing and LLM analysis, ensuring both structural and semantic understanding.

## Provenance

The indexing was performed on May 1, 2026, using ArchSpine version 1.0.0, with both AST and LLM pipeline stages applied.