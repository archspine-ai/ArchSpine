<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/.spine/rules","role":"Defines the architectural rules and directory structure for the ArchSpine mirror system's rule engine.","responsibility":"Collectively establishes the schema, metadata, and organizational framework for rule files within the .spine/rules directory, enabling rule indexing, drift detection, and configuration management.","children":[{"filePath":"examples/demo-project/.spine/index/.spine/rules/arch.yml.json","role":"Architecture rule definition for the ArchSpine mirror system","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/.spine/rules/folder.json","role":"Defines the directory structure and metadata for a rules folder within the ArchSpine project, serving as a container for configuration documents.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.692Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Rules Directory

This directory (`examples/demo-project/.spine/index/.spine/rules`) defines the architectural rules and directory structure for the ArchSpine mirror system's rule engine. It collectively establishes the schema, metadata, and organizational framework for rule files within the `.spine/rules` directory, enabling rule indexing, drift detection, and configuration management.

## Notable Children

- **`arch.yml.json`** – Architecture rule definition for the ArchSpine mirror system. This file serves as a configuration document that defines the core architectural rules.
- **`folder.json`** – Defines the directory structure and metadata for a rules folder within the ArchSpine project, acting as a container for configuration documents.

## Implementation Areas

The most critical implementation areas in this directory are:
- **Rule Indexing**: The schema and metadata structures that allow rules to be indexed and queried efficiently.
- **Drift Detection**: The rules and configurations that enable detection of deviations from the defined architecture.
- **Configuration Management**: The organizational framework that manages rule files and their relationships.