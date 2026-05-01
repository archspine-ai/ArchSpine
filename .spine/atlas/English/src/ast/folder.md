<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/ast","role":"AST parsing and language discovery layer for the ArchSpine mirror system.","responsibility":"Provides a unified pipeline for parsing source code into structured symbols and imports using language-specific AST rules, managing language registrations, and discovering language composition across file collections.","children":[{"filePath":"src/ast/extractor.ts","role":"AST parsing service that extracts structural symbols and imports from source code using language-specific rule sets loaded from YAML configuration files.","fileKind":"source"},{"filePath":"src/ast/lang-discovery.ts","role":"AST language discovery and lifecycle module that scans file collections, resolves programming languages via extension mapping, computes deltas between snapshots, and validates language support.","fileKind":"source"},{"filePath":"src/ast/lang-registry.ts","role":"Stateful language configuration registry and dynamic language loader for the ArchSpine code analysis pipeline, managing AST-grep language bindings and file-to-language resolution.","fileKind":"source"},{"filePath":"src/ast/rules","role":"Language-specific grammar definitions for parsing source code into structured symbols.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:57:47.579Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/ast` — AST Parsing & Language Discovery Layer

This directory is the **parsing and language discovery core** of the ArchSpine mirror system. It provides a unified pipeline that transforms raw source code into structured symbols and import relationships using language-specific AST rules.

## Key Components

- **`extractor.ts`** — The central AST parsing service. It loads language-specific rule sets from YAML configuration files and extracts structural symbols (classes, functions, variables) and import statements from source code.

- **`lang-discovery.ts`** — The language discovery and lifecycle module. It scans file collections, resolves programming languages via file extension mapping, computes deltas between snapshots, and validates that all detected languages are supported.

- **`lang-registry.ts`** — A stateful registry that manages language configurations and dynamically loads AST-grep language bindings. It handles file-to-language resolution and ensures the analysis pipeline has access to the correct grammar definitions.

- **`rules/`** — A folder containing language-specific grammar definitions (YAML files) that define how each programming language's source code is parsed into structured symbols.

## Implementation Areas

The most critical implementation areas are:
1. **Language rule loading** — How YAML grammar definitions are discovered, validated, and applied during extraction.
2. **Snapshot delta computation** — How `lang-discovery.ts` tracks changes between file collection snapshots.
3. **Dynamic language binding** — How `lang-registry.ts` resolves and caches AST-grep bindings for each supported language.