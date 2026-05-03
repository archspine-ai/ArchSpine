# ArchSpine Pattern Language for Python Code Analysis

## Why This Document Exists
This document defines a pattern‑based language used by the ArchSpine mirror system to statically analyze Python source code. It specifies how to identify imports, exports, and usages (calls and property access) through concrete patterns and placeholders. The goal is to enable automated extraction and mapping of code entities so that ArchSpine can replicate code structures across mirrors.

## Who Should Read It
Developers and AI agents who maintain or extend the ArchSpine mirror system. It is also relevant for anyone contributing to the static analysis rules that parse Python import/export/usage relationships.

## Key Decisions and Workflows Anchored
- The pattern language is limited to Python syntax only. Non‑Python languages, runtime behavior, and documentation are explicitly out of scope.
- Placeholders such as `$NAME`, `$$$SYMBOLS`, `$$$ARGS`, `$VAL`, and `$OBJ` allow flexible matching against concrete code.
- Three categories of patterns: imports (from_import, simple_import), exports (function, class, async_function, variable, `__all__`), and usages (call, property).
- These patterns drive the parsing engine within ArchSpine’s code analysis pipeline, informing decisions about dependency tracking and structure mirroring.

## Pattern Overview
- **Import Patterns**: `from $SOURCE import $$$SYMBOLS` and `import $$$SYMBOLS` capture both explicit and wildcard imports.
- **Export Patterns**: Cover top‑level definitions: functions (including async), classes, variables, and the `__all__` list.
- **Usage Patterns**: Identify function calls and attribute/property accesses via `$NAME($$$ARGS)` and `$OBJ.$NAME`.

This document serves as the single source of truth for how ArchSpine interprets Python code boundaries.