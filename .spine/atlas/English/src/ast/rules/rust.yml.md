# ArchSpine Mirror System: Pattern Configuration Summary

## Purpose
This document defines the extraction patterns used by ArchSpine to identify and mirror code elements from Rust source files. The patterns specify how to locate imports, exported items (functions, structs, traits, impl blocks, variables), and usages (function calls and member paths) using tree-sitter queries. These patterns are the backbone of ArchSpine's ability to construct an abstract syntax tree (AST)-based code mirror.

## Target Audience
This document is intended for developers who are building or extending the ArchSpine mirror system, especially those responsible for:
- Implementing or modifying code analysis logic.
- Generating or validating AST-based mirrors.
- Integrating new Rust language features or custom pattern matching.

It is also a reference for architects reviewing the system's structural extraction rules.

## Key Takeaways
- **Pattern Matching via tree-sitter**: All patterns are expressed as tree-sitter query rules, making them precise and composable. For example, export patterns use nested tree-sitter conditions to match function items that are not inside impl blocks.
- **Export Coverage**: The system covers function, struct, trait, impl, and variable definitions. Each export is assigned a semantic kind (e.g., `Function`, `Class`, `Interface`, `Type`, `Variable`), enabling downstream tools to interpret mirrored nodes.
- **Usage Capture**: Two usage patterns—`call` and `path`—capture relationships: function calls `$NAME($$$ARGS)` and member accesses `$OBJ::$NAME`. These feed into dependency and call-graph analyses.
- **Scope Boundaries**: The document explicitly excludes runtime behavior, user interface design, and language semantics beyond Rust. Its focus is purely on static code structure.

## Decisions and Workflows Anchored by This Document
- **Pattern Governance**: All changes to how code elements are extracted must be reflected here; it is the single source of truth for the extraction grammar.
- **Mirror Generation Workflow**: The build pipeline reads these patterns to generate a mirrored representation of the codebase. Any mismatch between patterns and actual code structure will break the mirror.
- **Cross-Referencing**: Tools that rely on mirrored data (e.g., dependency graphs, documentation generators) depend on the consistency of these patterns.