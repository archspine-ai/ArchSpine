# ArchSpine TypeScript AST Extraction Rules

## Why This Document Exists
This document is a configuration file that defines the Abstract Syntax Tree (AST) extraction patterns for TypeScript source code inside the ArchSpine project. It tells the ArchSpine analysis engine exactly how to identify and extract three categories of code structures:
- **Import declarations** (named, default, namespace)
- **Export declarations** (functions, classes, interfaces, types, variables, default exports, export lists)
- **Usage references** (function calls, constructor invocations, property access)

Without these patterns, the engine would not know which syntactic forms to capture, and the entire code index used for automated documentation, dependency tracking, and governance enforcement would be incomplete or incorrect.

## Who Should Read It
- **Developers** maintaining the ArchSpine AST extraction engine (located under `src/ast/`).
- **AI agents** tasked with understanding how the metadata extraction pipeline works for TypeScript.
- **Contributors** who wish to add or modify extraction capabilities for TypeScript.

## What Workflows and Decisions It Anchors
- **Extraction accuracy**: Any change to how imports, exports, or usages are captured must be reflected here.
- **Grammar synchronization**: This file must stay in sync with the TypeScript grammar supported by the tree-sitter parser used by ArchSpine.
- **Language‑specific isolation**: Other programming languages have their own rule files in the same directory; modifications to TypeScript rules do not affect other languages.

## Key Takeaways
- The patterns are written using tree‑sitter query syntax.
- Each pattern has an identifier and may optionally be assigned a category (e.g., `Function`, `Class`, `Variable`) for higher‑level analysis.
- Import patterns cover the three standard forms: named, default, and namespace.
- Export patterns handle a wide variety of TypeScript constructs, including default exports and export lists.
- Usage patterns capture common references: function calls (`call`), object instantiation (`new`), and property access (`property`).
- The rules are language‑specific; they apply only to TypeScript.