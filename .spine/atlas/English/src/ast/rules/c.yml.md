# ArchSpine C/C++ AST Extraction Rules

## Purpose
This document defines the exact syntactic patterns that the ArchSpine scanner uses to recognize C/C++ code constructs such as functions, structs, variables, includes, and usage references. It acts as the language-specific rule set for the AST extraction engine within the mirror system.

## Audience and Context
This document is intended for developers who maintain or extend ArchSpine’s language support, particularly for C/C++ codebases. It is also consumed automatically by the scanner to perform static analysis and symbol extraction. Understanding these rules is essential for adding new C/C++ constructs, debugging extraction issues, or porting the system to other dialects.

## Key Takeaways
- Patterns use a YAML-based DSL with placeholders like `$NAME`, `$RET`, `$ARGS`.
- Export rules map code structures to symbolic kinds (`Function`, `Class`, `Variable`) for the index.
- Usage rules capture how symbols are referenced (calls, field access) for dependency tracking.
- This rule set covers only C/C++; other languages have separate files.

## Workflows Anchored
- **Scanning pipeline**: The scanner loads this rule definition to recognize and extract symbols from C/C++ source files.
- **Index building**: Exports become entries in the system’s symbolic index.
- **Dependency analysis**: Usages feed into the mirror’s dependency graph construction.

---