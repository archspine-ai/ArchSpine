# ArchSpine C/C++ AST Extraction Rules: Document Summary

## Purpose
This document specifies the AST extraction rules for C and C++ languages used by the ArchSpine system to parse and index source code symbols. It defines how the system identifies imports, exported symbols, and usage patterns from C/C++ source files, enabling construction of the ArchSpine knowledge graph for code analysis and mirroring.

## Intended Audience
Developers and AI agents who need to understand how C/C++ code is analyzed for import detection, symbol export, and usage tracking within the ArchSpine knowledge graph. This includes anyone implementing or extending the extraction logic, as well as consumers of the extracted data who need to interpret the symbol relationships indexed by the system.

## What the Document Defines
The document anchors three key extraction workflows:

- **Import detection**: How `#include` directives are recognized as source imports (pattern: `#include $SOURCE`).
- **Symbol export**: How functions, classes, structs, namespaces, and template classes are extracted as exported symbols. Each export rule specifies the AST node kind, the pattern for capturing the symbol name and optional signature, and the assigned symbol kind (e.g., Function, Class, Type).
- **Usage detection**: How three types of usages are identified: direct function calls (`$NAME($$$ARGS)`), scoped access with `::` (`$OBJ::$NAME`), and method calls with `.` (`$OBJ.$NAME($$$ARGS)`).

## Decisions Anchored
The document fixes:
- Which C/C++ constructs are treated as imports, exports, or usages.
- The exact AST patterns used to extract each symbol type.
- The mapping from AST kinds to semantic symbol categories (Function, Class, Type).
- The scope of extraction: it explicitly does **not** cover lambdas, `constexpr`, advanced template metaprogramming, macros, preprocessor directives beyond includes, or attribute annotations. It also does not enforce any architectural rules, naming conventions, or project-specific policies.

## Key Takeaways
- Imports are extracted from `#include` directives.
- Exports include functions, classes, structs, namespaces, and template classes, each with their name and (where applicable) signature.
- Usages cover function calls, scoped access (::), and method calls (.).
- The rules are limited to fundamental AST patterns and intentionally exclude more advanced C++ features.