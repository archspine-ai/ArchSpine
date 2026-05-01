<!-- spine-content-hash:da10fedffd58638c6fcfd783590fd567b3de663411b19d272e5522401480b2b8 -->
# ArchSpine Go Pattern Definitions

## Purpose
This document defines the pattern-based grammar rules used by ArchSpine to extract structural symbols from Go source code. It specifies how imports, exports (functions, types, structs, interfaces, variables, constants), and usages (calls, selectors) are recognized and categorized.

## Context and Audience
Intended for developers maintaining the ArchSpine parser or extending its language support. It serves as the canonical reference for Go pattern definitions, ensuring consistent symbol extraction across the codebase.

## Key Responsibilities
- Specifying import, export, and usage pattern definitions for Go language constructs
- Maintaining the mapping between source code patterns and their semantic kinds (Function, Class, Interface, Type, Variable)

## Out of Scope
- Language-specific parsing logic beyond Go
- Runtime execution or compilation of the matched patterns
- User interface or visualization of the parsed results

## Key Takeaways
- Patterns are defined declaratively using a YAML-like structure with placeholders like `$NAME`, `$ARGS`, `$BODY`.
- Each export pattern is assigned a semantic kind (Function, Class, Interface, Type, Variable) for downstream indexing.
- Usage patterns capture how symbols are referenced (function calls, field/method selectors) to build dependency graphs.