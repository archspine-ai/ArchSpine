<!-- spine-content-hash:764067e49382a73c612f61a9787f7dbdccb062c9e49fdfbdef2d4e4c5ebe60c6 -->
# ArchSpine C/C++ Pattern Grammar

## Purpose
This document defines the pattern-based grammar rules used by ArchSpine to parse and mirror C/C++ source code structures. It specifies how imports, exports, and usages are identified and extracted from source files.

## Context & Audience
Intended for developers and AI agents working on the ArchSpine mirror system who need to understand or modify the source code parsing rules. It is also relevant for anyone integrating C/C++ code analysis into the ArchSpine framework.

## Key Responsibilities
- **Import Patterns**: Specifying how `#include` directives and other import mechanisms are recognized.
- **Export Patterns**: Defining patterns for exported functions, structs (classes), and variables.
- **Usage Patterns**: Describing how function calls, field access, and pointer field access are matched.

## Out of Scope
- Language-specific semantics beyond C/C++ syntax.
- Runtime behavior or execution logic.
- Project-specific business rules or domain logic.

## Key Takeaways
- The document defines three main categories: imports, exports, and usages.
- Exports cover functions, structs (classes), and variables.
- Usages cover function calls, field access, and pointer field access.
- Patterns use a template syntax with placeholders like `$NAME`, `$TYPE`, `$RET`, etc.

## Invariants
No invariants are currently defined for this component.

## Public Surface
No public surface elements are currently exported from this document.

## Drift Detection
No drift detected.