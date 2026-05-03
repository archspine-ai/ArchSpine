# ArchSpine Pattern Extraction Rules Document Summary

## Purpose
This document defines the pattern-based extraction rules that power the ArchSpine mirror system. It specifies how the system discovers and represents code structures — imports, exports (functions, structs, variables), and usages (calls, fields, pointer fields) — from source files. These rules are the configuration foundation for building an accurate, automatically synchronized code mirror.

## Audience
Primary readers are **ArchSpine system developers and maintainers** who need to understand, customize, or extend the extraction logic. The document is also useful for integrators who want to adapt the mirror system to new languages or codebases by modifying the pattern definitions.

## Key Decisions Anchored by This Document
- **Import detection**: The `#include` pattern (e.g., `#include $SOURCE`) sets the standard for locating external dependencies.
- **Export rules**: Three distinct patterns for functions, structs, and variables define how code elements are recognized as public API components.
  - Functions: `$RET $NAME($$$ARGS) { $$$BODY }`
  - Structs: Grammatical rule on `struct_specifier` with a type identifier.
  - Variables: `$TYPE $NAME = $VAL;`
- **Usage patterns**: Three patterns (`call`, `field`, `pointer_field`) specify how code interactions are tracked to establish connections within the mirror.
  - Calls: `$NAME($$$ARGS)`
  - Fields: `$OBJ.$NAME`
  - Pointer fields: `$OBJ->$NAME`

## Workflow Anchored
The patterns defined here are directly consumed by the ArchSpine mirror-building engine. When a developer runs the mirror generation process, these rules drive the analysis of source files, producing a structured representation of imports, exported symbols, and usage relationships. Any change to these patterns immediately affects the mirror's coverage and accuracy.