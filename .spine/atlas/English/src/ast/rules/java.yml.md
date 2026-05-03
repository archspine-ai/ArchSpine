# Document Summary: Java AST Extraction Rules for ArchSpine

## Purpose
This document is a machine-readable ruleset that teaches ArchSpine how to parse Java source code into structured knowledge. By defining patterns for imports, exports (classes and interfaces), and usages (method calls and instantiations), it enables the system to build a detailed index of code dependencies, public API surfaces, and usage relationships. This is a foundational building block for ArchSpine’s ability to analyze, visualize, and govern codebases automatically.

## Audience
This rules file is intended for developers contributing to ArchSpine’s language support, as well as for the ArchSpine runtime engine that reads these patterns to perform static analysis. It is not meant for end‑user consumption; rather, it is a configuration artifact within the `.spine/atlas` and `.spine/index` directories. The primary audience is the development team maintaining ArchSpine’s AST extraction capabilities and any contributors adding support for new languages.

## Key Takeaways
- The file defines Java‑specific AST extraction rules in a compact YAML format.
- It covers three categories: imports, exports (classes/interfaces), and usages (calls/instantiations).
- Patterns use a template language with placeholders like `$NAME`, `$BODY`, and `$ARGS` to match code structures.
- This file is one of many language‑specific rule files; each language (TypeScript, Python, Go, etc.) has its own corresponding YAML file.
- Without such a rules file, ArchSpine cannot parse the corresponding language and thus cannot provide insight into that language’s codebase.

## Decisions and Workflows Anchored by This Document
- **Pattern Design**: The rules define exactly how to extract imports, class/interface declarations, and method calls. Any change to these patterns affects the entire dependency graph and public API index.
- **Scanner Workflow**: The ArchSpine scanner uses these patterns as the sole grammar for Java; the YAML structure determines what nodes are captured and how they are labeled (e.g., `kind: Class`).
- **Aggregator Workflow**: The aggregator relies on extracted usages (calls and instantiations) to compute cross-file references, making this file the central contract for dependency resolution.